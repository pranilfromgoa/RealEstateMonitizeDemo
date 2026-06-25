import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/stat-card'
import { platformStats, rentHistory, spvs } from '@/data/mockData'
import { Settings, DollarSign, TrendingUp, Percent, CheckCircle2, AlertCircle } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

const defaultFees = [
  { id: 'rent_fee', label: 'Rent Distribution Fee', value: 5, type: 'percentage', trigger: 'On each rent distribution', phase: 1 },
  { id: 'buy_fee', label: 'Primary Market Purchase Fee', value: 0.5, type: 'percentage', trigger: 'On each primary Brick purchase', phase: 1 },
  { id: 'sell_fee', label: 'Secondary Market Trading Fee', value: 1.0, type: 'percentage', trigger: 'On each secondary market trade (buyer + seller)', phase: 2 },
  { id: 'listing_fee', label: 'SPV Listing Fee', value: 250, type: 'flat', trigger: 'On each approved SPV listing', phase: 2 },
]

export function AdminFeeManagement() {
  const [fees, setFees] = useState(defaultFees)
  const [editing, setEditing] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [saved, setSaved] = useState({})

  const totalFeeRevenue = platformStats.platformFeeEarned
  const monthlyFees = rentHistory.filter(r => r.fee).reduce((s, r) => s + (r.fee || 0), 0)

  const handleSave = (id) => {
    setFees(f => f.map(fee => fee.id === id ? { ...fee, value: parseFloat(editValue) } : fee))
    setSaved(s => ({ ...s, [id]: true }))
    setEditing(null)
    setTimeout(() => setSaved(s => ({ ...s, [id]: false })), 2000)
  }

  return (
    <Layout>
      <Header title="Fee Management" subtitle="Phase 2 — Automated fee configuration and revenue tracking" />
      <div className="ds-page">
        <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <Badge className="bg-sky-600 text-white">Phase 2</Badge>
          <p className="text-sm text-sky-700">In Phase 2, fees are automatically deducted by smart contracts. Configure fee rates and monitor revenue in real-time.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Fee Revenue" value={fmt(totalFeeRevenue)} icon={DollarSign} color="green" trend={11} />
          <StatCard label="This Month's Fees" value={fmt(monthlyFees)} icon={TrendingUp} color="amber" />
          <StatCard label="Active Fee Rules" value={fees.length} icon={Settings} color="blue" />
          <StatCard label="Avg. Rent Fee Rate" value="5%" icon={Percent} color="purple" />
        </div>

        {/* Fee configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Fee Configuration</CardTitle>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" aria-hidden="true" />
                <span className="text-xs text-gray-600">Auto-collection active</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {fees.map(fee => (
              <div key={fee.id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{fee.label}</p>
                    <Badge variant="secondary" className="text-xs">Phase {fee.phase}</Badge>
                    {saved[fee.id] && <Badge variant="success" className="text-xs">Saved ✓</Badge>}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{fee.trigger}</p>
                </div>
                <div className="flex items-center gap-3">
                  {editing === fee.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        className="w-24 border border-blue-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-bold"
                      />
                      <span className="text-sm text-muted-foreground">{fee.type === 'percentage' ? '%' : '$'}</span>
                      <Button size="sm" onClick={() => handleSave(fee.id)}>Save</Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>✕</Button>
                    </div>
                  ) : (
                    <>
                      <span className="text-xl font-bold text-gray-900">
                        {fee.type === 'percentage' ? `${fee.value}%` : fmt(fee.value)}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => { setEditing(fee.id); setEditValue(fee.value.toString()) }}>
                        Edit
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Fee revenue by property */}
        <Card>
          <CardHeader><CardTitle>Fee Revenue by SPV</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs text-gray-500 font-medium px-5 py-3">SPV</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">Total Rent Distributed</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">Fees Collected</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">Fee Rate</th>
                  <th className="text-right text-xs text-gray-500 font-medium px-5 py-3">Distributions</th>
                </tr>
              </thead>
              <tbody>
                {spvs.map(spv => {
                  const spvRents = rentHistory.filter(r => r.spvId === spv.id && r.status === 'distributed')
                  const totalRent = spvRents.reduce((s, r) => s + r.amount, 0)
                  const totalFee = spvRents.reduce((s, r) => s + (r.fee || 0), 0)
                  return (
                    <tr key={spv.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <img src={spv.image} alt={`${spv.name} property`} className="w-8 h-6 rounded object-cover" />
                          <span className="font-medium text-gray-900 text-xs">{spv.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-right text-gray-700">{fmt(totalRent)}</td>
                      <td className="px-5 py-3 text-right text-amber-600 font-semibold">{fmt(totalFee)}</td>
                      <td className="px-5 py-3 text-right">
                        {totalRent > 0 ? <span className="text-gray-600">{(totalFee / totalRent * 100).toFixed(1)}%</span> : '—'}
                      </td>
                      <td className="px-5 py-3 text-right text-gray-500">{spvRents.length}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="ds-alert-info border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle size={15} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">
            In Phase 2, fee deductions are handled automatically by smart contracts. Manual overrides require multi-signature approval. Fee changes take effect on the next billing cycle.
          </p>
        </div>
      </div>
    </Layout>
  )
}
