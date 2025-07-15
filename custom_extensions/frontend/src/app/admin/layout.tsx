import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Panel - Credits Management',
  description: 'Admin interface for managing user credits',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="admin-layout">
      {children}
    </div>
  )
} 