import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'


import './index.css';
import './App.css';
import './styles/LandingPage.style.css';
import './styles/LoginPage.style.css';
import './styles/RegisterPage.style.css';
import './styles/HeaderComponent.style.css';
import './styles/main.css'

import { AuthProvider } from './context/AuthContext';

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>
  </BrowserRouter>
    ,
)
