import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { platformStats, aumHistory, spvPipeline, financialFlow } from '@/data/mockData'
import { useData } from '@/context/DataContext'
import { Building2, DollarSign, Users, TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowRight, FileText, ShieldCheck, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts'

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
      <p className="text-xs text-gray-600 mb-2.5 leading-relaxed">{description}</p>
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
  const reviewSpvs  = spvs.filter(s => s.status === 'pending')
  const approvedSpvs = spvs.filter(s => s.status === 'approved')
  const pendingKyc = kycRequests.filter(k => k.status === 'pending').length
  const hasActions = pendingKyc > 0 || reviewSpvs.length > 0 || approvedSpvs.length > 0 || pendingPayouts.length > 0

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
      <div className="ds-page space-y-5">

        {/* ══ Zone 1: Stats + Charts | Actions Required ══ */}
        <div className="flex gap-6 items-start">
          <div className="flex-1 min-w-0 space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard label="Total Value Locked" value={`$${(platformStats.totalValueLocked / 1000000).toFixed(1)}M`} icon={DollarSign} color="green" trend={15} />
              <StatCard label="Active Holders" value={investors.filter(i => i.kycStatus === 'verified').length.toLocaleString()} icon={Users} color="blue" trend={22} />
              <StatCard label="Active SPVs" value={liveSpvs.length} icon={Building2} color="purple" sub={`${spvs.length} total · ${reviewSpvs.length} in review`} />
              <StatCard label="Platform Fees Earned (Total)" value={fmt(platformStats.platformFeeEarned)} icon={TrendingUp} color="amber" trend={11} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <StatCard label="Rent Distributed (Total)" value={`$${(platformStats.totalRentDistributed / 1000000).toFixed(2)}M`} icon={DollarSign} color="green" />
              <StatCard label="Total Capital Raised (CHF)" value={fmtChf(totalCapitalRaised)} icon={FileText} color="blue" sub="across all SPVs · at issuance price" />
              <StatCard label="Platform Funding Rate" value={`${fundingRate.toFixed(1)}%`} icon={TrendingUp} color="purple" sub={`${soldBricksAll.toLocaleString()} of ${totalBricksAll.toLocaleString()} bricks sold`} trend={fundingRate > 50 ? Math.round(fundingRate) : undefined} />
            </div>

            {/* ── Charts ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Chart 1: AUM Growth (spans 2 cols) */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">AUM Growth Over Time</p>
                    <p className="text-xs text-gray-600 mt-0.5">Total assets under management — last 12 months</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    +{(((aumHistory.at(-1).aum - aumHistory[0].aum) / aumHistory[0].aum) * 100).toFixed(0)}% YTD
                  </span>
                </div>
                <div style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={aumHistory} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="aumGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.18} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis
                        tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                        width={52}
                      />
                      <Tooltip
                        formatter={(v) => [`$${(v / 1000000).toFixed(2)}M`, 'AUM']}
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: 'none' }}
                      />
                      <Area
                        type="monotone"
                        dataKey="aum"
                        stroke="#8b5cf6"
                        strokeWidth={2.5}
                        fill="url(#aumGrad)"
                        dot={false}
                        activeDot={{ r: 4, fill: '#8b5cf6' }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: SPV Pipeline Funnel */}
              <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
                <p className="text-sm font-semibold text-gray-900">SPV Pipeline Health</p>
                <p className="text-xs text-gray-600 mt-0.5 mb-5">Stage-by-stage deal funnel</p>
                <div className="flex-1 flex flex-col justify-center gap-2.5">
                  {(() => {
                    const max = spvPipeline[0].count
                    const fills = ['#94a3b8', '#60a5fa', '#818cf8', '#a78bfa', '#10b981']
                    return spvPipeline.map((s, i) => {
                      const pct = Math.round(s.count / max * 100)
                      return (
                        <div key={s.stage}>
                          <div className="flex items-center justify-between mb-1 gap-2">
                            <span className="text-xs text-gray-500 truncate">{s.stage}</span>
                            <span className="text-xs font-bold flex-shrink-0" style={{ color: fills[i] }}>{s.count}</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-3 rounded-full transition-all"
                              style={{ width: `${pct}%`, backgroundColor: fills[i] }}
                            />
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>
                <p className="text-xs text-gray-600 text-center mt-4">
                  {spvPipeline.reduce((s, d) => s + d.count, 0)} total deals tracked
                </p>
              </div>

              {/* Chart 3: Financial Flow — full width */}
              <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Financial Flow — Rent vs. Platform Fees</p>
                    <p className="text-xs text-gray-600 mt-0.5">Month-by-month rent collected and platform fee extraction</p>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    {[['#10b981', 'Rent Collected'], ['#3b82f6', 'Platform Fees']].map(([c, l]) => (
                      <div key={l} className="flex items-center gap-1.5">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: c }} />
                        <span className="text-xs text-gray-500">{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={financialFlow} barCategoryGap="28%" barGap={3} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                        width={52}
                      />
                      <Tooltip
                        formatter={(v, key) => [`$${(v / 1000).toFixed(1)}K`, key === 'rent' ? 'Rent Collected' : 'Platform Fees']}
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: 'none' }}
                      />
                      <Bar dataKey="rent" fill="#10b981" radius={[3, 3, 0, 0]} />
                      <Bar dataKey="fees" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

          {/* ── Actions Required sidebar (Zone 1 right column) ── */}
          <div className="w-72 flex-shrink-0">
            <div className="sticky top-6 space-y-3">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions Required</p>
                {hasActions && (
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {[pendingKyc > 0, reviewSpvs.length > 0, approvedSpvs.length > 0, pendingPayouts.length > 0].filter(Boolean).length}
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
                  description="Review and approve SPVs submitted by SPV Managers."
                  to="/admin/spv"
                  btnBorder="border-amber-200"
                  btnText="text-amber-700"
                  btnHover="hover:bg-amber-50"
                />
              )}

              {approvedSpvs.length > 0 && (
                <ActionCard
                  icon={Zap}
                  iconBg="bg-purple-50"
                  iconColor="text-purple-600"
                  borderColor="border-purple-200"
                  title="Tokenization Queue"
                  countLabel={`${approvedSpvs.length} SPV${approvedSpvs.length > 1 ? 's' : ''} awaiting tokenization`}
                  countColor="text-purple-600"
                  description="Approved SPVs ready to be tokenized and made live for investors."
                  to="/admin/tokenization"
                  btnBorder="border-purple-200"
                  btnText="text-purple-700"
                  btnHover="hover:bg-purple-50"
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

        {/* ══ Zone 2: Lists | Rent Distributions — same flex row so tops align ══ */}
        <div className="flex gap-6 items-start">

          {/* Live SPVs + Review Pipeline */}
          <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <img src={spv.coverImage} alt={`${spv.propertyDisplayName} property`} className="w-12 h-9 rounded-lg object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-9 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0">
                        <Building2 size={15} className="text-sky-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{spv.propertyDisplayName}</p>
                      <p className="text-xs text-gray-600">{spv.region} · {spv.propertyType}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <Badge variant="success" className="text-xs">Live</Badge>
                      {spv.targetAPY > 0 && <p className="text-xs text-green-600 mt-0.5">{spv.targetAPY}% APY</p>}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText size={15} className="text-amber-500" /> Review Pipeline
                  </CardTitle>
                  <p className="text-xs text-gray-600 mt-0.5">SPVs in the registry not yet live — part of the {spvs.length} total</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-1">
                {reviewSpvs.length === 0 && approvedSpvs.length === 0 && (
                  <p className="text-sm text-gray-400 py-2">No SPVs currently under review</p>
                )}
                {[...reviewSpvs, ...approvedSpvs].map(spv => {
                  const statusMap = {
                    pending:  { label: 'In Review',  variant: 'warning',  bg: 'bg-gray-50' },
                    approved: { label: 'Approved',   variant: 'default',  bg: 'bg-purple-50' },
                    draft:    { label: 'Draft',      variant: 'secondary', bg: 'bg-gray-50' },
                    rejected: { label: 'Rejected',   variant: 'destructive', bg: 'bg-gray-50' },
                  }
                  const s = statusMap[spv.status] || { label: spv.status, variant: 'default', bg: 'bg-gray-50' }
                  return (
                    <div key={spv.id} className={`flex items-center gap-3 p-3 rounded-xl ${s.bg}`}>
                      {spv.coverImage
                        ? <img src={spv.coverImage} alt={`${spv.name} property`} className="w-10 h-8 rounded-lg object-cover flex-shrink-0" />
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
          </div>

          {/* Rent Distributions — same w-72 as Actions sidebar, tops aligned */}
          <div className="w-72 flex-shrink-0">
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
                        <p className="text-xs text-gray-600">Due {p.date}</p>
                      </div>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                  )
                })}
                {recentRent.slice(0, 5).map(rent => {
                  const spv = spvs.find(s => s.id === rent.spvId)
                  return (
                    <div key={rent.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                      <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{spv?.name}</p>
                        <p className="text-xs text-gray-600">{rent.date}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-semibold text-green-600">{fmt(rent.amount)}</p>
                        <p className="text-xs text-gray-600">fee: {fmt(rent.fee || 0)}</p>
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
