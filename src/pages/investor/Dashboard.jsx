import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Briefcase, TrendingUp, DollarSign, Building2, ArrowUpRight, Clock } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { Link } from 'react-router-dom'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fmtSmall = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

export function InvestorDashboard() {
  const { portfolioHoldings, properties, transactions } = useData()
  const myHoldings = portfolioHoldings.filter(h => h.investorId === 'investor-001')
  const totalBricks = myHoldings.reduce((s, h) => s + h.bricks, 0)
  const totalInvested = myHoldings.reduce((s, h) => s + h.bricks * h.purchasePrice, 0)
  const totalEarned = myHoldings.reduce((s, h) => s + h.earnedRent, 0)
  const myProperties = myHoldings.map(h => properties.find(p => p.id === h.propertyId)).filter(Boolean)
  const recentTx = transactions.filter(t => t.investorId === 'investor-001').slice(0, 5)

  const monthlyRent = myHoldings.reduce((s, h) => {
    const prop = properties.find(p => p.id === h.propertyId)
    if (!prop) return s
    return s + (prop.monthlyRent * h.bricks / prop.totalBricks)
  }, 0)

  return (
    <Layout>
      <Header title="Investor Dashboard" subtitle="Welcome back, Alex Rivera" />
      <div className="ds-page">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Invested" value={fmt(totalInvested)} icon={DollarSign} color="blue" trend={12} />
          <StatCard label="Total Bricks Owned" value={totalBricks.toLocaleString()} sub="across 3 properties" icon={Briefcase} color="purple" />
          <StatCard label="Rent Earned (All-time)" value={fmt(totalEarned)} icon={TrendingUp} color="green" trend={8.4} />
          <StatCard label="Est. Monthly Income" value={fmtSmall(monthlyRent)} sub="based on current holdings" icon={Building2} color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Portfolio breakdown */}
          <div className="lg:col-span-2 flex flex-col">
            <Card className="flex-1 flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Portfolio</CardTitle>
                  <Link to="/investor/portfolio" className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
                    View all <ArrowUpRight size={14} />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="text-left text-xs text-gray-500 font-medium px-6 py-3">Property</th>
                      <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Bricks</th>
                      <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Value</th>
                      <th className="text-right text-xs text-gray-500 font-medium px-4 py-3">Earned</th>
                      <th className="text-right text-xs text-gray-500 font-medium px-6 py-3">Yield</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myHoldings.map(h => {
                      const prop = properties.find(p => p.id === h.propertyId)
                      if (!prop) return null
                      return (
                        <tr key={h.propertyId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <img src={prop.image} alt={prop.name} className="w-10 h-8 object-cover rounded-lg" />
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{prop.name}</p>
                                <p className="text-xs text-gray-400">{prop.city}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-900">{h.bricks}</td>
                          <td className="px-4 py-3 text-right text-gray-700">{fmt(h.bricks * h.purchasePrice)}</td>
                          <td className="px-4 py-3 text-right text-green-600 font-medium">{fmt(h.earnedRent)}</td>
                          <td className="px-6 py-3 text-right">
                            <Badge variant="success">{prop.annualYield}%</Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>

          {/* Recent activity */}
          <div className="flex flex-col gap-4">
            <Card className="flex-1">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {recentTx.map(tx => {
                  const prop = properties.find(p => p.id === tx.propertyId)
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
                        <p className="text-xs text-gray-400 truncate">{prop?.name}</p>
                        <p className="text-xs text-gray-400">{tx.date}</p>
                      </div>
                      <p className={`text-sm font-semibold ${tx.type === 'sell' || tx.type === 'rent' ? 'text-green-600' : 'text-gray-900'}`}>
                        {tx.type === 'sell' || tx.type === 'rent' ? '+' : '-'}{fmt(tx.amount)}
                      </p>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* KYC status */}
            <Card>
              <CardContent className="flex items-center gap-3 py-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">KYC Verified</p>
                  <p className="text-xs text-gray-400">Identity verified on Feb 10, 2024</p>
                </div>
                <Badge variant="success" className="ml-auto">Active</Badge>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Property performance */}
        <Card>
          <CardHeader>
            <CardTitle>Property Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myProperties.map(prop => {
                const holding = myHoldings.find(h => h.propertyId === prop.id)
                const myShare = holding ? (holding.bricks / prop.totalBricks * 100).toFixed(2) : 0
                const soldPct = ((prop.totalBricks - prop.availableBricks) / prop.totalBricks * 100)
                return (
                  <div key={prop.id} className="flex items-center gap-4">
                    <img src={prop.image} alt={prop.name} className="w-12 h-10 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-900">{prop.name}</span>
                        <span className="text-gray-500">{myShare}% ownership</span>
                      </div>
                      <Progress value={soldPct} color="blue" />
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>{soldPct.toFixed(0)}% sold</span>
                        <span>{prop.annualYield}% yield</span>
                      </div>
                    </div>
                    <Badge variant="success">{prop.type}</Badge>
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
