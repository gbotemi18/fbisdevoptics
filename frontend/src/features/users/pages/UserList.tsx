import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { AppDispatch, RootState } from '@core/store'
import { fetchUsers } from '../store/userSlice'

export default function UserList() {
  const dispatch = useDispatch<AppDispatch>()
  const { users, loading } = useSelector((state: RootState) => state.user)

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  if (loading) return <div>Loading...</div>

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Users</h2>
      <div className="grid grid-cols-1 gap-4">
        {users.map((user) => (
          <div key={user.id} className="p-4 border rounded">
            <p className="font-semibold">{user.name}</p>
            <p className="text-gray-600">{user.email}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
