import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  Text,
  Alert,
  AlertIcon,
} from '@chakra-ui/react'
import { FormEvent, useState } from 'react'

import { saveAuth } from '../authStorage'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || 'Unable to sign in')
      }

      saveAuth(data)
      setSuccess(`Welcome back, ${data.user.fullName}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in')
    }
  }

  return (
    <Box bg="white" p={8} rounded="lg" shadow="md">
      <Heading size="lg" mb={2}>Sign in</Heading>
      <Text color="gray.600" mb={6}>
        Access your FBIS DevOptics workspace.
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
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Password</FormLabel>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </FormControl>
        <Button type="submit" colorScheme="blue" size="lg">Sign in</Button>
        <Divider />
        <Button variant="outline">Continue with Google</Button>
      </Stack>
    </Box>
  )
}
