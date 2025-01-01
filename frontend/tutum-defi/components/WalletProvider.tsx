// components/WalletProvider.tsx
'use client'

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi'
import { bscTestnet, Chain } from 'viem/chains'
import { WagmiConfig } from 'wagmi'
import { useEffect, useState } from 'react'

const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID!

const metadata = {
  name: 'Tutum DeFi',
  description: 'Tutum DeFi Platform',
  url: 'https://tutum.finance',
  icons: ['https://tutum.finance/icon.png']
}

const chains: readonly [Chain, ...Chain[]] = [bscTestnet]
const wagmiConfig = defaultWagmiConfig({
  chains,
  projectId,
  metadata,
  enableWalletConnect: true,
  enableInjected: true,
  enableEIP6963: true,
})

createWeb3Modal({ wagmiConfig, projectId })

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
}