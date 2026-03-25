/**
 * Reset admin password or create a new admin user.
 * Usage: npx tsx src/seed/reset-password.ts
 */

import { getPayload } from 'payload'
import config from '../payload.config'

async function resetPassword() {
  const payload = await getPayload({ config })

  const email = 'admin@usyd.edu.au'
  const password = 'admin123'

  // Check if user exists
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
  })

  if (existing.totalDocs > 0) {
    // Reset password
    await payload.update({
      collection: 'users',
      id: existing.docs[0].id,
      data: { password },
    })
    console.log(`Password reset for: ${email}`)
  } else {
    // Create new admin
    await payload.create({
      collection: 'users',
      data: { email, password },
    })
    console.log(`Created new admin: ${email}`)
  }

  console.log(`\nLogin credentials:`)
  console.log(`  Email:    ${email}`)
  console.log(`  Password: ${password}`)

  process.exit(0)
}

resetPassword().catch((err) => {
  console.error('Failed:', err)
  process.exit(1)
})
