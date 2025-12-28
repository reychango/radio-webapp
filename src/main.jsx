import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import RadioApp from './RadioApp.jsx'

console.log("V35 ORIGINAL DESIGN");

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RadioApp />
  </StrictMode>,
)
