import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useData } from '@/context/DataContext'
import { DollarSign, Briefcase, TrendingUp, Percent, Calendar, Download } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

const PALETTE = ['#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e']

const fmt     = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fmtSmall = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)
const fmtChf  = (n) => new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }).format(n)

const nextPayoutDate = (() => {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth() + 1, 1)
    .toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
})()

export function HolderPortfolio() {
  const { portfolioHoldings, spvs, transactions } = useData()
  const myHoldings = portfolioHoldings.filter(h => h.investorId === 'investor-001')
  const totalBricks = myHoldings.reduce((s, h) => s + h.bricks, 0)
  const totalInvested = myHoldings.reduce((s, h) => s + h.bricks * h.purchasePrice, 0)
  const totalEarned = myHoldings.reduce((s, h) => s + h.earnedRent, 0)
  const avgYield = myHoldings.length > 0
    ? myHoldings.reduce((s, h) => {
        const spv = spvs.find(s2 => s2.id === h.spvId)
        return s + (spv?.annualYield || 0)
      }, 0) / myHoldings.length
    : 0

  const allTx = transactions.filter(t => t.investorId === 'investor-001' && t.type === 'rent')

  // Chart 1: aggregate rent by month
  const incomeData = (() => {
    const map = {}
    allTx.forEach(tx => {
      const d = new Date(tx.date)
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      map[key] = { label, amount: (map[key]?.amount || 0) + tx.amount }
    })
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b)).map(([, v]) => v)
  })()

  // Chart 2: invested capital per SPV
  const allocationData = myHoldings.map((h, i) => {
    const spv = spvs.find(s => s.id === h.spvId)
    const name = spv?.name.split(' ').slice(0, 3).join(' ') || h.spvId
    return { name, value: h.bricks * h.purchasePrice, fill: PALETTE[i % PALETTE.length] }
  })

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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Chart 1: Income History */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
            <p className="text-sm font-semibold text-gray-900">Income History</p>
            <p className="text-xs text-gray-600 mt-0.5 mb-4">Monthly rent received across all SPVs</p>
            <div style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeData} barSize={28} margin={{ top: 6, right: 8, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="label"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(v) => [`$${v}`, 'Rent received']}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: 'none' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="amount" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-600 mt-3 text-center">
              Total earned: <span className="font-semibold text-gray-700">{fmt(allTx.reduce((s, t) => s + t.amount, 0))}</span>
            </p>
          </div>

          {/* Chart 2: Portfolio Allocation */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
            <p className="text-sm font-semibold text-gray-900">Portfolio Allocation</p>
            <p className="text-xs text-gray-600 mt-0.5 mb-4">Invested capital by SPV</p>
            <div className="flex gap-6 flex-1 items-center">
              <div style={{ width: 160, height: 160, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={46}
                      outerRadius={72}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      strokeWidth={0}
                    >
                      {allocationData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip
                      formatter={(v) => [fmt(v), 'Invested']}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: 'none' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3 min-w-0">
                {allocationData.map((d, i) => {
                  const pct = totalInvested > 0 ? (d.value / totalInvested * 100).toFixed(1) : 0
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.fill }} />
                          <span className="text-xs text-gray-600 truncate">{d.name}</span>
                        </div>
                        <span className="text-xs font-semibold text-gray-800 flex-shrink-0">{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, backgroundColor: d.fill }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

        </div>

        {/* Holdings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <CardTitle>SPV Holdings</CardTitle>
              <button className="flex items-center gap-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-sky-200 whitespace-nowrap">
                <Download size={15} strokeWidth={2.5} />
                Export Annual Tax Statement
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {myHoldings.map(h => {
              const spv = spvs.find(s => s.id === h.spvId)
              if (!spv) return null
              const ownershipPct = (h.bricks / spv.totalBricks * 100).toFixed(3)
              const monthlyIncome = spv.monthlyRent * h.bricks / spv.totalBricks
              const currentValue = h.bricks * spv.pricePerBrick
              const gain = currentValue - (h.bricks * h.purchasePrice)
              return (
                <div key={h.spvId} className="px-6 py-5 border-b border-gray-100 last:border-0">
                  <div className="flex flex-wrap gap-4 items-start">
                    <img src={spv.image} alt={spv.name} className="w-20 h-16 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-48">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{spv.name}</h4>
                          <p className="text-sm text-gray-600">{spv.city} · {spv.type}</p>
                        </div>
                        <Badge variant="success">{spv.annualYield}% yield</Badge>
                      </div>
                      <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div>
                          <p className="text-xs text-gray-600">Bricks Owned</p>
                          <p className="font-bold text-gray-900 text-lg">{h.bricks}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Invested Amount</p>
                          <p className="font-bold text-gray-900">{fmtChf(h.bricks * h.purchasePrice)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Current Yield (APY)</p>
                          <p className="font-bold text-sky-600">{spv.annualYield}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Next Payout Date</p>
                          <p className="font-bold text-gray-900">{nextPayoutDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Current Value</p>
                          <p className="font-bold text-gray-900">{fmt(currentValue)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Rent Earned</p>
                          <p className="font-bold text-green-600">{fmt(h.earnedRent)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">SPV Rent / mo</p>
                          <p className="font-bold text-gray-700">{fmt(spv.monthlyRent)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">My Rent Share / mo</p>
                          <p className="font-bold text-green-600">{fmtSmall(monthlyIncome)}</p>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-600">
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
              <button className="text-xs text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 flex items-center gap-1">
                <Calendar size={12} /> Export CSV
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {allTx.length === 0 ? (
              <p className="text-sm text-gray-600 text-center py-10">No rent payouts received yet. Rent distributions will appear here once processed by the platform.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Date', 'SPV', 'Amount', 'Tx Hash'].map(h => (
                      <th key={h} className={`text-xs text-gray-600 font-medium px-6 py-3 ${['Date', 'Amount'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allTx.map(tx => {
                    const spv = spvs.find(s => s.id === tx.spvId)
                    return (
                      <tr key={tx.id} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="px-6 py-3 text-gray-600 text-right">{tx.date}</td>
                        <td className="px-6 py-3 text-gray-700">{spv?.name}</td>
                        <td className="px-6 py-3 font-medium text-green-600 text-right">+{fmt(tx.amount)}</td>
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
