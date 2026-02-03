import { useParams } from 'react-router-dom'

export default function UserDetail() {
  const { id } = useParams<{ id: string }>()

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">User Details</h2>
      <p>Loading user {id}...</p>
    </div>
  )
}
