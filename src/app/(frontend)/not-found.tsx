import React from 'react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-ochre mb-4">404</h1>
        <h2 className="text-2xl mb-2">Page Not Found</h2>
        <p className="text-gray-400 mb-6">The tour or scene you're looking for doesn't exist.</p>
        <Link href="/" className="d-btn bg-ochre text-white hover:bg-orange-700">
          Back to Tours
        </Link>
      </div>
    </div>
  )
}
