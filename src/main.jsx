import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import RadioApp from './RadioApp.jsx'

console.log("V3 WIDGET LOADED");

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RadioApp />
  </StrictMode>,
)
