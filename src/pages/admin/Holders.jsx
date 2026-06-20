import { useState } from 'react'
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
  ArrowUpRight, CheckCircle2, XCircle,
} from 'lucide-react'

const fmt      = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fmtSmall = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

const KYC_VARIANT = { verified: 'success', pending: 'warning', rejected: 'destructive' }
const KYC_LABEL   = { verified: 'KYC Verified', pending: 'KYC Pending', rejected: 'KYC Rejected' }

const AVATAR_GRADIENT = {
  verified: 'from-violet-500 to-violet-600',
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
                  className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs px-4 py-2"
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

  return (
    <Layout>
      <Header title="Holders" subtitle={`${counts.verified} verified · ${counts.pending} pending · ${counts.rejected} rejected`} />
      <div className="ds-page">

        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-gray-400 w-10 flex-shrink-0">KYC</span>
            <div className="flex gap-1.5">
              {[
                { key: 'all',      label: 'All',      activeCls: 'bg-sky-600 text-white'  },
                { key: 'verified', label: 'Verified', activeCls: 'bg-green-600 text-white' },
                { key: 'pending',  label: 'Pending',  activeCls: 'bg-amber-500 text-white' },
                { key: 'rejected', label: 'Rejected', activeCls: 'bg-red-600 text-white'   },
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
          <div className="relative min-w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search name or email…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full border border-gray-200 rounded-lg pl-8 pr-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left  text-xs text-gray-500 font-semibold px-6 py-3">Holder</th>
                <th className="text-left  text-xs text-gray-500 font-semibold px-4 py-3">KYC Status</th>
                <th className="text-left  text-xs text-gray-500 font-semibold px-4 py-3">Country</th>
                <th className="text-right text-xs text-gray-500 font-semibold px-4 py-3">Invested</th>
                <th className="text-right text-xs text-gray-500 font-semibold px-4 py-3">Bricks</th>
                <th className="text-right text-xs text-gray-500 font-semibold px-4 py-3">SPVs</th>
                <th className="text-left  text-xs text-gray-500 font-semibold px-4 py-3">Wallet</th>
                <th className="text-left  text-xs text-gray-500 font-semibold px-4 py-3">Joined</th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(inv => {
                const spvCount = portfolioHoldings.filter(h => h.investorId === inv.id).length
                const isPending = inv.kycStatus === 'pending'
                return (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-shrink-0 bg-gradient-to-br ${AVATAR_GRADIENT[inv.kycStatus]}`}>
                          {initials(inv.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{inv.name}</p>
                          <p className="text-xs text-gray-400">{inv.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={KYC_VARIANT[inv.kycStatus]} className="text-xs">{KYC_LABEL[inv.kycStatus]}</Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-sm">{inv.country || '—'}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">{inv.totalInvested > 0 ? fmt(inv.totalInvested) : <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{inv.totalBricks > 0 ? inv.totalBricks.toLocaleString() : <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3 text-right text-gray-700">{spvCount > 0 ? spvCount : <span className="text-gray-300">—</span>}</td>
                    <td className="px-4 py-3">
                      <code className="text-xs font-mono text-gray-400 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded">
                        {truncateWallet(inv.walletAddress)}
                      </code>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{inv.joinDate}</td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2 justify-end">
                        {isPending && (
                          <>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1" onClick={() => handleApproveKyc(inv.id)}>
                              <CheckCircle2 size={12} /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" className="flex items-center gap-1" onClick={() => openRejectModal(inv.id)}>
                              <XCircle size={12} /> Reject
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm" onClick={() => setSelectedId(inv.id)}>View</Button>
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-sm text-gray-400">
                    No holders match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
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
