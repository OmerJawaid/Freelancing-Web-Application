// Frontend/src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/Authcontext.jsx';
import 'react-toastify/dist/ReactToastify.css';
import '@fontsource/inter/400.css'; // Regular weight
import '@fontsource/inter/500.css'; // Medium weight
import '@fontsource/inter/600.css'; // Semi-bold
import '@fontsource/inter/700.css'; // Bold

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
)

//     <>
//     <App />
//     <ToastContainer/>
//     </>
// ,
// )

