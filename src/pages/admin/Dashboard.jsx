import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { platformStats } from '@/data/mockData'
import { useData } from '@/context/DataContext'
import { Building2, DollarSign, Users, TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowRight, FileText, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

const fmt    = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fmtChf = (n) => new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }).format(n)

function ActionCard({ icon: Icon, iconBg, iconColor, borderColor, title, countLabel, countColor, description, to, btnBorder, btnText, btnHover }) {
  return (
    <div className={`bg-white border ${borderColor} rounded-xl p-3`}>
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}>
          <Icon size={14} className={iconColor} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-gray-900 truncate">{title}</p>
          <p className={`text-xs font-medium ${countColor}`}>{countLabel}</p>
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-2.5 leading-relaxed">{description}</p>
      <Link to={to}>
        <Button size="sm" variant="outline" className={`w-full text-xs justify-between ${btnBorder} ${btnText} ${btnHover}`}>
          Open <ArrowRight size={11} />
        </Button>
      </Link>
    </div>
  )
}

export function AdminDashboard() {
  const { spvs, investors, kycRequests, rentHistory } = useData()
  const pendingPayouts = rentHistory.filter(r => r.status === 'pending')
  const recentRent = rentHistory.filter(r => r.status === 'distributed').slice(0, 5)
  const liveSpvs = spvs.filter(s => s.status === 'live')
  const reviewSpvs = spvs.filter(s => s.status === 'pending')
  const pendingKyc = kycRequests.filter(k => k.status === 'pending').length
  const hasActions = pendingKyc > 0 || reviewSpvs.length > 0 || pendingPayouts.length > 0

  const totalCapitalRaised = spvs.reduce((sum, spv) => {
    const sold = (spv.totalBricks || 0) - (spv.availableBricks || 0)
    return sum + sold * (spv.pricePerBrick || 0)
  }, 0)
  const totalBricksAll = spvs.reduce((sum, spv) => sum + (spv.totalBricks || 0), 0)
  const soldBricksAll  = spvs.reduce((sum, spv) => sum + ((spv.totalBricks || 0) - (spv.availableBricks || 0)), 0)
  const fundingRate    = totalBricksAll > 0 ? (soldBricksAll / totalBricksAll * 100) : 0

  return (
    <Layout>
      <Header title="Admin Dashboard" subtitle="Platform overview and operations" />
      <div className="ds-page">
        <div className="flex gap-6 items-start">

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0 space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Value Locked" value={`$${(platformStats.totalValueLocked / 1000000).toFixed(1)}M`} icon={DollarSign} color="green" trend={15} />
              <StatCard label="Active Holders" value={investors.filter(i => i.kycStatus === 'verified').length.toLocaleString()} icon={Users} color="blue" trend={22} />
              <StatCard label="Active SPVs" value={liveSpvs.length} icon={Building2} color="purple" sub={`${spvs.length} total · ${reviewSpvs.length} in review`} />
              <StatCard label="Platform Fees Earned" value={fmt(platformStats.platformFeeEarned)} icon={TrendingUp} color="amber" trend={11} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <StatCard label="Rent Distributed (Total)" value={`$${(platformStats.totalRentDistributed / 1000000).toFixed(2)}M`} icon={DollarSign} color="green" />
              <StatCard label="Total Capital Raised (CHF)" value={fmtChf(totalCapitalRaised)} icon={FileText} color="blue" sub="across all SPVs · at issuance price" />
              <StatCard label="Platform Funding Rate" value={`${fundingRate.toFixed(1)}%`} icon={TrendingUp} color="purple" sub={`${soldBricksAll.toLocaleString()} of ${totalBricksAll.toLocaleString()} bricks sold`} trend={fundingRate > 50 ? Math.round(fundingRate) : undefined} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Live SPVs */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Live Tokenized SPVs</CardTitle>
                      <p className="text-xs text-gray-400 mt-0.5">Fully operational — investors hold Bricks &amp; earn rent</p>
                    </div>
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
                      const statusMap = { pending: { label: 'Pending', variant: 'warning', bg: 'bg-gray-50' }, draft: { label: 'Draft', variant: 'default', bg: 'bg-gray-50' }, rejected: { label: 'Rejected', variant: 'destructive', bg: 'bg-gray-50' } }
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
                        <div key={p.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
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

          {/* ── Right actions sidebar ── */}
          <div className="w-56 flex-shrink-0">
            <div className="sticky top-6 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions Required</p>
                {hasActions && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {[pendingKyc > 0, reviewSpvs.length > 0, pendingPayouts.length > 0].filter(Boolean).length}
                  </span>
                )}
              </div>

              {!hasActions && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center gap-2">
                  <ShieldCheck size={15} className="text-green-600 flex-shrink-0" />
                  <p className="text-xs text-green-700 font-medium">All clear — no pending actions</p>
                </div>
              )}

              {pendingKyc > 0 && (
                <ActionCard
                  icon={Users}
                  iconBg="bg-blue-50"
                  iconColor="text-blue-600"
                  borderColor="border-blue-200"
                  title="KYC Verification"
                  countLabel={`${pendingKyc} holder${pendingKyc > 1 ? 's' : ''} pending`}
                  countColor="text-blue-600"
                  description="Verify investor identities before they can participate."
                  to="/admin/approvals"
                  btnBorder="border-blue-200"
                  btnText="text-blue-700"
                  btnHover="hover:bg-blue-50"
                />
              )}

              {reviewSpvs.length > 0 && (
                <ActionCard
                  icon={Building2}
                  iconBg="bg-amber-50"
                  iconColor="text-amber-600"
                  borderColor="border-amber-200"
                  title="SPV Registry"
                  countLabel={`${reviewSpvs.length} SPV${reviewSpvs.length > 1 ? 's' : ''} in review`}
                  countColor="text-amber-600"
                  description="Review and activate SPVs before investors can buy Bricks."
                  to="/admin/spv"
                  btnBorder="border-amber-200"
                  btnText="text-amber-700"
                  btnHover="hover:bg-amber-50"
                />
              )}

              {pendingPayouts.length > 0 && (
                <ActionCard
                  icon={DollarSign}
                  iconBg="bg-green-50"
                  iconColor="text-green-600"
                  borderColor="border-green-200"
                  title="Rent Payouts"
                  countLabel={`${pendingPayouts.length} payout${pendingPayouts.length > 1 ? 's' : ''} due`}
                  countColor="text-green-600"
                  description="Process pending rent distributions to Brick holders."
                  to="/admin/payouts"
                  btnBorder="border-green-200"
                  btnText="text-green-700"
                  btnHover="hover:bg-green-50"
                />
              )}

            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}
