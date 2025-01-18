"use client"

import { Suspense } from 'react'
import WalletDashboard from '@/components/wallet-dashboard'

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    }>
      <main className="min-h-screen bg-background">
        <WalletDashboard />
      </main>
    </Suspense>
  )
}