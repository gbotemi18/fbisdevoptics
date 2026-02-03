import { Routes, Route, Link } from 'react-router-dom'
import { Box, Button, Grid, GridItem, HStack, Text } from '@chakra-ui/react'

import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import AccessMatrix from './pages/AccessMatrix'
import { clearAuth, getUser } from './authStorage'

export default function AuthModule() {
  const user = getUser()

  return (
    <Box>
      <HStack spacing={4} mb={6} justify="space-between" flexWrap="wrap">
        <HStack spacing={4}>
          <Button as={Link} to="/auth/sign-in" variant="outline" colorScheme="blue">
            Sign in
          </Button>
          <Button as={Link} to="/auth/sign-up" colorScheme="blue">
            Sign up
          </Button>
        </HStack>
        {user && (
          <HStack spacing={3}>
            <Text color="gray.600">Signed in as {user.fullName} ({user.role})</Text>
            <Button size="sm" variant="ghost" onClick={clearAuth}>Sign out</Button>
          </HStack>
        )}
      </HStack>
      <Grid templateColumns={{ base: '1fr', lg: '1.1fr 0.9fr' }} gap={6}>
        <GridItem>
          <Routes>
            <Route path="/" element={<SignIn />} />
            <Route path="/sign-in" element={<SignIn />} />
            <Route path="/sign-up" element={<SignUp />} />
          </Routes>
        </GridItem>
        <GridItem>
          <AccessMatrix />
        </GridItem>
      </Grid>
    </Box>
  )
}
