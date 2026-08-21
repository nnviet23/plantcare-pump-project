import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Xóa dấu ! ở sau getElementById('root')
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)