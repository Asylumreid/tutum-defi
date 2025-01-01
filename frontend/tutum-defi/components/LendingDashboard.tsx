// components/LendingDashboard.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { AlertCircle, Info } from 'lucide-react'
import { ethers } from 'ethers'

// Constants
const USDT_ADDRESS = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"
const USDT_DECIMALS = 6

const USDT_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)"
]

interface LendingDashboardProps {
  contract: ethers.Contract;
  address: string;
}

const LendingDashboard = ({ contract, address }: LendingDashboardProps) => {
  const [depositAmount, setDepositAmount] = useState('')
  const [userInfo, setUserInfo] = useState({
    depositAmount: '0',
    pendingRewards: '0'
  })
  const [usdtBalance, setUsdtBalance] = useState('0')
  const [usdtAllowance, setUsdtAllowance] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const getUSDTContract = () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    return new ethers.Contract(USDT_ADDRESS, USDT_ABI, signer)
  }

  const fetchUserInfo = async () => {
    try {
      const info = await contract.getLenderInfo(address)
      setUserInfo({
        depositAmount: ethers.utils.formatUnits(info.depositAmount),
        pendingRewards: ethers.utils.formatUnits(info.pendingRewards)
      })
    } catch (err) {
      console.error('Contract address:', contract.address)
      console.error('Error fetching user info:', err)
    }
  }

  const fetchUSDTInfo = async () => {
    try {
      const usdtContract = getUSDTContract()
      const balance = await usdtContract.balanceOf(address)
      const allowance = await usdtContract.allowance(address, contract.address)
      
      // Log raw values for debugging
      console.log('Raw balance from contract:', balance.toString())
      console.log('Raw allowance from contract:', allowance.toString())
      
      // Format values using USDT decimals (6)
      const formattedBalance = ethers.utils.formatUnits(balance)
      const formattedAllowance = ethers.utils.formatUnits(allowance)
      
      console.log('Formatted balance:', formattedBalance)
      console.log('Formatted allowance:', formattedAllowance)
      
      setUsdtBalance(formattedBalance)
      setUsdtAllowance(formattedAllowance)
    } catch (err) {
      console.error('Error fetching USDT info:', err)
    }
  }

  useEffect(() => {
    if (address && contract) {
      console.log('Initializing with contract address:', contract.address)
      fetchUserInfo()
      fetchUSDTInfo()
    }
  }, [address, contract])

  const handleApprove = async () => {
    if (!depositAmount) return
    setLoading(true)
    setError('')
    
    try {
      const usdtContract = getUSDTContract()
      const amount = ethers.utils.parseUnits(depositAmount)
      
      console.log('Approving USDT spend:')
      console.log('- Amount (raw):', amount.toString())
      console.log('- Amount (formatted):', ethers.utils.formatUnits(amount))
      console.log('- Contract address:', contract.address)
      
      const tx = await usdtContract.approve(contract.address, amount)
      console.log('Approval transaction:', tx.hash)
      await tx.wait()
      
      await fetchUSDTInfo()
      setError('USDT approved successfully! You can now deposit.')
    } catch (err) {
      console.error('Error approving USDT:', err)
      setError('Failed to approve USDT. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async () => {
    if (!depositAmount) return
    setLoading(true)
    setError('')

    try {
      const amount = ethers.utils.parseUnits(depositAmount, USDT_DECIMALS)
      
      // Check USDT allowance before deposit
      const usdtContract = getUSDTContract()
      const currentAllowance = await usdtContract.allowance(address, contract.address)
      
      console.log('Depositing:')
      console.log('- Amount (raw):', amount.toString())
      console.log('- Amount (formatted):', ethers.utils.formatUnits(amount, USDT_DECIMALS))
      console.log('- Current allowance (raw):', currentAllowance.toString())
      console.log('- Current allowance (formatted):', ethers.utils.formatUnits(currentAllowance, USDT_DECIMALS))
      
      // Verify allowance is sufficient
      if (currentAllowance.lt(amount)) {
        setError('Insufficient allowance. Please approve first.')
        return
      }

      const tx = await contract.deposit(amount)
      console.log('Deposit transaction:', tx.hash)
      await tx.wait()
      
      await Promise.all([fetchUserInfo(), fetchUSDTInfo()])
      setDepositAmount('')
      setError('Deposit successful!')
    } catch (err) {
      console.error('Error depositing:', err)
      setError(`Failed to deposit: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {error && (
        <motion.div 
          className={`border rounded-lg p-4 ${
            error.includes('successful') || error.includes('approved')
              ? 'bg-green-500/10 border-green-500 text-green-500'
              : 'bg-red-500/10 border-red-500 text-red-500'
          }`}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </motion.div>
      )}

      {/* Debug Information */}
      <div className="text-xs text-gray-500 bg-gray-800/50 p-4 rounded-lg">
        <p>Contract Address: {contract?.address}</p>
        <p>Your Address: {address}</p>
        <p>Raw USDT Balance: {usdtBalance}</p>
        <p>Raw USDT Allowance: {usdtAllowance}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-400">USDT Balance</p>
              <p className="text-2xl font-bold text-white">
                {Number(usdtBalance).toFixed(2)} USDT
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-400">Total Deposited</p>
              <p className="text-2xl font-bold text-white">
                {Number(userInfo.depositAmount).toFixed(2)} USDT
              </p>
            </div>
            <div className="bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-400">Pending Rewards</p>
              <p className="text-2xl font-bold text-white">
                {Number(userInfo.pendingRewards).toFixed(2)} USDT
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Deposit USDT</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              type="number"
              placeholder="Amount in USDT"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              min="0"
              step="0.000001"
            />
            <Button 
              onClick={handleApprove}
              disabled={loading || !depositAmount}
              variant="outline"
            >
              {loading ? 'Processing...' : '1. Approve'}
            </Button>
            <Button 
              onClick={handleDeposit}
              disabled={loading || !depositAmount || Number(usdtAllowance) < Number(depositAmount)}
            >
              {loading ? 'Processing...' : '2. Deposit'}
            </Button>
          </div>
          <div className="flex items-start gap-2 text-sm text-gray-400">
            <Info className="h-4 w-4 mt-0.5" />
            <div>
              <p>Available: {Number(usdtBalance).toFixed(2)} USDT</p>
              <p>Approved: {Number(usdtAllowance).toFixed(2)} USDT</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LendingDashboard