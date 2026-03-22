import type { Access } from 'payload'

export const publishedOrAdmin: Access = ({ req: { user } }) => {
  if (user) return true
  return {
    _status: { equals: 'published' },
  }
}
