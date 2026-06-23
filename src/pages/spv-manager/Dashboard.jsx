import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import { Building2, Plus, ArrowRight, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useState } from 'react'

const fmtCHF = n =>
  new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }).format(n || 0)

const statusMap = {
  draft:    { label: 'Draft',    dot: 'bg-gray-400'   },
  pending:  { label: 'Pending',  dot: 'bg-amber-400'  },
  approved: { label: 'Approved', dot: 'bg-sky-500'    },
  live:     { label: 'Live',     dot: 'bg-green-500'  },
  rejected: { label: 'Rejected', dot: 'bg-red-400'    },
}

export function SpvManagerDashboard() {
  const { user } = useAuth()
  const { spvs } = useData()

  const [statusFilter, setStatusFilter] = useState('all')

  const draftSpvs    = spvs.filter(s => s.status === 'draft')
  const pendingSpvs  = spvs.filter(s => s.status === 'pending')
  const liveSpvs     = spvs.filter(s => s.status === 'live')
  const rejectedSpvs = spvs.filter(s => s.status === 'rejected')

  const filtered = statusFilter === 'all' ? spvs
    : statusFilter === 'live'     ? liveSpvs
    : statusFilter === 'pending'  ? pendingSpvs
    : statusFilter === 'draft'    ? draftSpvs
    : rejectedSpvs

  return (
    <Layout>
      <Header title="SPV Manager Dashboard" subtitle="Manage and structure tokenized real estate SPVs" />
      <div className="ds-page space-y-5">

        {/* Welcome bar — matches SPV Registry filter bar */}
        <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold mb-0.5">Welcome back</p>
            <p className="font-bold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-400 mt-0.5">
              {draftSpvs.length} draft{draftSpvs.length !== 1 ? 's' : ''} &middot; {pendingSpvs.length} pending approval
            </p>
          </div>
          <Link to="/spv_manager/spv">
            <button className="flex items-center gap-2 text-sm font-medium text-sky-600 border border-sky-200 px-4 py-2 rounded-xl hover:bg-sky-50 transition-colors">
              <Plus size={14} /> New SPV
            </button>
          </Link>
        </div>

        {/* Status filter pills — mirrors SPV Registry filter bar */}
        <div className="bg-white rounded-2xl border border-gray-200 px-5 py-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-400 w-14 flex-shrink-0">Status</span>
            <div className="flex gap-1.5 flex-wrap">
              {[
                { key: 'all',      label: 'All',      count: spvs.length,           activeCls: 'bg-sky-600 text-white'    },
                { key: 'live',     label: 'Live',     count: liveSpvs.length,       activeCls: 'bg-sky-600 text-white'  },
                { key: 'pending',  label: 'Pending',  count: pendingSpvs.length,    activeCls: 'bg-sky-600 text-white'  },
                { key: 'draft',    label: 'Draft',    count: draftSpvs.length,      activeCls: 'bg-sky-600 text-white'  },
                { key: 'rejected', label: 'Rejected', count: rejectedSpvs.length,   activeCls: 'bg-sky-600 text-white'  },
              ].map(p => (
                <button
                  key={p.key}
                  onClick={() => setStatusFilter(p.key)}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${statusFilter === p.key ? p.activeCls : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                >
                  {p.label} <span className={statusFilter === p.key ? 'opacity-80' : 'text-gray-400'}>{p.count}</span>
                </button>
              ))}
            </div>
            <Link to="/spv_manager/spv" className="ml-auto flex items-center gap-1.5 text-xs font-medium text-sky-600 border border-sky-200 px-3 py-1.5 rounded-xl hover:bg-sky-50 transition-colors flex-shrink-0">
              Manage All <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* SPV list — same row style as SPV registry card list */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <p className="font-bold text-gray-900 text-sm">
                {statusFilter === 'all' ? 'All SPVs' : `${statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)} SPVs`}
                <span className="ml-2 text-xs font-normal text-gray-400">({filtered.length})</span>
              </p>
              <p className="text-xs text-gray-400 mt-0.5">Click Open Registry to view and edit any SPV</p>
            </div>
            <Link to="/spv_manager/spv" className="flex items-center gap-1.5 text-xs font-medium text-sky-600 border border-sky-200 px-3 py-1.5 rounded-xl hover:bg-sky-50 transition-colors">
              Open Registry <ArrowRight size={12} />
            </Link>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-14 text-gray-400">
              <Building2 size={36} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">{statusFilter === 'all' ? 'No SPVs yet. Create your first one.' : `No ${statusFilter} SPVs.`}</p>
            </div>
          ) : (
            filtered.map(spv => {
              const s = statusMap[spv.status] || statusMap.draft
              return (
                <div key={spv.id} className="flex items-center gap-4 px-5 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                  {spv.coverImage
                    ? <img src={spv.coverImage} alt="" className="w-12 h-9 rounded-lg object-cover flex-shrink-0" />
                    : <div className="w-12 h-9 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0"><Building2 size={15} className="text-sky-400" /></div>
                  }
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">{spv.propertyDisplayName || spv.legalName}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                      {spv.propertyAddress
                        ? <><MapPin size={10} /><span className="truncate">{spv.propertyAddress}</span></>
                        : <span>{spv.region} · {spv.propertyType}</span>
                      }
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                    <div className="w-28 bg-gray-50 rounded-lg px-2.5 py-1.5 text-center">
                      <p className="text-[9px] text-gray-400">Valuation</p>
                      <p className="text-xs font-bold text-gray-800 tabular-nums truncate">{spv.totalValuation > 0 ? fmtCHF(spv.totalValuation) : '—'}</p>
                    </div>
                    <div className="w-14 bg-sky-50 rounded-lg px-2.5 py-1.5 text-center">
                      <p className="text-[9px] text-gray-400">APY</p>
                      <p className="text-xs font-bold text-sky-700">{spv.targetAPY ? `${spv.targetAPY}%` : '—'}</p>
                    </div>
                    <span className="inline-flex items-center justify-center gap-1.5 w-[88px] text-xs font-medium py-1 rounded-full bg-white border border-gray-200 text-gray-600 flex-shrink-0">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />{s.label}
                    </span>
                  </div>
                  <div className="flex sm:hidden flex-shrink-0">
                    <span className="inline-flex items-center justify-center gap-1.5 w-[88px] text-xs font-medium py-1 rounded-full bg-white border border-gray-200 text-gray-600">
                      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />{s.label}
                    </span>
                  </div>
                </div>
              )
            })
          )}
        </div>

      </div>
    </Layout>
  )
}
