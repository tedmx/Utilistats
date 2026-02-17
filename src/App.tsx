import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { PropertyPage } from './pages/PropertyPage'
import { Layout } from './layouts/Layout'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="property/:id" element={<PropertyPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
