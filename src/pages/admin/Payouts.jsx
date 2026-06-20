import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { StatCard } from '@/components/ui/stat-card'
import { platformStats } from '@/data/mockData'
import { useData } from '@/context/DataContext'
import { Banknote, DollarSign, CheckCircle2, Clock, Calculator, Send } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

const FEE_RATE = 0.05

export function AdminPayouts() {
  const { rentHistory: rents, spvs, processRentPayout } = useData()
  const [payModal, setPayModal] = useState(null)
  const [rentAmount, setRentAmount] = useState('')
  const [processing, setProcessing] = useState(false)
  const [done, setDone] = useState(false)

  const pending = rents.filter(r => r.status === 'pending')
  const distributed = rents.filter(r => r.status === 'distributed')

  const totalDistributed = distributed.reduce((s, r) => s + r.amount, 0)
  const totalFees = distributed.reduce((s, r) => s + (r.fee || 0), 0)

  const handleProcess = () => {
    setProcessing(true)
    setTimeout(() => {
      processRentPayout(payModal.id, parseFloat(rentAmount))
      setProcessing(false)
      setDone(true)
    }, 1800)
  }

  return (
    <Layout>
      <Header title="Rent Payouts" subtitle="Record and distribute rent to Brick holders" />
      <div className="ds-page">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Distributed" value={`$${(totalDistributed / 1000).toFixed(0)}K`} icon={DollarSign} color="green" />
          <StatCard label="Platform Fees" value={fmt(totalFees)} icon={Banknote} color="amber" />
          <StatCard label="Pending Payouts" value={pending.length} icon={Clock} color="blue" />
          <StatCard label="Distributions (Total)" value={distributed.length} icon={CheckCircle2} color="purple" />
        </div>

        {/* Pending */}
        {pending.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={16} className="text-amber-500" /> Pending Payouts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {pending.map(rent => {
                const spv = spvs.find(s => s.id === rent.spvId)
                return (
                  <div key={rent.id} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0 bg-amber-50/50">
                    <img src={spv?.image} alt="" className="w-14 h-10 rounded-xl object-cover flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{spv?.name}</p>
                      <p className="text-sm text-gray-400">Expected: {fmt(spv?.monthlyRent || 0)}/mo · Due: {rent.date}</p>
                    </div>
                    <Badge variant="warning">Pending</Badge>
                    <Button onClick={() => { setPayModal(rent); setRentAmount(spv?.monthlyRent?.toString() || ''); setDone(false) }}>
                      <Send size={14} /> Process Payout
                    </Button>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* History */}
        <Card>
          <CardHeader><CardTitle>Payout History</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['SPV', 'Gross Rent', 'Platform Fee (5%)', 'Net Distributed', 'Date', 'Status', 'Tx Hash'].map(h => (
                    <th key={h} className="text-left text-xs text-gray-500 font-medium px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rents.filter(r => r.status === 'distributed').map(rent => {
                  const spv = spvs.find(s => s.id === rent.spvId)
                  return (
                    <tr key={rent.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <img src={spv?.image} alt="" className="w-8 h-6 rounded object-cover" />
                          <span className="text-gray-800 text-xs">{spv?.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-900">{fmt(rent.amount)}</td>
                      <td className="px-5 py-3 text-amber-600">{fmt(rent.fee || 0)}</td>
                      <td className="px-5 py-3 text-green-600 font-semibold">{fmt(rent.netAmount || 0)}</td>
                      <td className="px-5 py-3 text-gray-500">{rent.date}</td>
                      <td className="px-5 py-3"><Badge variant="success">Distributed</Badge></td>
                      <td className="px-5 py-3">
                        <a href="#" className="text-xs text-blue-500 font-mono hover:underline">{rent.txHash?.slice(0, 10)}…</a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Process Payout Modal */}
      <Modal open={!!payModal} onClose={() => setPayModal(null)} title="Process Rent Payout">
        {payModal && (
          <div className="space-y-4">
            {done ? (
              <div className="text-center py-6">
                <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
                <h3 className="text-xl font-bold text-gray-900">Payout Distributed!</h3>
                <p className="text-gray-500 mt-1 text-sm">Rent has been distributed to all Brick holders.</p>
              </div>
            ) : (
              <>
                <div className="ds-alert-info rounded-xl p-4">
                  <p className="font-semibold text-gray-900">{spvs.find(s => s.id === payModal.spvId)?.name}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">Enter the actual rent received this month</p>
                </div>
                <div>
                  <label className="ds-label">Rent Received ($) *</label>
                  <input type="number" value={rentAmount} onChange={e => setRentAmount(e.target.value)}
                    className="ds-input" />
                </div>
                {rentAmount && (
                  <div className="ds-inset space-y-2 text-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator size={14} className="text-blue-600" />
                      <span className="font-medium text-gray-700">Payout Breakdown</span>
                    </div>
                    <div className="flex justify-between"><span className="text-gray-500">Gross Rent</span><span className="font-medium">{fmt(parseFloat(rentAmount))}</span></div>
                    <div className="flex justify-between text-amber-600"><span>Platform Fee (5%)</span><span>−{fmt(parseFloat(rentAmount) * FEE_RATE)}</span></div>
                    <div className="border-t pt-2 flex justify-between font-bold text-green-600">
                      <span>Net to Distribute</span>
                      <span>{fmt(parseFloat(rentAmount) * (1 - FEE_RATE))}</span>
                    </div>
                    <p className="text-xs text-gray-400 pt-1">Distributed proportionally to all Brick holders based on ownership percentage.</p>
                  </div>
                )}
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setPayModal(null)}>Cancel</Button>
                  <Button className="flex-1" disabled={!rentAmount || processing} onClick={handleProcess}>
                    {processing ? 'Processing…' : 'Confirm & Distribute'}
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  )
}
