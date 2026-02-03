import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Heading,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Stack,
  Text,
  Alert,
  AlertIcon,
  Link,
  HStack,
} from '@chakra-ui/react'
import { FormEvent, useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'

import { saveAuth } from '../authStorage'

export default function SignIn() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [showPassword, setShowPassword] = useState(false)

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

      const contentType = response.headers.get('content-type') || ''
      const data = contentType.includes('application/json')
        ? await response.json()
        : { error: await response.text() }
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
    <Box bg="white" p={10} rounded="2xl" shadow="xl" border="1px solid" borderColor="gray.100">
      <Box textAlign="center" mb={6}>
        <HStack spacing={2} justify="center" mb={4}>
          <Box w="46px" h="46px" rounded="full" bg="gray.50" border="1px solid" borderColor="gray.200" display="flex" alignItems="center" justifyContent="center">
            <Text fontWeight="bold" color="gray.700">FB</Text>
          </Box>
          <Text fontSize="2xl" fontWeight="bold">FBIS DevOptics</Text>
        </HStack>
        <Heading size="lg" mb={2}>Welcome back</Heading>
        <Text color="gray.600">
          Sign in to access your monitoring dashboard
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
        <Button type="submit" colorScheme="blue" size="lg">Sign in</Button>
        <Divider />
        <Button variant="outline">Continue with Google</Button>
        <Text textAlign="center" color="gray.500">
          Don&apos;t have an account?{' '}
          <Link as={RouterLink} to="/auth/sign-up" color="blue.600" fontWeight="semibold">
            Sign up
          </Link>
        </Text>
      </Stack>
    </Box>
  )
}
