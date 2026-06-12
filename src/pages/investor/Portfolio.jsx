import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useData } from '@/context/DataContext'
import { DollarSign, Briefcase, TrendingUp, Percent, Calendar } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fmtSmall = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

export function InvestorPortfolio() {
  const { portfolioHoldings, properties, transactions } = useData()
  const myHoldings = portfolioHoldings.filter(h => h.investorId === 'investor-001')
  const totalBricks = myHoldings.reduce((s, h) => s + h.bricks, 0)
  const totalInvested = myHoldings.reduce((s, h) => s + h.bricks * h.purchasePrice, 0)
  const totalEarned = myHoldings.reduce((s, h) => s + h.earnedRent, 0)
  const avgYield = myHoldings.length > 0
    ? myHoldings.reduce((s, h) => {
        const prop = properties.find(p => p.id === h.propertyId)
        return s + (prop?.annualYield || 0)
      }, 0) / myHoldings.length
    : 0

  const allTx = transactions.filter(t => t.investorId === 'investor-001' && t.type === 'rent')

  return (
    <Layout>
      <Header title="My Portfolio" subtitle="Track your Brick holdings and earnings" />
      <div className="ds-page">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Invested" value={fmt(totalInvested)} icon={DollarSign} color="blue" />
          <StatCard label="Total Bricks" value={totalBricks} icon={Briefcase} color="purple" />
          <StatCard label="Total Rent Earned" value={fmt(totalEarned)} icon={TrendingUp} color="green" trend={8.4} />
          <StatCard label="Avg. Annual Yield" value={`${avgYield.toFixed(1)}%`} icon={Percent} color="amber" />
        </div>

        {/* Holdings */}
        <Card>
          <CardHeader>
            <CardTitle>Property Holdings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {myHoldings.map(h => {
              const prop = properties.find(p => p.id === h.propertyId)
              if (!prop) return null
              const ownershipPct = (h.bricks / prop.totalBricks * 100).toFixed(3)
              const monthlyIncome = prop.monthlyRent * h.bricks / prop.totalBricks
              const currentValue = h.bricks * prop.pricePerBrick
              const gain = currentValue - (h.bricks * h.purchasePrice)
              return (
                <div key={h.propertyId} className="px-6 py-5 border-b border-gray-100 last:border-0">
                  <div className="flex flex-wrap gap-4 items-start">
                    <img src={prop.image} alt={prop.name} className="w-20 h-16 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-48">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{prop.name}</h4>
                          <p className="text-sm text-gray-400">{prop.city} · {prop.type}</p>
                        </div>
                        <Badge variant="success">{prop.annualYield}% yield</Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div>
                          <p className="text-xs text-gray-400">Bricks Owned</p>
                          <p className="font-bold text-gray-900 text-lg">{h.bricks}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Current Value</p>
                          <p className="font-bold text-gray-900">{fmt(currentValue)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Rent Earned</p>
                          <p className="font-bold text-green-600">{fmt(h.earnedRent)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Expected Property Rent/mo</p>
                          <p className="font-bold text-gray-700">{fmt(prop.monthlyRent)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Expected Rent Share/mo</p>
                          <p className="font-bold text-green-600">{fmtSmall(monthlyIncome)}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded">{ownershipPct}% ownership</span>
                        <span className="bg-gray-100 px-2 py-1 rounded">Purchased {h.purchaseDate}</span>
                        <span className={`px-2 py-1 rounded ${gain >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {gain >= 0 ? '▲' : '▼'} {fmt(Math.abs(gain))} unrealized
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Rent history */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Rent Income History</CardTitle>
              <button className="text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                <Calendar size={12} /> Export CSV
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {allTx.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-10">No rent payouts received yet. Rent distributions will appear here once processed by the platform.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Date', 'Property', 'Amount', 'Tx Hash'].map(h => (
                      <th key={h} className="text-left text-xs text-gray-500 font-medium px-6 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allTx.map(tx => {
                    const prop = properties.find(p => p.id === tx.propertyId)
                    return (
                      <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-3 text-gray-600">{tx.date}</td>
                        <td className="px-6 py-3 text-gray-700">{prop?.name}</td>
                        <td className="px-6 py-3 font-medium text-green-600">+{fmt(tx.amount)}</td>
                        <td className="px-6 py-3">
                          <a href="#" className="text-xs text-blue-500 font-mono hover:underline">{tx.txHash.slice(0, 10)}…</a>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
