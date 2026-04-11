import { getPayload } from 'payload'
import config from '@payload-config'

export async function getAdminUser(requestHeaders: Headers) {
  const payload = await getPayload({ config })
  const result = await payload.auth({ headers: requestHeaders })

  return result.user ?? null
}
