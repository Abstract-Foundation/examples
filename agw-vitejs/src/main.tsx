import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AbstractProvider } from './components/AbstractProvider';
import App from './App.tsx'
import './main.css'

const root = document.getElementById('root')!

createRoot(root).render(
  <StrictMode>
    <AbstractProvider>
      <App />
    </AbstractProvider>
  </StrictMode>,
)
