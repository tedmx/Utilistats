import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import { Layout } from './layouts/Layout'
import { AuthGuard } from './components/auth/AuthGuard'

import { LoginPage } from './pages/LoginPage'
import { Dashboard } from './pages/Dashboard'
import { PropertyPage } from './pages/PropertyPage'
import { PropertyEditPage } from './pages/PropertyEditPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Публичный маршрут */}
        <Route path="/login" element={<LoginPage />} /> 

        <Route 
          element={
            <AuthGuard>
              <Layout />
            </AuthGuard>
          }
        >
          {/* Все эти страницы отрендерятся внутри <Outlet /> в Layout */}
          <Route path="/" element={<Dashboard />} />
          <Route path="/property/:id" element={<PropertyPage />} />
          <Route path="/property/new" element={<PropertyEditPage />} />
          <Route path="/property/:id/edit" element={<PropertyEditPage />} />
        </Route>

        {/* 3. Редирект для несуществующих страниц */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
