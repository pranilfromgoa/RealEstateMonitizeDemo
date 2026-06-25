import { useState } from 'react'
import {
  PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from 'recharts'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatCard } from '@/components/ui/stat-card'
import { useData } from '@/context/DataContext'
import {
  Search, ArrowLeft, Wallet, Mail, Calendar, ShieldCheck,
  Building2, DollarSign, TrendingUp, Briefcase, Phone, Globe,
  ArrowUpRight, CheckCircle2, XCircle, Users, AlertTriangle,
} from 'lucide-react'

const fmt      = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fmtSmall = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

const KYC_VARIANT = { verified: 'success', pending: 'warning', rejected: 'destructive' }
const KYC_LABEL   = { verified: 'KYC Verified', pending: 'KYC Pending', rejected: 'KYC Rejected' }

const AVATAR_GRADIENT = {
  verified: 'from-sky-500 to-sky-600',
  pending:  'from-amber-400 to-amber-500',
  rejected: 'from-red-400 to-red-500',
}

function initials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function truncateWallet(addr) {
  if (!addr) return '—'
  return addr.slice(0, 8) + '...' + addr.slice(-6)
}

// ── Holder Detail View ────────────────────────────────────────────────────────

function HolderDetail({ holder, onBack, onApproveKyc, onOpenReject, portfolioHoldings, spvs, transactions }) {
  const holdings = portfolioHoldings
    .filter(h => h.investorId === holder.id)
    .map(h => ({ ...h, spv: spvs.find(s => s.id === h.spvId) }))
    .filter(h => h.spv)

  const totalInvested = holdings.reduce((s, h) => s + h.bricks * h.purchasePrice, 0)
  const totalBricks   = holdings.reduce((s, h) => s + h.bricks, 0)
  const totalEarned   = holdings.reduce((s, h) => s + h.earnedRent, 0)
  const monthlyIncome = holdings.reduce((s, h) => s + (h.spv.monthlyRent * h.bricks / h.spv.totalBricks), 0)
  const recentTx      = transactions.filter(t => t.investorId === holder.id).slice(0, 5)

  return (
    <Layout>
      <Header title="Holder Details" subtitle={holder.name} />
      <div className="ds-page">

        {/* Back */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors w-fit"
        >
          <ArrowLeft size={16} /> Back to Holders
        </button>

        {/* Rejection note */}
        {holder.kycStatus === 'rejected' && holder.kycRejectionReason && (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex gap-3">
            <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-red-700">KYC Rejected</p>
              <p className="text-sm text-red-600 mt-0.5">{holder.kycRejectionReason}</p>
            </div>
          </div>
        )}

        {/* Identity card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex flex-wrap items-start gap-5">
            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${AVATAR_GRADIENT[holder.kycStatus]} flex items-center justify-center text-white text-xl font-bold flex-shrink-0`}>
              {initials(holder.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900">{holder.name}</h2>
                <Badge variant={KYC_VARIANT[holder.kycStatus]}>{KYC_LABEL[holder.kycStatus]}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 text-sm text-gray-500">
                <span className="flex items-center gap-2"><Mail size={14} className="text-gray-400 flex-shrink-0" />{holder.email}</span>
                {holder.phone   && <span className="flex items-center gap-2"><Phone size={14} className="text-gray-400 flex-shrink-0" />{holder.phone}</span>}
                {holder.country && <span className="flex items-center gap-2"><Globe size={14} className="text-gray-400 flex-shrink-0" />{holder.country}</span>}
                <span className="flex items-center gap-2"><Calendar size={14} className="text-gray-400 flex-shrink-0" />Joined {holder.joinDate}</span>
                {holder.kycDate && <span className="flex items-center gap-2"><ShieldCheck size={14} className="text-gray-400 flex-shrink-0" />KYC verified {holder.kycDate}</span>}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Wallet size={14} className="text-gray-400 flex-shrink-0" />
                {holder.walletAddress
                  ? <code className="font-mono text-xs bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-lg text-gray-600">{holder.walletAddress}</code>
                  : <span className="text-xs text-gray-400 italic">No wallet linked</span>
                }
              </div>
            </div>

            {/* KYC actions inside identity card — only for pending */}
            {holder.kycStatus === 'pending' && (
              <div className="flex flex-col gap-2 flex-shrink-0 self-start pt-1">
                <Button
                  onClick={() => onApproveKyc(holder.id)}
                  className="flex items-center gap-2 text-xs px-4 py-2"
                >
                  <CheckCircle2 size={14} /> Approve KYC
                </Button>
                <Button
                  onClick={() => onOpenReject(holder.id)}
                  variant="destructive"
                  className="flex items-center gap-2 text-xs px-4 py-2"
                >
                  <XCircle size={14} /> Reject KYC
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Invested"      value={fmt(totalInvested)}            icon={DollarSign} color="blue"   />
          <StatCard label="Bricks Owned"        value={totalBricks.toLocaleString()}  sub={`across ${holdings.length} SPV${holdings.length !== 1 ? 's' : ''}`} icon={Briefcase} color="purple" />
          <StatCard label="Rent Earned"         value={fmt(totalEarned)}              icon={TrendingUp} color="green"  />
          <StatCard label="Est. Monthly Income" value={fmtSmall(monthlyIncome)}       icon={Building2}  color="amber"  />
        </div>

        {/* Holdings */}
        <Card>
          <CardHeader><CardTitle>Portfolio Holdings</CardTitle></CardHeader>
          <CardContent className="p-0">
            {holdings.length === 0 ? (
              <p className="text-sm text-gray-400 px-6 py-6 text-center">
                {holder.kycStatus === 'verified' ? 'No holdings yet.' : 'KYC must be verified before investing.'}
              </p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left   text-xs text-gray-500 font-semibold px-6 py-3">SPV</th>
                    <th className="text-right  text-xs text-gray-500 font-semibold px-4 py-3">Bricks</th>
                    <th className="text-right  text-xs text-gray-500 font-semibold px-4 py-3">Purchase Date</th>
                    <th className="text-right  text-xs text-gray-500 font-semibold px-4 py-3">Value</th>
                    <th className="text-right  text-xs text-gray-500 font-semibold px-4 py-3">Rent Earned</th>
                    <th className="text-right  text-xs text-gray-500 font-semibold px-4 py-3">Ownership</th>
                    <th className="text-right  text-xs text-gray-500 font-semibold px-6 py-3">Yield</th>
                  </tr>
                </thead>
                <tbody>
                  {holdings.map(h => (
                    <tr key={h.spvId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <img src={h.spv.image} alt={h.spv.name} className="w-10 h-8 object-cover rounded-lg flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-gray-900 text-sm">{h.spv.propertyDisplayName || h.spv.name}</p>
                            <p className="text-xs text-gray-400">{h.spv.city}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900">{h.bricks.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-gray-500 text-xs">{h.purchaseDate}</td>
                      <td className="px-4 py-3 text-right text-gray-700">{fmt(h.bricks * h.purchasePrice)}</td>
                      <td className="px-4 py-3 text-right text-green-600 font-medium">{fmt(h.earnedRent)}</td>
                      <td className="px-4 py-3 text-right text-gray-500">{(h.bricks / h.spv.totalBricks * 100).toFixed(3)}%</td>
                      <td className="px-6 py-3 text-right"><Badge variant="success">{h.spv.annualYield}%</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {/* Recent transactions */}
        {recentTx.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Recent Transactions</CardTitle></CardHeader>
            <CardContent className="p-0">
              {recentTx.map(tx => {
                const spv = spvs.find(s => s.id === tx.spvId)
                const isCredit = tx.type === 'sell' || tx.type === 'rent'
                return (
                  <div key={tx.id} className="flex items-center gap-4 px-6 py-3 border-b border-gray-50 last:border-0">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      tx.type === 'buy' ? 'bg-blue-100' : tx.type === 'sell' ? 'bg-red-100' : 'bg-green-100'
                    }`}>
                      <ArrowUpRight size={14} className={
                        tx.type === 'buy' ? 'text-blue-600' : tx.type === 'sell' ? 'text-red-600 rotate-180' : 'text-green-600'
                      } />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 capitalize">
                        {tx.type === 'rent' ? 'Rent Received' : `${tx.type} Bricks`}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{spv?.name} · {tx.date}</p>
                    </div>
                    <p className={`text-sm font-semibold ${isCredit ? 'text-green-600' : 'text-gray-900'}`}>
                      {isCredit ? '+' : '−'}{fmt(tx.amount)}
                    </p>
                    <code className="text-xs font-mono text-gray-300 hidden lg:block">{tx.txHash?.slice(0, 12)}…</code>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}

// ── Main List View ────────────────────────────────────────────────────────────

export function AdminHolders() {
  const { investors, portfolioHoldings, spvs, transactions, kycRequests, updateKyc, updateInvestor } = useData()

  const [search,        setSearch]        = useState('')
  const [kycFilter,     setKycFilter]     = useState('all')
  const [selectedId,    setSelectedId]    = useState(null)
  const [rejectModal,   setRejectModal]   = useState(false)
  const [rejectTarget,  setRejectTarget]  = useState(null)   // investor id
  const [rejectComment, setRejectComment] = useState('')
  const [rejectError,   setRejectError]   = useState('')

  // Derive the selected holder from live state so detail auto-updates after actions
  const selected = selectedId ? investors.find(i => i.id === selectedId) : null

  const today = new Date().toISOString().split('T')[0]

  const handleApproveKyc = (investorId) => {
    const req = kycRequests.find(k => k.applicantId === investorId && k.status === 'pending')
    if (req) updateKyc(req.id, { status: 'approved' })
    updateInvestor(investorId, { kycStatus: 'verified', kycDate: today })
  }

  const openRejectModal = (investorId) => {
    setRejectTarget(investorId)
    setRejectComment('')
    setRejectError('')
    setRejectModal(true)
  }

  const handleRejectKyc = () => {
    if (!rejectComment.trim()) {
      setRejectError('Rejection reason is required.')
      return
    }
    const req = kycRequests.find(k => k.applicantId === rejectTarget && k.status === 'pending')
    if (req) updateKyc(req.id, { status: 'rejected', rejectionReason: rejectComment.trim() })
    updateInvestor(rejectTarget, { kycStatus: 'rejected', kycRejectionReason: rejectComment.trim() })
    setRejectModal(false)
    setRejectComment('')
    setRejectError('')
    setRejectTarget(null)
  }

  if (selected) {
    return (
      <>
        <HolderDetail
          holder={selected}
          onBack={() => setSelectedId(null)}
          onApproveKyc={handleApproveKyc}
          onOpenReject={openRejectModal}
          portfolioHoldings={portfolioHoldings}
          spvs={spvs}
          transactions={transactions}
        />

        {/* Reject modal — rendered above detail view */}
        <Modal open={rejectModal} onClose={() => setRejectModal(false)} title="Reject KYC Verification">
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Provide a reason for rejection. This will be shown on the holder's profile.
            </p>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectComment}
                onChange={e => { setRejectComment(e.target.value); if (rejectError) setRejectError('') }}
                rows={4}
                placeholder="e.g. Document quality too low — please resubmit a clearer scan of the passport."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
              />
              {rejectError && <p className="text-xs text-red-500 mt-1">{rejectError}</p>}
            </div>
            <div className="flex gap-3 pt-1">
              <Button variant="outline" className="flex-1" onClick={() => setRejectModal(false)}>Cancel</Button>
              <Button variant="destructive" className="flex-1" onClick={handleRejectKyc}>
                <XCircle size={14} /> Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      </>
    )
  }

  const filtered = investors.filter(inv => {
    const matchSearch = inv.name.toLowerCase().includes(search.toLowerCase()) ||
      inv.email.toLowerCase().includes(search.toLowerCase())
    const matchKyc = kycFilter === 'all' || inv.kycStatus === kycFilter
    return matchSearch && matchKyc
  })

  const counts = {
    all:      investors.length,
    verified: investors.filter(i => i.kycStatus === 'verified').length,
    pending:  investors.filter(i => i.kycStatus === 'pending').length,
    rejected: investors.filter(i => i.kycStatus === 'rejected').length,
  }

  const totalCapital    = investors.reduce((s, i) => s + (i.totalInvested || 0), 0)
  const activeVerified  = investors.filter(i => i.kycStatus === 'verified' && (i.totalBricks || 0) > 0).length
  const pendingKyc      = counts.pending
  const avgPortfolio    = activeVerified > 0 ? Math.round(totalCapital / activeVerified) : 0

  // ── Chart data ──────────────────────────────────────────────────────────────

  const geoData = (() => {
    const swiss = investors.filter(i => i.country === 'Switzerland').length
    const intl  = investors.length - swiss
    const total = investors.length || 1
    return [
      { name: 'Swiss',         value: swiss, pct: Math.round(swiss / total * 100) },
      { name: 'International', value: intl,  pct: Math.round(intl  / total * 100) },
    ]
  })()

  const diversData = (() => {
    const LABELS = { 0: '0 SPVs', 1: '1 SPV', 2: '2 SPVs', 3: '3 SPVs', '4+': '4+ SPVs' }
    const buckets = {}
    investors.forEach(inv => {
      const n = portfolioHoldings.filter(h => h.investorId === inv.id).length
      const k = n >= 4 ? '4+' : String(n)
      buckets[k] = (buckets[k] || 0) + 1
    })
    return ['0', '1', '2', '3', '4+'].filter(k => buckets[k]).map(k => ({
      label:   LABELS[k],
      holders: buckets[k],
    }))
  })()

  const CONC_BRACKETS = [
    { label: '< 1k',       min: 0,      max: 1000,      fill: '#94a3b8' },
    { label: '1k – 10k',  min: 1000,   max: 10000,     fill: '#34d399' },
    { label: '10k – 100k',min: 10000,  max: 100000,    fill: '#0ea5e9' },
    { label: '100k+',     min: 100000, max: Infinity,  fill: '#f59e0b' },
  ]
  const concData = CONC_BRACKETS.map(b => ({
    label:   b.label,
    holders: investors.filter(i => (i.totalInvested || 0) >= b.min && (i.totalInvested || 0) < b.max).length,
    fill:    b.fill,
  }))

  return (
    <Layout>
      <Header title="Holders" subtitle={`${counts.verified} verified · ${counts.pending} pending · ${counts.rejected} rejected`} />
      <div className="ds-page">

        {/* Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Chart 1 — Geographic Distribution (Donut) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
            <p className="text-sm font-semibold text-gray-900">Geographic Distribution</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-4">Swiss vs. International — Lex Koller compliance</p>
            <div className="relative" style={{ height: 135 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={geoData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={58}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                    strokeWidth={0}
                  >
                    <Cell fill="#0ea5e9" />
                    <Cell fill="#e2e8f0" />
                  </Pie>
                  <Tooltip
                    formatter={(v, n) => [v + ' holders', n]}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-gray-900">{geoData[0].pct}%</span>
                <span className="text-xs text-gray-400 mt-0.5">Swiss</span>
              </div>
            </div>
            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-sky-400 flex-shrink-0" aria-hidden="true" />
                <span className="text-xs text-gray-700">Swiss ({geoData[0].value})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-200 flex-shrink-0" aria-hidden="true" />
                <span className="text-xs text-gray-700">International ({geoData[1].value})</span>
              </div>
            </div>
          </div>

          {/* Chart 2 — Portfolio Diversification (Bar) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
            <p className="text-sm font-semibold text-gray-900">Portfolio Diversification</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-4">SPVs owned per holder — user stickiness</p>
            <div style={{ height: 135 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={diversData} barSize={32} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
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
                    formatter={(v) => [v + ' holders', 'Count']}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: 'none' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="holders" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-gray-400 mt-3 text-center">
              {diversData.find(d => d.label.startsWith('1'))?.holders || 0} single-SPV holders ·{' '}
              {diversData.filter(d => !d.label.startsWith('0') && !d.label.startsWith('1')).reduce((s, d) => s + d.holders, 0)} diversified
            </p>
          </div>

          {/* Chart 3 — Investor Concentration (Bar + colour coding) */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
            <p className="text-sm font-semibold text-gray-900">Investor Concentration</p>
            <p className="text-xs text-gray-400 mt-0.5 mb-4">Retail vs. Whale — liquidity risk indicator</p>
            <div style={{ height: 135 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={concData} barSize={32} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
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
                    formatter={(v) => [v + ' holders', 'Count']}
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: 'none' }}
                    cursor={{ fill: '#f8fafc' }}
                  />
                  <Bar dataKey="holders" radius={[4, 4, 0, 0]}>
                    {concData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 justify-center">
              {concData.map((d, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-sm flex-shrink-0" style={{ backgroundColor: d.fill }} />
                  <span className="text-xs text-gray-400">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Table area + Metrics sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_232px] gap-4 items-start">

          {/* Left: Filter bar + Table */}
          <div className="space-y-3 min-w-0">

            {/* Filter bar */}
            <div className="bg-white rounded-2xl border border-gray-200 px-4 py-2.5 flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-gray-400 w-10 flex-shrink-0">KYC</span>
                <div className="flex gap-1.5">
                  {[
                    { key: 'all',      label: 'All',      activeCls: 'bg-sky-600 text-white'  },
                    { key: 'verified', label: 'Verified', activeCls: 'bg-sky-600 text-white' },
                    { key: 'pending',  label: 'Pending',  activeCls: 'bg-sky-600 text-white' },
                    { key: 'rejected', label: 'Rejected', activeCls: 'bg-sky-600 text-white' },
                  ].map(p => (
                    <button
                      key={p.key}
                      onClick={() => setKycFilter(p.key)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${kycFilter === p.key ? p.activeCls : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                    >
                      {p.label} <span className={kycFilter === p.key ? 'opacity-80' : 'text-gray-400'}>{counts[p.key]}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="relative min-w-48">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search name or email…"
                  aria-label="Search holders by name or email"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[680px]">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left  text-xs text-gray-500 font-semibold px-4 py-2.5">Holder</th>
                      <th className="text-left  text-xs text-gray-500 font-semibold px-3 py-2.5">KYC</th>
                      <th className="text-left  text-xs text-gray-500 font-semibold px-3 py-2.5">Country</th>
                      <th className="text-right text-xs text-gray-500 font-semibold px-3 py-2.5">Portfolio Size</th>
                      <th className="text-left  text-xs text-gray-500 font-semibold px-3 py-2.5">Wallet</th>
                      <th className="text-left  text-xs text-gray-500 font-semibold px-3 py-2.5">Joined</th>
                      <th className="px-4 py-2.5 w-20"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(inv => {
                      const spvCount = portfolioHoldings.filter(h => h.investorId === inv.id).length
                      return (
                        <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2.5">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-gradient-to-br ${AVATAR_GRADIENT[inv.kycStatus]}`}>
                                {initials(inv.name)}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 text-xs leading-tight flex items-center gap-1">
                                  {inv.name}
                                  {inv.totalInvested > 100000 && (
                                    <span title="Portfolio value above CHF 100,000">⭐</span>
                                  )}
                                </p>
                                <p className="text-xs text-gray-400 leading-tight">{inv.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2">
                            <Badge variant={KYC_VARIANT[inv.kycStatus]} className="text-xs">{KYC_LABEL[inv.kycStatus]}</Badge>
                          </td>
                          <td className="px-3 py-2 text-gray-500 text-xs">{inv.country || '—'}</td>
                          <td className="px-3 py-2 text-right">
                            {inv.totalInvested > 0 ? (
                              <>
                                <p className="font-semibold text-gray-900 text-xs">{fmt(inv.totalInvested)}</p>
                                <p className="text-xs text-gray-400">Across {spvCount} SPV{spvCount !== 1 ? 's' : ''}</p>
                              </>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <code className="text-xs font-mono text-gray-400 bg-gray-50 border border-gray-100 px-1.5 py-0.5 rounded">
                              {truncateWallet(inv.walletAddress)}
                            </code>
                          </td>
                          <td className="px-3 py-2 text-gray-500 text-xs whitespace-nowrap">{inv.joinDate}</td>
                          <td className="px-4 py-2">
                            <Button variant="outline" size="sm" onClick={() => setSelectedId(inv.id)}>View</Button>
                          </td>
                        </tr>
                      )
                    })}
                    {filtered.length === 0 && (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-sm text-gray-400">
                          No holders match this filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>{/* /left column */}

          {/* Right: Metrics sidebar */}
          <div className="space-y-3 sticky top-6">
            <StatCard
              label="Total Capital Deployed"
              value={fmt(totalCapital)}
              sub="sum of all invested capital"
              icon={DollarSign}
              color="blue"
            />
            <StatCard
              label="Active Verified Holders"
              value={activeVerified.toLocaleString()}
              sub="KYC approved · owns 1+ Brick"
              icon={Users}
              color="green"
            />
            <StatCard
              label="Pending KYC / Compliance"
              value={pendingKyc.toLocaleString()}
              sub={pendingKyc > 0 ? 'awaiting verification' : 'queue clear'}
              icon={AlertTriangle}
              color={pendingKyc > 0 ? 'amber' : 'green'}
            />
            <StatCard
              label="Avg. Portfolio Size"
              value={fmt(avgPortfolio)}
              sub="total capital ÷ active holders"
              icon={TrendingUp}
              color="purple"
            />
          </div>{/* /right sidebar */}

        </div>{/* /two-column grid */}

      </div>

      {/* Reject modal — for list view quick actions */}
      <Modal open={rejectModal} onClose={() => setRejectModal(false)} title="Reject KYC Verification">
        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Provide a reason for rejection. This will be shown on the holder's profile.
          </p>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1.5">
              Rejection Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectComment}
              onChange={e => { setRejectComment(e.target.value); if (rejectError) setRejectError('') }}
              rows={4}
              placeholder="e.g. Document quality too low — please resubmit a clearer scan of the passport."
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            />
            {rejectError && <p className="text-xs text-red-500 mt-1">{rejectError}</p>}
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setRejectModal(false)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={handleRejectKyc}>
              <XCircle size={14} /> Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
