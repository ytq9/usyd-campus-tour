import React from 'react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import ContentWizard from '@/components/admin/ContentWizard'
import { getAdminUser } from '@/lib/adminUser'

export const dynamic = 'force-dynamic'

export default async function ContentWizardPage() {
  const requestHeaders = new Headers(await headers())
  const user = await getAdminUser(requestHeaders)

  if (!user) {
    redirect('/admin/login?redirect=%2Fadmin%2Fcontent-wizard')
  }

  return <ContentWizard />
}
