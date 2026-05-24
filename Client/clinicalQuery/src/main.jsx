import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import AdminDashboard from './AdminDashboard.jsx'
import App from './App.jsx'


const router = createBrowserRouter([
  { path: '/', element: <App /> },
  { path: '/admin', element: <AdminDashboard /> }

])



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
