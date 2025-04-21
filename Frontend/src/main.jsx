import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ToastContainer } from 'react-toastify'
import '@fontsource/inter/400.css'; // Regular weight
import '@fontsource/inter/500.css'; // Medium weight
import '@fontsource/inter/600.css'; // Semi-bold
import '@fontsource/inter/700.css'; // Bold

createRoot(document.getElementById('root')).render(
    <>
    <App />
    <ToastContainer/>
    </>
,
)
