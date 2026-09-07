import { useCallback, useEffect, useRef, useState } from 'react';
import api, { socket } from '../../services/realtimeApi';
import { apiError } from './farmUtils';
export const defaultSettings = { soilThreshold: 40, airThreshold: 50, tempThreshold: 35, lightThreshold: 80, mode: null, pumpStatus: null };
const endpoints = { settings: '/settings', sensor: '/sensors/latest', history: '/sensors/history', logs: '/logs' };
export default function useFarm(keys = 'settings,sensor,history,logs') {
  const [data, setData] = useState({ settings: defaultSettings, sensor: {}, history: [], logs: [] });
  const [errors, setErrors] = useState({});
  const [ready, setReady] = useState({});
  const [loading, setLoading] = useState(true);
  const reload = useRef(()=>{});
  const retry = useCallback(()=>reload.current(), []);
  useEffect(() => {
    let active = true;
    let inFlight = false;
    const controller = new AbortController();
    const requested = keys.split(',');
    const load = async () => {
      if (inFlight) return;
      inFlight = true;
      const results = await Promise.allSettled(requested.map(async key => {
        const response = await api.get('/farm' + endpoints[key], { signal: controller.signal });
        if (!response.data.success) throw new Error('Phản hồi API không hợp lệ');
        return response.data.data;
      }));
      if (!active) return;
      results.forEach((result, index) => {
        const key = requested[index];
        if (result.status === 'fulfilled') {
          const value = result.value;
          setData(d => ({...d, [key]: key === 'settings' ? {...defaultSettings, ...value} : key === 'sensor' ? value || {} : Array.isArray(value) ? value : []}));
          setReady(r => ({...r,[key]: key !== 'settings' || !!value}));
          setErrors(e => ({...e,[key]:''}));
        } else {
          setErrors(e => ({...e,[key]:apiError(result.reason)}));
        }
      });
      setLoading(false);
      inFlight = false;
    };
    reload.current = load;
    const onSensor = sensor => { if(active) setData(d=>({...d,sensor,history:[...d.history.filter(r=>r._id!==sensor._id),sensor].slice(-20)})); };
    const onSettings = settings => { if(active) setData(d=>({...d,settings:{...d.settings,...settings}})); };
    load();
    socket.on('sensor_update', onSensor);
    socket.on('pump_status_change', onSettings);
    socket.on('settings_update', onSettings);
    socket.on('logs_update', load);
    socket.on('connect', load);
    const timer = setInterval(load, 15000);
    return () => {active=false; controller.abort();clearInterval(timer);socket.off('sensor_update',onSensor);socket.off('pump_status_change',onSettings);socket.off('settings_update',onSettings);socket.off('logs_update',load);socket.off('connect',load);};
  }, [keys]);
  return {...data, setData, ready, loading, retry, errors, error: [...new Set(Object.values(errors).filter(Boolean))].join(' ')};
}
