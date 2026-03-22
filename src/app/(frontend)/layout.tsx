import React from 'react'
import '@/styles/globals.css'

export const metadata = {
  title: 'USYD Campus Tour',
  description: 'Explore the University of Sydney campus in 360°',
}

export default function FrontendLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="light">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
