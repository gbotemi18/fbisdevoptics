import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Select,
  Stack,
  Text,
  Alert,
  AlertIcon,
  Link,
  HStack,
  Divider,
} from '@chakra-ui/react'
import { FormEvent, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'

import { saveAuth } from '../authStorage'

export default function SignUp() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('viewer')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

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

      const contentType = response.headers.get('content-type') || ''
      const data = contentType.includes('application/json')
        ? await response.json()
        : { error: await response.text() }
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
    <Box bg="white" p={10} rounded="2xl" shadow="xl" border="1px solid" borderColor="gray.100">
      <Box textAlign="center" mb={6}>
        <HStack spacing={2} justify="center" mb={4}>
          <Box w="46px" h="46px" rounded="full" bg="gray.50" border="1px solid" borderColor="gray.200" display="flex" alignItems="center" justifyContent="center">
            <Text fontWeight="bold" color="gray.700">FB</Text>
          </Box>
          <Text fontSize="2xl" fontWeight="bold">FBIS DevOptics</Text>
        </HStack>
        <Heading size="lg" mb={2}>Create account</Heading>
        <Text color="gray.600">
          Sign up to start monitoring your systems
        </Text>
      </Box>
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
          <FormLabel>Username</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none" color="gray.400">
              <span>👤</span>
            </InputLeftElement>
            <Input
              placeholder="Enter your username"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
            />
          </InputGroup>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none" color="gray.400">
              <span>✉️</span>
            </InputLeftElement>
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </InputGroup>
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Password</FormLabel>
          <InputGroup>
            <InputLeftElement pointerEvents="none" color="gray.400">
              <span>🔒</span>
            </InputLeftElement>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <InputRightElement>
              <Button size="sm" variant="ghost" onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword ? '🙈' : '👁️'}
              </Button>
            </InputRightElement>
          </InputGroup>
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
        <Divider />
        <Text textAlign="center" color="gray.500">
          Already have an account?{' '}
          <Link as={RouterLink} to="/auth/sign-in" color="blue.600" fontWeight="semibold">
            Sign in
          </Link>
        </Text>
      </Stack>
    </Box>
  )
}
