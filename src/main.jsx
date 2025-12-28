import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import RadioApp from './RadioAppEmbed.jsx'

console.log("V36 EMBEDDED PLAYER");

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RadioApp />
  </StrictMode>,
)
