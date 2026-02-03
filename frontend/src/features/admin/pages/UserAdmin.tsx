import { useEffect, useState } from 'react'
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'

import { getToken } from '../../auth/authStorage'

interface UserRow {
  id: string
  fullName: string
  email: string
  role: string
}

export default function UserAdmin() {
  const [users, setUsers] = useState<UserRow[]>([])
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('viewer')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const loadUsers = async () => {
    setError('')
    const token = getToken()
    if (!token) {
      setError('Sign in as admin to manage users.')
      return
    }

    const res = await fetch('/api/v1/admin/users', {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error || 'Failed to load users')
      return
    }

    const data = await res.json()
    setUsers(data.users)
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const handleCreate = async () => {
    setError('')
    setSuccess('')
    const token = getToken()
    if (!token) {
      setError('Sign in as admin to manage users.')
      return
    }

    const res = await fetch('/api/v1/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ fullName, email, password, role }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed to create user')
      return
    }

    setSuccess('User created')
    setFullName('')
    setEmail('')
    setPassword('')
    setRole('viewer')
    await loadUsers()
  }

  const handleRoleChange = async (userId: string, nextRole: string) => {
    setError('')
    setSuccess('')
    const token = getToken()
    if (!token) {
      setError('Sign in as admin to manage users.')
      return
    }

    const res = await fetch(`/api/v1/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ role: nextRole }),
    })

    const data = await res.json()
    if (!res.ok) {
      setError(data.error || 'Failed to update role')
      return
    }

    setSuccess('Role updated')
    await loadUsers()
  }

  return (
    <Box>
      <Heading size="lg" mb={4}>User Administration</Heading>
      <Stack spacing={4} mb={6} maxW="xl">
        {error && (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        )}
        {success && (
          <Alert status="success">
            <AlertIcon />
            {success}
          </Alert>
        )}
        <FormControl>
          <FormLabel>Full name</FormLabel>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Email</FormLabel>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Password</FormLabel>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </FormControl>
        <FormControl>
          <FormLabel>Role</FormLabel>
          <Select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="analyst">Analyst</option>
            <option value="viewer">Viewer</option>
          </Select>
        </FormControl>
        <Button colorScheme="blue" onClick={handleCreate}>Create user</Button>
      </Stack>

      <Box bg="white" rounded="lg" shadow="sm" p={4} overflowX="auto">
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map((user) => (
              <Tr key={user.id}>
                <Td>{user.fullName}</Td>
                <Td>{user.email}</Td>
                <Td>
                  <Select
                    size="sm"
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="analyst">Analyst</option>
                    <option value="viewer">Viewer</option>
                  </Select>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  )
}
