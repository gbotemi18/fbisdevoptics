import { Routes, Route } from 'react-router-dom'
import UserAdmin from './pages/UserAdmin'

export default function AdminModule() {
  return (
    <Routes>
      <Route path="/users" element={<UserAdmin />} />
      <Route path="/" element={<UserAdmin />} />
    </Routes>
  )
}
