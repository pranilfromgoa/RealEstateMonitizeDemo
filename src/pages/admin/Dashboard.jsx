import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { platformStats } from '@/data/mockData'
import { useData } from '@/context/DataContext'
import { Building2, DollarSign, Users, TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowRight, RotateCcw, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export function AdminDashboard() {
  const { spvs, investors, kycRequests, rentHistory, resetData } = useData()
  const pendingPayouts = rentHistory.filter(r => r.status === 'pending')
  const recentRent = rentHistory.filter(r => r.status === 'distributed').slice(0, 5)
  const liveSpvs = spvs.filter(s => s.status === 'active')
  const reviewSpvs = spvs.filter(s => s.status === 'pending')
  const pendingKyc = kycRequests.filter(k => k.status === 'pending').length

  return (
    <Layout>
      <Header title="Admin Dashboard" subtitle="Platform overview and operations" />
      <div className="ds-page">
        {/* Reset demo button */}
        <div className="flex justify-end">
          <button
            onClick={() => { if (window.confirm('Reset all demo data to defaults?')) resetData() }}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-red-500 border border-gray-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors"
          >
            <RotateCcw size={12} /> Reset Demo Data
          </button>
        </div>

        {/* Alerts */}
        {(reviewSpvs.length > 0 || pendingPayouts.length > 0 || pendingKyc > 0) && (
          <div className="space-y-2">
            {pendingKyc > 0 && (
              <div className="ds-alert-info border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <AlertCircle size={16} className="text-blue-600" />
                <p className="text-sm">
                  <span className="font-semibold">{pendingKyc} KYC {pendingKyc === 1 ? 'request' : 'requests'} pending</span>
                  {' '}— verify investor identities before they can invest
                </p>
                <Link to="/admin/approvals"><Button size="sm" variant="outline" className="ml-auto border-blue-300 text-blue-700 hover:bg-blue-100">Review KYC <ArrowRight size={13} /></Button></Link>
              </div>
            )}
            {reviewSpvs.length > 0 && (
              <div className="ds-alert-warning border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <AlertCircle size={16} className="text-amber-600" />
                <p className="text-sm">
                  <span className="font-semibold">{reviewSpvs.length} SPVs in the registry</span>
                  {' '}are not yet live — review and activate them in the SPV Registry
                </p>
                <Link to="/admin/spv"><Button size="sm" variant="outline" className="ml-auto border-amber-300 text-amber-700 hover:bg-amber-100">SPV Registry <ArrowRight size={13} /></Button></Link>
              </div>
            )}
            {pendingPayouts.length > 0 && (
              <div className="ds-alert-info border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <AlertCircle size={16} className="text-blue-600" />
                <p className="text-sm">{pendingPayouts.length} rent payout pending processing</p>
                <Link to="/admin/payouts"><Button size="sm" variant="outline" className="ml-auto border-blue-300 text-blue-700 hover:bg-blue-100">Process <ArrowRight size={13} /></Button></Link>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Value Locked" value={`$${(platformStats.totalValueLocked / 1000000).toFixed(1)}M`} icon={DollarSign} color="green" trend={15} />
          <StatCard label="Active Holders" value={investors.filter(i => i.kycStatus === 'verified').length.toLocaleString()} icon={Users} color="blue" trend={22} />
          <StatCard label="Live Tokenized SPVs" value={liveSpvs.length} icon={Building2} color="purple" sub={`${reviewSpvs.length} in review pipeline`} />
          <StatCard label="Platform Fees Earned" value={fmt(platformStats.platformFeeEarned)} icon={TrendingUp} color="amber" trend={11} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Rent Distributed (Total)" value={`$${(platformStats.totalRentDistributed / 1000000).toFixed(2)}M`} icon={DollarSign} color="green" />
          <StatCard label="Bricks Issued" value={platformStats.totalBricksIssued.toLocaleString()} icon={Building2} color="blue" />
          <StatCard label="Bricks Sold" value={platformStats.totalBricksSold.toLocaleString()} icon={TrendingUp} color="purple" sub={`${(platformStats.totalBricksSold / platformStats.totalBricksIssued * 100).toFixed(0)}% of total`} />
          <StatCard label="Total SPV Registry" value={spvs.length} icon={FileText} color="amber" sub={`${liveSpvs.length} live · ${reviewSpvs.length} in review`} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Active SPV Portfolio */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Live Tokenized SPVs</CardTitle>
                  <p className="text-xs text-gray-400 mt-0.5">Fully operational — investors hold Bricks &amp; earn rent</p>
                </div>
                <Link to="/admin/spv"><Button variant="outline" size="sm">+ Create SPV</Button></Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {liveSpvs.map(spv => (
                <div key={spv.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                  {spv.coverImage ? (
                    <img src={spv.coverImage} alt="" className="w-12 h-9 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-9 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                      <Building2 size={15} className="text-sky-400" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{spv.propertyDisplayName}</p>
                    <p className="text-xs text-gray-400">{spv.region} · {spv.propertyType}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge variant="success" className="text-xs">Live</Badge>
                    {spv.targetAPY > 0 && <p className="text-xs text-green-600 mt-0.5">{spv.targetAPY}% APY</p>}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Right column */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText size={15} className="text-amber-500" /> Review Pipeline
                  </CardTitle>
                  <p className="text-xs text-gray-400 mt-0.5">SPVs in the registry not yet live — part of the {spvs.length} total</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-1">
                {reviewSpvs.length === 0 && (
                  <p className="text-sm text-gray-400 py-2">No SPVs currently under review</p>
                )}
                {reviewSpvs.map(spv => {
                  const statusMap = { pending: { label: 'Pending', variant: 'warning', bg: 'bg-amber-50' }, draft: { label: 'Draft', variant: 'default', bg: 'bg-gray-50' }, rejected: { label: 'Rejected', variant: 'destructive', bg: 'bg-red-50' } }
                  const s = statusMap[spv.status] || { label: spv.status, variant: 'default', bg: 'bg-gray-50' }
                  return (
                    <div key={spv.id} className={`flex items-center gap-3 p-3 rounded-xl ${s.bg}`}>
                      {spv.coverImage
                        ? <img src={spv.coverImage} alt="" className="w-10 h-8 rounded-lg object-cover flex-shrink-0" />
                        : <Building2 size={16} className="text-gray-400 flex-shrink-0" />
                      }
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{spv.name}</p>
                        <p className="text-xs text-gray-500">{spv.region} · {spv.propertyType}</p>
                      </div>
                      <Badge variant={s.variant}>{s.label}</Badge>
                    </div>
                  )
                })}
                <div className="pt-1">
                  <Link to="/admin/spv" className="text-xs text-sky-600 hover:text-sky-800 font-medium flex items-center gap-1">
                    Open SPV Registry <ArrowRight size={11} />
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Rent Distributions</CardTitle></CardHeader>
              <CardContent className="p-0">
                {pendingPayouts.map(p => {
                  const spv = spvs.find(s => s.id === p.spvId)
                  return (
                    <div key={p.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-amber-50/60">
                      <Clock size={14} className="text-amber-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{spv?.name}</p>
                        <p className="text-xs text-gray-400">Due {p.date}</p>
                      </div>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                  )
                })}
                {recentRent.slice(0, 3).map(rent => {
                  const spv = spvs.find(s => s.id === rent.spvId)
                  return (
                    <div key={rent.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                      <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{spv?.name}</p>
                        <p className="text-xs text-gray-400">{rent.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">{fmt(rent.amount)}</p>
                        <p className="text-xs text-gray-400">fee: {fmt(rent.fee || 0)}</p>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
