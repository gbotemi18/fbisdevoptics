import { Tag } from '@chakra-ui/react'

type Role = 'admin' | 'manager' | 'analyst' | 'viewer'

const roleColor: Record<Role, string> = {
  admin: 'red',
  manager: 'purple',
  analyst: 'blue',
  viewer: 'gray',
}

export default function RoleBadge({ role }: { role: Role }) {
  return (
    <Tag colorScheme={roleColor[role]} size="sm" textTransform="capitalize">
      {role}
    </Tag>
  )
}
