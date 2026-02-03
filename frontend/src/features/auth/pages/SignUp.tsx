import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  Text,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { FormEvent, useState } from 'react'

import { saveAuth } from '../authStorage'

export default function SignUp() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('viewer')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/v1/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password, role }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Unable to sign up')
      }

      saveAuth(data)
      setSuccess(`Account created for ${data.user.fullName}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign up')
    }
  }

  return (
    <Box bg="white" p={8} rounded="lg" shadow="md">
      <Heading size="lg" mb={2}>Create an account</Heading>
      <Text color="gray.600" mb={6}>
        Choose a role to define access for this user.
      </Text>
      <Stack spacing={4} as="form" onSubmit={handleSubmit}>
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
        <FormControl isRequired>
          <FormLabel>Full name</FormLabel>
          <Input
            placeholder="Jane Doe"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            placeholder="jane@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            placeholder="Create a password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Role</FormLabel>
          <Select value={role} onChange={(event) => setRole(event.target.value)}>
            <option value="admin">Admin (full access)</option>
            <option value="manager">Manager (manage teams)</option>
            <option value="analyst">Analyst (view analytics)</option>
            <option value="viewer">Viewer (read-only)</option>
          </Select>
        </FormControl>
        <Button type="submit" colorScheme="blue" size="lg">Create account</Button>
      </Stack>
    </Box>
  )
}
