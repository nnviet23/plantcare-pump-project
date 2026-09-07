import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import { searchFeatures } from './farmUtils';
export default function FeatureSearch() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(0);
  const ref = useRef(null);
  const navigate = useNavigate();
  const results = searchFeatures(query);
  useEffect(() => {
    const close = e => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    return () => document.removeEventListener('pointerdown', close);
  }, []);
  function choose(item) { navigate(item.path); setQuery(''); setOpen(false); }
  return <form ref={ref} className="sf-search" role="search" onSubmit={e => {e.preventDefault(); if(results[selected]) choose(results[selected]);}}>
    <Search size={21}/>
    <input role="combobox" aria-label="Tìm chức năng" aria-expanded={open && !!query.trim()} aria-controls="feature-results" aria-autocomplete="list" aria-activedescendant={open && results.length ? `feature-result-${selected}` : undefined}
      placeholder="Tìm kiếm thiết bị, dữ liệu, chức năng..." value={query}
      onFocus={()=>setOpen(true)} onChange={e=>{setQuery(e.target.value);setSelected(0);setOpen(true);}}
      onKeyDown={e=>{if(e.key==='Escape')setOpen(false);if(e.key==='ArrowDown'){e.preventDefault();setOpen(true);setSelected(i=>Math.min(i+1,results.length-1));}if(e.key==='ArrowUp'){e.preventDefault();setSelected(i=>Math.max(0,i-1));}}}/>
    {query && <button className="plain" type="button" aria-label="Xóa tìm kiếm" onClick={()=>{setQuery('');ref.current?.querySelector('input')?.focus();}}><X size={16}/></button>}
    {open && query.trim() && <div className="search-results" id="feature-results" role="listbox" aria-label="Kết quả tìm kiếm">
      {results.map((item,i)=><button type="button" role="option" aria-selected={selected===i} id={`feature-result-${i}`} key={item.path} onMouseEnter={()=>setSelected(i)} onClick={()=>choose(item)}><span><b>{item.title}</b><small>{item.description}</small></span><ArrowRight size={16}/></button>)}
      {!results.length && <p role="status">Không có chức năng phù hợp. Thử “máy bơm”, “độ ẩm”, “lịch sử” hoặc “AI”.</p>}
    </div>}
  </form>;
}
