import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Panel - Dashboard',
  description: 'Admin interface for managing user credits, analytics, and features',
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