import { Box, Heading, Stack, Text } from '@chakra-ui/react'
import RoleBadge from '../components/RoleBadge'

const roles = [
  {
    role: 'admin',
    description: 'Full visibility and approval rights across the platform.',
  },
  {
    role: 'manager',
    description: 'Manage teams, approve workflows, view all dashboards.',
  },
  {
    role: 'analyst',
    description: 'Access analytics, reports, and operational insights.',
  },
  {
    role: 'viewer',
    description: 'Read-only access to assigned dashboards and metrics.',
  },
] as const

export default function AccessMatrix() {
  return (
    <Box bg="white" p={8} rounded="lg" shadow="md">
      <Heading size="md" mb={4}>Role access overview</Heading>
      <Stack spacing={4}>
        {roles.map((item) => (
          <Box key={item.role}>
            <RoleBadge role={item.role} />
            <Text mt={2} color="gray.600">{item.description}</Text>
          </Box>
        ))}
      </Stack>
    </Box>
  )
}
