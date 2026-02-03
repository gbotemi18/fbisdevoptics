import { useEffect, useState } from 'react'
import { Box, Heading, Text, VStack } from '@chakra-ui/react'

interface ClusterHealth {
  clusterName: string
  status: string
  timestamp: string
  signals: Record<string, string>
}

export default function Overview() {
  const [health, setHealth] = useState<ClusterHealth | null>(null)

  useEffect(() => {
    fetch('/api/v1/k8s/health/default')
      .then((res) => res.json())
      .then(setHealth)
      .catch(() => setHealth(null))
  }, [])

  return (
    <Box>
      <Heading size="lg" mb={4}>Kubernetes Monitoring</Heading>
      {health ? (
        <VStack align="start" spacing={2}>
          <Text><strong>Cluster:</strong> {health.clusterName}</Text>
          <Text><strong>Status:</strong> {health.status}</Text>
          <Text><strong>Timestamp:</strong> {health.timestamp}</Text>
          <Text><strong>Note:</strong> {health.signals?.note}</Text>
        </VStack>
      ) : (
        <Text>Waiting for health snapshot...</Text>
      )}
    </Box>
  )
}
