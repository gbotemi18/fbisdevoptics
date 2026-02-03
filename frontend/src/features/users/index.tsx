import { Routes, Route } from 'react-router-dom'
import UserList from './pages/UserList'
import UserDetail from './pages/UserDetail'

export default function UserModule() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<UserList />} />
        <Route path="/:id" element={<UserDetail />} />
      </Routes>
    </div>
  )
}
