import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Briefcase, TrendingUp, DollarSign, Building2, ArrowUpRight, Clock, Percent } from 'lucide-react'
import { useData } from '@/context/DataContext'

const fmt     = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fmtSmall = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
const fmtChf  = (n) => new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }).format(n)

export function HolderDashboard() {
  const { portfolioHoldings, spvs, transactions } = useData()
  const myHoldings = portfolioHoldings.filter(h => h.investorId === 'investor-001')
  const totalBricks = myHoldings.reduce((s, h) => s + h.bricks, 0)
  const totalInvested = myHoldings.reduce((s, h) => s + h.bricks * h.purchasePrice, 0)
  const totalEarned = myHoldings.reduce((s, h) => s + h.earnedRent, 0)
  const mySpvs = myHoldings.map(h => spvs.find(s => s.id === h.spvId)).filter(Boolean)
  const recentTx = transactions.filter(t => t.investorId === 'investor-001').slice(0, 5)

  const monthlyRent = myHoldings.reduce((s, h) => {
    const spv = spvs.find(s => s.id === h.spvId)
    if (!spv) return s
    return s + (spv.monthlyRent * h.bricks / spv.totalBricks)
  }, 0)

  const avgApy = totalInvested > 0
    ? myHoldings.reduce((s, h) => {
        const spv = spvs.find(s2 => s2.id === h.spvId)
        if (!spv || !spv.annualYield) return s
        return s + spv.annualYield * ((h.bricks * h.purchasePrice) / totalInvested)
      }, 0)
    : 0

  const portfolioValue = myHoldings.reduce((s, h) => {
    const spv = spvs.find(s2 => s2.id === h.spvId)
    const pricePerBrick = (spv?.totalValuation && spv?.totalBricks)
      ? spv.totalValuation / spv.totalBricks
      : h.purchasePrice
    return s + h.bricks * pricePerBrick
  }, 0)

  return (
    <Layout>
      <Header title="Holder Dashboard" subtitle="Welcome back, Alex Rivera" />
      <div className="ds-page">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total Invested" value={fmt(totalInvested)} icon={DollarSign} color="blue" trend={12} />
          <StatCard label="🌟 Average APY" value={`${avgApy.toFixed(2)}%`} sub="weighted across holdings" icon={Percent} color="green" />
          <StatCard label="Portfolio Value" value={fmtChf(portfolioValue)} sub="CHF · at current valuation" icon={Briefcase} color="purple" />
          <StatCard label="Rent Earned (All-time)" value={fmt(totalEarned)} icon={TrendingUp} color="indigo" trend={8.4} />
          <StatCard label="Est. Monthly Income" value={fmtSmall(monthlyRent)} sub="based on current holdings" icon={Building2} color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Recent activity */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {recentTx.map(tx => {
                  const spv = spvs.find(s => s.id === tx.spvId)
                  return (
                    <div key={tx.id} className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        tx.type === 'buy' ? 'bg-blue-100' : tx.type === 'sell' ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        {tx.type === 'buy' && <ArrowUpRight size={14} className="text-blue-600" />}
                        {tx.type === 'sell' && <ArrowUpRight size={14} className="text-red-600 rotate-180" />}
                        {tx.type === 'rent' && <DollarSign size={14} className="text-green-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 font-medium capitalize">{tx.type === 'rent' ? 'Rent received' : `${tx.type} Bricks`}</p>
                        <p className="text-xs text-gray-600 truncate">{spv?.name}</p>
                        <p className="text-xs text-gray-600">{tx.date}</p>
                      </div>
                      <p className={`text-sm font-semibold ${tx.type === 'sell' || tx.type === 'rent' ? 'text-green-600' : 'text-gray-900'}`}>
                        {tx.type === 'sell' || tx.type === 'rent' ? '+' : '-'}{fmt(tx.amount)}
                      </p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* KYC status */}
          <div>
            <Card>
              <CardContent className="flex items-center gap-3 py-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">KYC Verified</p>
                  <p className="text-xs text-gray-600">Identity verified on Feb 10, 2024</p>
                </div>
                <Badge variant="success" className="ml-auto">Active</Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* SPV performance */}
        <Card>
          <CardHeader>
            <CardTitle>SPV Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mySpvs.map(spv => {
                const holding = myHoldings.find(h => h.spvId === spv.id)
                const myShare = holding ? (holding.bricks / spv.totalBricks * 100).toFixed(2) : 0
                const soldPct = ((spv.totalBricks - spv.availableBricks) / spv.totalBricks * 100)
                return (
                  <div key={spv.id} className="flex items-center gap-4">
                    <img src={spv.image} alt={spv.name} className="w-12 h-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-900">{spv.name}</span>
                        <span className="text-gray-500">{myShare}% ownership</span>
                      </div>
                      <Progress value={soldPct} color="blue" />
                      <div className="flex justify-between text-xs text-gray-600 mt-1">
                        <span>{soldPct.toFixed(0)}% sold</span>
                        <span>{spv.annualYield}% yield</span>
                      </div>
                    </div>
                    <Badge variant="success">{spv.type}</Badge>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
