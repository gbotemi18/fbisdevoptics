import { useEffect, useState } from 'react'
import { Box, Heading, Text, VStack, Alert, AlertIcon } from '@chakra-ui/react'

import { getToken, getUser } from '../../auth/authStorage'

interface ClusterHealth {
  clusterName: string
  status: string
  timestamp: string
  signals: Record<string, string>
}

export default function Overview() {
  const [health, setHealth] = useState<ClusterHealth | null>(null)
  const [error, setError] = useState('')
  const user = getUser()

  useEffect(() => {
    const token = getToken()
    if (!token) {
      setError('Sign in to view cluster health.')
      return
    }

    fetch('/api/v1/k8s/health/default', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json()
          throw new Error(body.error || 'Unable to load health')
        }
        return res.json()
      })
      .then(setHealth)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <Box>
      <Heading size="lg" mb={4}>Kubernetes Monitoring</Heading>
      {user && (
        <Text color="gray.600" mb={4}>
          Role: {user.role}. Admins have full access.
        </Text>
      )}
      {error && (
        <Alert status="warning" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      {health ? (
        <VStack align="start" spacing={2}>
          <Text><strong>Cluster:</strong> {health.clusterName}</Text>
          <Text><strong>Status:</strong> {health.status}</Text>
          <Text><strong>Timestamp:</strong> {health.timestamp}</Text>
          <Text><strong>Note:</strong> {health.signals?.note}</Text>
        </VStack>
      ) : (
        !error && <Text>Waiting for health snapshot...</Text>
      )}
    </Box>
  )
}
