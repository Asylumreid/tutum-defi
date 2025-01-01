'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from 'framer-motion'
import { AlertCircle, Info, Lock, Timer, Building2, BadgeDollarSign } from 'lucide-react'
import { ethers } from 'ethers'

// Constants
const USDT_ADDRESS = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"

const USDT_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
  "function transfer(address to, uint256 amount) external returns (bool)",
  "function decimals() external view returns (uint8)"
]
const PARTICIPATED_LOANS = [
  { company: "TechCorp Solutions", amount: "5,000", status: "Active", timeRemaining: 836400 }, // 1 day
  { company: "Green Energy Ltd", amount: "3,500", status: "Active", timeRemaining: 2392200 }, // 30 days
  { company: "Global Trade Inc", amount: "7,200", status: "Active", timeRemaining: 5284040 }, // 60 days
  { company: "Healthcare Plus", amount: "4,800", status: "Active", timeRemaining: 7489670 }, // 89 days
]

const APY_RATE = 19 // 19% APY

interface LendingDashboardProps {
  contract: ethers.Contract;
  address: string;
}

interface LockStatus {
  isLocked: boolean;
  lockEndTime: number;
  timeRemaining: number;
}

const LendingDashboard = ({ contract, address }: LendingDashboardProps) => {
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [userInfo, setUserInfo] = useState({
    depositAmount: '0',
    pendingRewards: '0'
  })
  const [usdtBalance, setUsdtBalance] = useState('0')
  const [usdtAllowance, setUsdtAllowance] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lockStatus, setLockStatus] = useState<LockStatus>({
    isLocked: false,
    lockEndTime: 0,
    timeRemaining: 0
  })

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
      
      const formattedBalance = ethers.utils.formatUnits(balance)
      const formattedAllowance = ethers.utils.formatUnits(allowance)
      
      setUsdtBalance(formattedBalance)
      setUsdtAllowance(formattedAllowance)
    } catch (err) {
      console.error('Error fetching USDT info:', err)
    }
  }

  const fetchLockStatus = async () => {
    try {
      const status = await contract.getLockStatus(address)
      setLockStatus({
        isLocked: status.isLocked,
        lockEndTime: status.lockEndTime.toNumber(),
        timeRemaining: status.timeRemaining.toNumber()
      })
    } catch (err) {
      console.error('Error fetching lock status:', err)
    }
  }

  useEffect(() => {
    if (address && contract) {
      console.log('Initializing with contract address:', contract.address)
      fetchUserInfo()
      fetchUSDTInfo()
      fetchLockStatus()
      
      const interval = setInterval(fetchLockStatus, 60000)
      return () => clearInterval(interval)
    }
  }, [address, contract])

  const formatTimeRemaining = (seconds: number) => {
    if (seconds <= 0) return 'Ready to withdraw'
    const days = Math.floor(seconds / (24 * 60 * 60))
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((seconds % (60 * 60)) / 60)
    return `${days}d ${hours}h ${minutes}m`
  }

  const handleApprove = async () => {
    if (!depositAmount) return
    setLoading(true)
    setError('')
    
    try {
      const usdtContract = getUSDTContract()
      const amount = ethers.utils.parseUnits(depositAmount, 18)
      
      const tx = await usdtContract.approve(contract.address, amount)
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
      const amount = ethers.utils.parseUnits(depositAmount, 18)
      const tx = await contract.deposit(amount, {
        gasLimit: 300000
      })
      
      await tx.wait()
      await Promise.all([fetchUserInfo(), fetchUSDTInfo(), fetchLockStatus()])
      setDepositAmount('')
      setError('Deposit successful!')
    } catch (err) {
      console.error('Error depositing:', err)
      setError(`Failed to deposit: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount) return
    setLoading(true)
    setError('')

    try {
      const amount = ethers.utils.parseUnits(withdrawAmount, 18)
      const tx = await contract.withdraw(amount, {
        gasLimit: 300000
      })
      
      await tx.wait()
      await Promise.all([fetchUserInfo(), fetchUSDTInfo(), fetchLockStatus()])
      setWithdrawAmount('')
      setError('Withdrawal successful!')
    } catch (err) {
      console.error('Error withdrawing:', err)
      setError(`Failed to withdraw: ${err.message}`)
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
          <div className="flex items-center gap-2"></div>
        </motion.div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Lock Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`px-3 py-1 rounded-full text-sm ${
              lockStatus.isLocked ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
            }`}>
              {lockStatus.isLocked ? 'Locked' : 'Unlocked'}
            </div>
            {lockStatus.isLocked && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Timer className="h-4 w-4" />
                Time remaining: {formatTimeRemaining(lockStatus.timeRemaining)}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

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
              <p className="text-sm text-gray-400">APY Rate</p>
              <p className="text-2xl font-bold text-white">
                {APY_RATE}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="deposit" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="deposit">Deposit</TabsTrigger>
              <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
            </TabsList>
            <TabsContent value="deposit">
              <div className="space-y-4">
                <div className="text-sm text-yellow-500 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 mt-0.5" />
                  <p>Deposits are locked for 90 days</p>
                </div>
                <div className="space-y-4">
                  <Input
                    type="number"
                    placeholder="Amount in USDT"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    min="0"
                    step="0.000001"
                    className="w-full"
                  />
                  {(!usdtAllowance || Number(usdtAllowance) < Number(depositAmount || 0)) ? (
                    <Button 
                      onClick={handleApprove}
                      disabled={loading || !depositAmount}
                      className="w-full"
                    >
                      {loading ? 'Processing...' : 'Approve USDT'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleDeposit}
                      disabled={loading || !depositAmount}
                      className="w-full"
                    >
                      {loading ? 'Processing...' : 'Deposit USDT'}
                    </Button>
                  )}
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-400">
                  <Info className="h-4 w-4 mt-0.5" />
                  <div>
                    <p>Available: {Number(usdtBalance).toFixed(2)} USDT</p>
                    <p>Approved: {Number(usdtAllowance).toFixed(2)} USDT</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="withdraw">
              <div className="space-y-4">
                <div className="text-sm text-gray-400 flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5" />
                  <div>
                    <p>Available to withdraw: {Number(userInfo.depositAmount).toFixed(2)} USDT</p>
                    {lockStatus.isLocked && (
                      <p className="text-yellow-500">
                        Unlock in: {formatTimeRemaining(lockStatus.timeRemaining)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-4">
                  <Input
                    type="number"
                    placeholder="Amount in USDT"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="0"
                    step="0.000001"
                  />
                  <Button 
                    onClick={handleWithdraw}
                    disabled={loading || !withdrawAmount || lockStatus.isLocked || 
                      Number(withdrawAmount) > Number(userInfo.depositAmount)}
                  >
                    {loading ? 'Processing...' : 'Withdraw'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Participated Loans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {PARTICIPATED_LOANS.map((loan, index) => (
              <div 
          key={index}
          className="flex items-center justify-between p-4 bg-gray-800 rounded-lg"
              >
          <div className="flex items-center gap-3">
            <Building2 className="h-5 w-5 text-gray-400" />
            <div>
              <p className="font-medium text-white">{loan.company}</p>
              <p className="text-sm text-gray-400">Status: {loan.status}</p>
              <p className="text-sm text-yellow-500 font-bold">Time remaining: {formatTimeRemaining(loan.timeRemaining)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BadgeDollarSign className="h-5 w-5 text-gray-400" />
            <span className="font-medium text-white">{loan.amount} USDT</span>
          </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LendingDashboard