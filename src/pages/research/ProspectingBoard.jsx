import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { useData } from '@/context/DataContext'
import { LayoutGrid, LayoutList, PlayCircle, Building2, MapPin, ChevronDown, Clock } from 'lucide-react'

const fmtChf = (n) =>
  new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }).format(n)

const fmtChfShort = (n) => {
  if (n >= 1_000_000) return `CHF ${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `CHF ${(n / 1_000).toFixed(0)}K`
  return fmtChf(n)
}

const TODAY = new Date('2026-06-24')

function daysInPipeline(addedDate) {
  const added = new Date(addedDate)
  return Math.floor((TODAY - added) / (1000 * 60 * 60 * 24))
}

function grossYield(p) {
  return ((p.currentGrossRent / p.askingPrice) * 100)
}

function pricePerSqm(p) {
  return Math.round(p.askingPrice / p.sqm)
}

const yieldMeta = (pct) => {
  if (pct >= 8)  return { color: 'text-green-700', bg: 'bg-green-50', label: `${pct.toFixed(1)}%` }
  if (pct >= 6)  return { color: 'text-amber-700', bg: 'bg-amber-50', label: `${pct.toFixed(1)}%` }
  return           { color: 'text-red-700',   bg: 'bg-red-50',   label: `${pct.toFixed(1)}%` }
}

const occupancyMeta = (pct) => {
  if (pct >= 95) return { color: 'text-green-700', bg: 'bg-green-50' }
  if (pct >= 75) return { color: 'text-amber-700', bg: 'bg-amber-50' }
  return           { color: 'text-red-700',   bg: 'bg-red-50'   }
}

const conditionMeta = {
  'Turnkey':    { bg: 'bg-green-100',  text: 'text-green-800'  },
  'Value-Add':  { bg: 'bg-amber-100',  text: 'text-amber-800'  },
  'Heavy Capex':{ bg: 'bg-red-100',    text: 'text-red-800'    },
}

const typeMeta = (t) => {
  const lexKoller = ['Residential', 'Multi-Family'].includes(t)
  return lexKoller
    ? { bg: 'bg-amber-100', text: 'text-amber-800', flag: '⚠ Lex Koller' }
    : { bg: 'bg-green-100', text: 'text-green-800', flag: null }
}

const STATUSES = [
  { key: 'initial_scouting', label: 'Initial Scouting', dot: 'bg-slate-400', pillBg: 'bg-slate-50',  pillText: 'text-slate-700', pillBorder: 'border-slate-200' },
  { key: 'underwriting',     label: 'Underwriting',     dot: 'bg-blue-400',  pillBg: 'bg-blue-50',   pillText: 'text-blue-700',  pillBorder: 'border-blue-200'  },
  { key: 'site_visit',       label: 'Site Visit',       dot: 'bg-amber-400', pillBg: 'bg-amber-50',  pillText: 'text-amber-700', pillBorder: 'border-amber-200' },
  { key: 'rejected',         label: 'Rejected',         dot: 'bg-red-400',   pillBg: 'bg-red-50',    pillText: 'text-red-700',   pillBorder: 'border-red-200'   },
  { key: 'approved',         label: 'Approved for SPV', dot: 'bg-green-400', pillBg: 'bg-green-50',  pillText: 'text-green-700', pillBorder: 'border-green-200' },
]

const statusMap = Object.fromEntries(STATUSES.map(s => [s.key, s]))

export function ResearchBoard() {
  const navigate = useNavigate()
  const { prospects, updateProspect, simSelectedIds, toggleSimSelection } = useData()
  const [view, setView] = useState('cards')
  const [statusFilter, setStatusFilter] = useState('all')

  const filtered = statusFilter === 'all'
    ? prospects
    : prospects.filter(p => p.status === statusFilter)

  const countFor = (key) =>
    key === 'all' ? prospects.length : prospects.filter(p => p.status === key).length

  const moveStatus = (id, newStatus) => {
    updateProspect(id, { status: newStatus })
  }

  const runSimulation = () => {
    if (simSelectedIds.length < 2) return
    navigate('/research/simulate')
  }

  return (
    <Layout>
      <Header title="Prospecting Board" subtitle="Track and evaluate properties through the research pipeline" />
      <div className="ds-page space-y-4">

        {/* ── Status filter pills ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {[{ key: 'all', label: 'All', dot: null }, ...STATUSES].map(s => {
            const active = statusFilter === s.key
            return (
              <button
                key={s.key}
                onClick={() => setStatusFilter(s.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                  active
                    ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-sky-300 hover:text-sky-700'
                }`}
              >
                {s.dot && (
                  <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${active ? 'bg-white/70' : s.dot}`} />
                )}
                {s.label}
                <span className={`ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold tabular-nums ${
                  active ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {countFor(s.key)}
                </span>
              </button>
            )
          })}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => setView('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
                  view === 'cards' ? 'bg-sky-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <LayoutGrid size={14} /> Cards
              </button>
              <button
                onClick={() => setView('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border-l border-gray-200 transition-colors ${
                  view === 'list' ? 'bg-sky-600 text-white border-sky-600' : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <LayoutList size={14} /> List
              </button>
            </div>
            <span className="text-xs text-gray-400">
              {filtered.length}{filtered.length !== prospects.length ? ` of ${prospects.length}` : ''} {filtered.length === 1 ? 'property' : 'properties'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {simSelectedIds.length > 0 && (
              <span className="text-xs text-gray-500 font-medium">{simSelectedIds.length}/3 selected</span>
            )}

            <button
              disabled={simSelectedIds.length < 2}
              onClick={runSimulation}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                simSelectedIds.length >= 2
                  ? 'bg-sky-600 hover:bg-sky-700 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <PlayCircle size={15} />
              Run Simulation
              {simSelectedIds.length >= 2 && (
                <span className="w-5 h-5 rounded-full bg-white/25 text-white text-xs font-bold flex items-center justify-center">
                  {simSelectedIds.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {simSelectedIds.length > 0 && (
          <div className="text-xs text-sky-700 bg-sky-50 border border-sky-200 rounded-lg px-3 py-2">
            {simSelectedIds.length === 1
              ? 'Select 1 more property to enable the simulation (max 3).'
              : `${simSelectedIds.length} properties selected — click "Run Simulation" to compare them side-by-side.`}
          </div>
        )}

        {view === 'cards'
          ? <CardsView prospects={filtered} selected={simSelectedIds} onToggleSelect={toggleSimSelection} onMoveStatus={moveStatus} onCardSelect={toggleSimSelection} />
          : <RowsView  prospects={filtered} selected={simSelectedIds} onToggleSelect={toggleSimSelection} onMoveStatus={moveStatus} />
        }
      </div>
    </Layout>
  )
}

// ── Cards grid ────────────────────────────────────────────────────────────────

function CardsView({ prospects, selected, onToggleSelect, onMoveStatus, onCardSelect }) {
  if (prospects.length === 0) return <EmptyState />
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-start">
      {prospects.map(p => (
        <ProspectCard
          key={p.id}
          prospect={p}
          isSelected={selected.includes(p.id)}
          canSelect={selected.length < 3 || selected.includes(p.id)}
          onToggle={() => onToggleSelect(p.id)}
          onMove={onMoveStatus}
          onCardSelect={() => onCardSelect(p.id)}
        />
      ))}
    </div>
  )
}

function ProspectCard({ prospect: p, isSelected, canSelect, onToggle, onMove, onCardSelect }) {
  const [showMove, setShowMove] = useState(false)
  const status  = statusMap[p.status]
  const days    = daysInPipeline(p.addedDate)
  const yld     = grossYield(p)
  const yMeta   = yieldMeta(yld)
  const oMeta   = occupancyMeta(p.occupancyRate)
  const cMeta   = conditionMeta[p.condition] || conditionMeta['Value-Add']
  const tMeta   = typeMeta(p.propertyType)
  const lexKoller = tMeta.flag !== null

  return (
    <div className={`bg-white rounded-2xl border transition-all shadow-sm hover:shadow-md flex flex-col ${
      isSelected ? 'border-sky-400 ring-2 ring-sky-100' : 'border-gray-200'
    }`}>

      {/* ── TOP: Image + badges ── */}
      {/* No overflow-hidden here so the tooltip can escape; rounding applied directly to image/gradient */}
      <div className="relative flex-shrink-0 rounded-t-2xl">
        {p.coverImage
          ? <img src={p.coverImage} alt="" className="w-full h-24 object-cover rounded-t-2xl" />
          : <div className="w-full h-24 bg-sky-50 flex items-center justify-center rounded-t-2xl"><Building2 size={22} className="text-sky-200" /></div>
        }
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent rounded-t-2xl pointer-events-none" />

        {/* Condition + Type badges — top left */}
        <div className="absolute top-2 left-2 flex items-center gap-1">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${cMeta.bg} ${cMeta.text}`}>
            {p.condition}
          </span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${tMeta.bg} ${tMeta.text}`}>
            {p.propertyType}{lexKoller ? ' ⚠' : ''}
          </span>
        </div>

        {/* Checkbox — top right */}
        <div className="absolute top-2 right-2 flex items-center gap-1.5">
          {isSelected && (
            <span className="text-[9px] font-bold text-white bg-sky-600 px-1.5 py-0.5 rounded-full">✓</span>
          )}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggle}
            disabled={!canSelect}
            className="w-3.5 h-3.5 accent-sky-600 cursor-pointer"
          />
        </div>

        {/* City + days in pipeline — bottom overlay */}
        <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[9px] font-semibold text-white/90">
            <MapPin size={8} />
            {p.city}, {p.canton}
          </span>

          {/* Days badge + tooltip */}
          <div className="relative group">
            <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-1.5 py-0.5 rounded-full cursor-default ${
              days > 30 ? 'bg-red-500/80 text-white' : days > 14 ? 'bg-amber-400/80 text-white' : 'bg-white/20 text-white'
            }`}>
              <Clock size={8} />
              {days}d
            </span>

            {/* Tooltip — appears above the badge */}
            <div className="absolute bottom-full right-0 mb-2 w-36 hidden group-hover:block z-50 pointer-events-none">
              <div className="bg-gray-900 rounded-xl px-3 py-2.5 shadow-xl">
                <p className="text-[9px] font-bold text-gray-500 uppercase tracking-wider mb-2">Pipeline age</p>
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/30 flex-shrink-0" />
                    <span className="text-[10px] text-white">≤ 14d — new</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    <span className="text-[10px] text-white">15–30d — aging</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                    <span className="text-[10px] text-white">&gt; 30d — stale</span>
                  </div>
                </div>
              </div>
              {/* Arrow pointing down toward the badge */}
              <div className="flex justify-end pr-3">
                <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-gray-900" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── MIDDLE: Name + broker ── */}
      <div className="px-3 pt-2 pb-0">
        <p className="font-bold text-gray-900 text-xs leading-snug truncate">{p.name}</p>
        <p className="text-[10px] text-gray-400 truncate">Broker: {p.broker}</p>
      </div>

      {/* ── METRICS: 4-column strip ── */}
      <div className="grid grid-cols-4 px-3 py-1.5 border-t border-gray-100 gap-x-1">
        <div>
          <p className="text-[7px] text-gray-400 uppercase tracking-wide leading-none">Price</p>
          <p className="text-[10px] font-black text-gray-900 tabular-nums leading-tight mt-0.5">{fmtChfShort(p.askingPrice)}</p>
        </div>
        <div>
          <p className="text-[7px] text-gray-400 uppercase tracking-wide leading-none">Yield</p>
          <p className={`text-[10px] font-black tabular-nums leading-tight mt-0.5 ${yMeta.color}`}>{yMeta.label}</p>
        </div>
        <div>
          <p className="text-[7px] text-gray-400 uppercase tracking-wide leading-none">CHF/m²</p>
          <p className="text-[10px] font-black text-sky-700 tabular-nums leading-tight mt-0.5">
            {new Intl.NumberFormat('de-CH').format(pricePerSqm(p))}
          </p>
        </div>
        <div>
          <p className="text-[7px] text-gray-400 uppercase tracking-wide leading-none">Occ.</p>
          <p className={`text-[10px] font-black tabular-nums leading-tight mt-0.5 ${oMeta.color}`}>{p.occupancyRate}%</p>
        </div>
      </div>

      {/* ── FOOTER: Status + actions ── */}
      <div className="px-3 pb-3 mt-auto space-y-1.5">
        {/* Status badge */}
        <div className="flex items-center justify-between">
          <span className={`inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.5 rounded-full border ${status.pillBg} ${status.pillText} ${status.pillBorder}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
          <span className="text-[9px] text-gray-400">{p.units}u · {p.sqm}m²</span>
        </div>

        {/* Actions row */}
        <div className="flex gap-1">
          {/* Move stage dropdown */}
          <div className="relative flex-1">
            <button
              onClick={() => setShowMove(v => !v)}
              className="w-full flex items-center justify-between text-[11px] border border-gray-200 bg-white hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
            >
              <span className="flex items-center gap-1.5 text-gray-600">
                <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${status.dot}`} />
                {status.label}
              </span>
              <ChevronDown size={10} className={`text-gray-400 flex-shrink-0 transition-transform ${showMove ? 'rotate-180' : ''}`} />
            </button>
            {showMove && (
              <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-200 shadow-xl overflow-hidden">
                {STATUSES.filter(st => st.key !== p.status).map(st => (
                  <button
                    key={st.key}
                    onClick={() => { onMove(p.id, st.key); setShowMove(false) }}
                    className="w-full text-left text-xs px-3 py-1.5 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                  >
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${st.dot}`} />
                    {st.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Selection toggle button */}
          <button
            onClick={onCardSelect}
            disabled={!canSelect && !isSelected}
            title={isSelected ? 'Remove from simulation' : canSelect ? 'Add to simulation' : 'Max 3 properties selected'}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-bold transition-colors flex-shrink-0 ${
              isSelected
                ? 'bg-sky-100 text-sky-700 hover:bg-red-50 hover:text-red-600 border border-sky-200 hover:border-red-200'
                : canSelect
                  ? 'bg-sky-600 hover:bg-sky-700 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSelected ? '✓ In Sim' : '+ Select'}
          </button>
        </div>

      </div>
    </div>
  )
}

// ── Rows list ─────────────────────────────────────────────────────────────────

function RowsView({ prospects, selected, onToggleSelect, onMoveStatus }) {
  if (prospects.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200">
        <EmptyState />
      </div>
    )
  }
  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="w-10 px-4 py-3" />
            <th className="w-10 px-2 py-3" />
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Property</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">Asking Price</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Units</th>
            <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">sqm</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden sm:table-cell">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">Added</th>
            <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Move To</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {prospects.map(p => {
            const isSelected = selected.includes(p.id)
            const canSelect  = selected.length < 3 || isSelected
            const s = statusMap[p.status]
            return (
              <tr
                key={p.id}
                className={`transition-colors ${isSelected ? 'bg-sky-50' : 'hover:bg-gray-50/50'}`}
              >
                {/* Checkbox */}
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(p.id)}
                    disabled={!canSelect}
                    className="w-4 h-4 accent-sky-600 cursor-pointer"
                  />
                </td>

                {/* Thumbnail */}
                <td className="px-2 py-3">
                  {p.coverImage
                    ? <img src={p.coverImage} alt="" className="w-12 h-9 rounded-lg object-cover" />
                    : <div className="w-12 h-9 rounded-lg bg-sky-50 flex items-center justify-center"><Building2 size={14} className="text-sky-300" /></div>
                  }
                </td>

                {/* Name + location */}
                <td className="px-4 py-3">
                  <p className="text-sm font-bold text-gray-900 truncate max-w-[200px]">{p.name}</p>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
                    <MapPin size={10} className="flex-shrink-0" />
                    <span className="truncate">{p.city} · {p.propertyType}</span>
                  </div>
                </td>

                {/* Asking Price */}
                <td className="px-4 py-3 text-right hidden md:table-cell">
                  <p className="text-sm font-semibold text-gray-900 tabular-nums whitespace-nowrap">{fmtChf(p.askingPrice)}</p>
                </td>

                {/* Units */}
                <td className="px-4 py-3 text-center hidden lg:table-cell">
                  <p className="text-sm font-semibold text-gray-700">{p.units}</p>
                </td>

                {/* sqm */}
                <td className="px-4 py-3 text-center hidden lg:table-cell">
                  <p className="text-sm font-semibold text-gray-700">{p.sqm}</p>
                </td>

                {/* Status */}
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${s.pillBg} ${s.pillText} ${s.pillBorder}`}>
                    <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                    {s.label}
                  </span>
                </td>

                {/* Added date */}
                <td className="px-4 py-3 text-xs text-gray-400 hidden lg:table-cell whitespace-nowrap">{p.addedDate}</td>

                {/* Move to */}
                <td className="px-4 py-3 text-right">
                  <select
                    value={p.status}
                    onChange={e => onMoveStatus(p.id, e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-600 bg-white cursor-pointer"
                  >
                    {STATUSES.map(st => (
                      <option key={st.key} value={st.key}>{st.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="py-16 text-center">
      <Building2 size={32} className="text-gray-200 mx-auto mb-3" />
      <p className="text-sm text-gray-500 font-medium">No properties in this stage</p>
      <p className="text-xs text-gray-400 mt-1">Try selecting a different filter above</p>
    </div>
  )
}
