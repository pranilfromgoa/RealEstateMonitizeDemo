import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { useNavigate } from 'react-router-dom'
import { Building2, MapPin, TrendingUp, Users, Banknote, ArrowRight, CalendarDays } from 'lucide-react'

const fmtCHF = n =>
  new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }).format(n || 0)

const fmtDate = d => {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function SpvManagerMyProperties() {
  const { user } = useAuth()
  const { spvs } = useData()
  const navigate = useNavigate()

  const myProperties = spvs.filter(
    s => s.status === 'live' && s.assignedManagerId === user?.id
  )

  const totalAUM    = myProperties.reduce((s, p) => s + (p.totalValuation || 0), 0)
  const totalRent   = myProperties.reduce((s, p) => s + (p.monthlyRent || 0), 0)
  const avgOccupancy = myProperties.length
    ? Math.round(myProperties.reduce((s, p) => s + (p.financials?.occupancy || 0), 0) / myProperties.length)
    : 0

  const openInRegistry = (spv) => {
    navigate('/spv_manager/spv', { state: { openSpvId: spv.id } })
  }

  return (
    <Layout>
      <Header
        title="My Properties"
        subtitle="Live SPVs under your management"
      />
      <div className="ds-page space-y-5">

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Properties Under Management', value: myProperties.length, icon: Building2 },
            { label: 'Total AUM',                   value: fmtCHF(totalAUM),    icon: TrendingUp },
            { label: 'Monthly Rental Income',       value: fmtCHF(totalRent),   icon: Banknote   },
          ].map(s => (
            <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center flex-shrink-0">
                <s.icon size={18} className="text-sky-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{s.label}</p>
                <p className="text-xl font-bold text-gray-900 mt-0.5">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Property list */}
        {myProperties.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-14 text-center">
            <Building2 size={40} className="mx-auto mb-3 text-gray-200" />
            <p className="text-sm font-semibold text-gray-400">No live properties assigned to you yet</p>
            <p className="text-xs text-gray-400 mt-1">Ask your Admin to assign an active SPV to your account</p>
          </div>
        ) : (
          <div className="space-y-4">
            {myProperties.map(spv => {
              const occ = spv.financials?.occupancy ?? null
              return (
                <div key={spv.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex">

                    {/* Cover image */}
                    {spv.coverImage ? (
                      <div className="w-48 flex-shrink-0 relative hidden sm:block">
                        <img src={spv.coverImage} alt="" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/10" />
                      </div>
                    ) : (
                      <div className="w-48 flex-shrink-0 bg-sky-50 hidden sm:flex items-center justify-center">
                        <Building2 size={32} className="text-sky-300" />
                      </div>
                    )}

                    <div className="flex-1 p-5 min-w-0">
                      {/* Header row */}
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-sky-600 bg-sky-50 border border-sky-100 rounded-full px-2 py-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" /> Live
                            </span>
                            <span className="text-xs text-gray-400">{spv.propertyType}</span>
                          </div>
                          <p className="font-bold text-gray-900 text-base leading-snug truncate">{spv.propertyDisplayName}</p>
                          <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                            <MapPin size={11} className="flex-shrink-0" />
                            <span className="truncate">{spv.propertyAddress}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => openInRegistry(spv)}
                          className="flex items-center gap-1.5 text-xs font-medium text-sky-600 border border-sky-200 px-3 py-1.5 rounded-xl hover:bg-sky-50 transition-colors flex-shrink-0"
                        >
                          View Details <ArrowRight size={12} />
                        </button>
                      </div>

                      {/* Metrics grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-[10px] text-gray-400 mb-0.5">Total Valuation</p>
                          <p className="text-sm font-bold text-gray-900 tabular-nums">{fmtCHF(spv.totalValuation)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-[10px] text-gray-400 mb-0.5">Monthly Rent</p>
                          <p className="text-sm font-bold text-gray-900 tabular-nums">{fmtCHF(spv.monthlyRent)}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="text-[10px] text-gray-400">Occupancy</p>
                          </div>
                          {occ !== null ? (
                            <div>
                              <p className="text-sm font-bold text-gray-900">{occ}%</p>
                              <div className="mt-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-sky-500"
                                  style={{ width: `${occ}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm font-bold text-gray-400">—</p>
                          )}
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3">
                          <p className="text-[10px] text-gray-400 mb-0.5">Last Rent Date</p>
                          <div className="flex items-center gap-1">
                            <CalendarDays size={11} className="text-gray-400 flex-shrink-0" />
                            <p className="text-sm font-bold text-gray-900">{fmtDate(spv.financials?.lastRentDate)}</p>
                          </div>
                        </div>
                      </div>

                      {/* Secondary info */}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                        <span><span className="font-medium text-gray-600">{spv.numberOfUnits}</span> units</span>
                        <span><span className="font-medium text-gray-600">{spv.targetAPY}%</span> APY</span>
                        <span><span className="font-medium text-gray-600">{spv.managementFee}%</span> mgmt fee</span>
                        <span className="ml-auto">{spv.legalName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

      </div>
    </Layout>
  )
}
