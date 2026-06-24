import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { prospects as allProspects } from '@/data/mockData'
import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'
import { exportMemoToPDF } from '@/utils/exportMemo'
import { ArrowLeft, CheckCircle2, Building2, MapPin, Send, AlertTriangle, Lock, FileText, Bookmark, X } from 'lucide-react'

const fmtChf = (n) =>
  new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }).format(n)

function defaultSoft(prospect) {
  return {
    negotiatedPrice: Math.round(prospect.askingPrice * 0.93),
    vacancyRate: 5,
    spvMgmtFee: 8,
    platformFee: 5,
    capitalBuffer: 5,
  }
}

function calculate(prospect, soft) {
  const { negotiatedPrice, vacancyRate, spvMgmtFee, platformFee, capitalBuffer } = soft
  const totalCapital = (negotiatedPrice + prospect.estimatedCapex) * (1 + capitalBuffer / 100)
  const effectiveRent = prospect.currentGrossRent * (1 - vacancyRate / 100)
  const spvMgmtFeeAmt = effectiveRent * (spvMgmtFee / 100)
  const platformFeeAmt = effectiveRent * (platformFee / 100)
  const noi = effectiveRent - prospect.fixedOpCosts
  const holderIncome = noi - spvMgmtFeeAmt - platformFeeAmt
  const holderAPY = totalCapital > 0 ? (holderIncome / totalCapital) * 100 : 0
  return { totalCapital, noi, holderAPY, platformProfit: platformFeeAmt }
}

function apyMeta(apy) {
  if (apy >= 8)  return { color: 'text-green-700', border: 'border-green-200', badge: 'bg-green-600', label: 'Strong Deal'        }
  if (apy >= 6)  return { color: 'text-amber-700', border: 'border-amber-200', badge: 'bg-amber-500', label: 'Borderline'         }
  return           { color: 'text-red-700',   border: 'border-red-200',   badge: 'bg-red-600',   label: 'Below 6% Threshold' }
}

export function ScenarioModeler() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    simSelectedIds, simScenarios, initSimScenario, updateSimScenario,
    saveSimulation, savedScenarios, loadSimulation, deleteSimulation,
  } = useData()

  const selectedProspects = simSelectedIds
    .map(id => allProspects.find(p => p.id === id))
    .filter(Boolean)

  // Initialize default soft-variable values for any prospect not yet in context
  useEffect(() => {
    selectedProspects.forEach(p => initSimScenario(p.id, defaultSoft(p)))
  }, [simSelectedIds])

  const [approved, setApproved] = useState(new Set())
  const [showSaveForm, setShowSaveForm] = useState(false)
  const [simSaveName, setSimSaveName] = useState('')

  const handleSaveSimulation = () => {
    const name = simSaveName.trim()
    if (!name) return
    saveSimulation(name, simSelectedIds, simScenarios)
    setShowSaveForm(false)
    setSimSaveName('')
  }

  const handleLoadSimulation = (id) => {
    loadSimulation(id)
    setApproved(new Set())
    setShowSaveForm(false)
  }

  const fmtSimDate = (iso) =>
    new Date(iso).toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false })

  const handleExport = () => {
    const rows = selectedProspects.map(p => ({
      prospect: p,
      soft: simScenarios[p.id] || defaultSoft(p),
      output: calculate(p, simScenarios[p.id] || defaultSoft(p)),
      isApproved: approved.has(p.id),
    }))
    const timestamp = new Date().toLocaleString('en-GB', {
      day: '2-digit', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).replace(',', '')
    exportMemoToPDF({ rows, userName: user?.name || 'Research User', timestamp })
  }

  if (selectedProspects.length < 2) {
    return (
      <Layout>
        <Header title="Scenario Modeler" subtitle="Side-by-side investment simulation" />
        <div className="ds-page space-y-8">

          {/* Empty state */}
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <SlidersHorizontalIcon />
            <p className="text-gray-700 font-semibold mt-4 mb-1">No properties selected</p>
            <p className="text-sm text-gray-400 mb-6 max-w-xs">
              Select 2–3 properties from the Prospecting Board and click "Run Side-by-Side Simulation".
            </p>
            <button
              onClick={() => navigate('/research/board')}
              className="flex items-center gap-2 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white rounded-xl text-sm font-semibold transition-colors shadow-md shadow-sky-200"
            >
              <ArrowLeft size={14} /> Back to Prospecting Board
            </button>
          </div>

          {/* Saved simulations — visible even with no active selection */}
          {(savedScenarios || []).length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Bookmark size={13} className="text-gray-400" />
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Saved Simulations</p>
              </div>
              <div className="flex gap-3 flex-wrap">
                {savedScenarios.map(sim => (
                  <div key={sim.id} className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 w-64 flex flex-col gap-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-bold text-gray-800 leading-tight truncate">{sim.name}</p>
                      <button
                        onClick={() => deleteSimulation(sim.id)}
                        className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors mt-0.5"
                      >
                        <X size={12} />
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400">{fmtSimDate(sim.createdAt)}</p>
                    <p className="text-[10px] text-sky-600 truncate leading-snug">
                      {sim.propertyIds.map(id => allProspects.find(p => p.id === id)?.name || id).join(' · ')}
                    </p>
                    <button
                      onClick={() => handleLoadSimulation(sim.id)}
                      className="mt-0.5 w-full text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 py-1.5 rounded-lg transition-colors"
                    >
                      Load Simulation
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Header title="Scenario Modeler" subtitle="Stress-test each deal by adjusting the soft variables — outputs recalculate live" />
      <div className="ds-page space-y-5">

        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/research/board')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Prospecting Board
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowSaveForm(v => !v); setSimSaveName('') }}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-sky-200"
            >
              <Bookmark size={14} /> Save Scenario
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-md shadow-sky-200"
            >
              <FileText size={14} /> Export to PDF
            </button>
          </div>
        </div>

        {/* Inline save form */}
        {showSaveForm && (
          <div className="flex items-center gap-2 bg-white border border-sky-200 rounded-xl px-4 py-3 shadow-sm">
            <Bookmark size={14} className="text-sky-500 flex-shrink-0" />
            <input
              autoFocus
              type="text"
              placeholder="Name this simulation, e.g. Q2 Zurich Comparison…"
              value={simSaveName}
              onChange={e => setSimSaveName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleSaveSimulation()
                if (e.key === 'Escape') { setShowSaveForm(false); setSimSaveName('') }
              }}
              className="flex-1 text-sm bg-transparent border-none outline-none text-gray-800 placeholder-gray-400"
            />
            <button
              onClick={handleSaveSimulation}
              disabled={!simSaveName.trim()}
              className="flex-shrink-0 text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 disabled:bg-gray-200 disabled:text-gray-400 px-3 py-1.5 rounded-lg transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => { setShowSaveForm(false); setSimSaveName('') }}
              className="flex-shrink-0 text-gray-400 hover:text-gray-700 p-1 rounded"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ── Saved Simulations list ── */}
        {(savedScenarios || []).length > 0 && (
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Saved Simulations</p>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {savedScenarios.map(sim => (
                <div key={sim.id} className="flex-shrink-0 bg-white border border-gray-200 rounded-xl px-3 py-2.5 w-64 flex flex-col gap-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-bold text-gray-800 leading-tight truncate">{sim.name}</p>
                    <button
                      onClick={() => deleteSimulation(sim.id)}
                      className="flex-shrink-0 text-gray-300 hover:text-red-400 transition-colors mt-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400">{fmtSimDate(sim.createdAt)}</p>
                  <p className="text-[10px] text-sky-600 truncate leading-snug">
                    {sim.propertyIds.map(id => allProspects.find(p => p.id === id)?.name || id).join(' · ')}
                  </p>
                  <button
                    onClick={() => handleLoadSimulation(sim.id)}
                    className="mt-0.5 w-full text-xs font-bold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 py-1.5 rounded-lg transition-colors"
                  >
                    Load Simulation
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Side-by-side columns */}
        <div className={`grid gap-5 items-start ${selectedProspects.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
          {selectedProspects.map(prospect => {
            const soft = simScenarios[prospect.id] || defaultSoft(prospect)
            const output = calculate(prospect, soft)
            const meta = apyMeta(output.holderAPY)
            const isApproved = approved.has(prospect.id)
            const negotiatedMin = Math.round(prospect.askingPrice * 0.70)
            const negotiatedMax = Math.round(prospect.askingPrice * 1.10)

            return (
              <div key={prospect.id} className="flex flex-col min-w-0 rounded-2xl border border-gray-200 shadow-sm bg-white overflow-hidden">

                {/* ── Property image ── */}
                {prospect.coverImage ? (
                  <img src={prospect.coverImage} alt="" className="w-full h-36 object-cover" />
                ) : (
                  <div className="w-full h-36 bg-sky-50 flex items-center justify-center">
                    <Building2 size={32} className="text-sky-200" />
                  </div>
                )}

                {/* ── Property info ── */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="font-bold text-gray-900 text-sm leading-tight">{prospect.name}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <MapPin size={11} className="text-gray-400 flex-shrink-0" />
                    <p className="text-xs text-gray-500 truncate">{prospect.city} · {prospect.propertyType} · {prospect.units} units · {prospect.sqm} m²</p>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">Broker: {prospect.broker}</p>
                </div>

                {/* ── Hard Variables ── */}
                <div className="px-4 py-4 border-b border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Hard Variables</p>
                  <div className="space-y-2.5">
                    <HardRow label="Asking Price" value={fmtChf(prospect.askingPrice)} />
                    <HardRow label="Est. Capex / Renovations" value={fmtChf(prospect.estimatedCapex)} />
                    <HardRow label="Current Gross Rent / yr" value={fmtChf(prospect.currentGrossRent)} />
                    <HardRow label="Fixed Operational Costs / yr" value={fmtChf(prospect.fixedOpCosts)} />
                  </div>
                </div>

                {/* ── Soft Variables ── */}
                <div className="px-4 py-4 border-b border-gray-100">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Soft Variables</p>
                  <div className="space-y-5">
                    <SliderRow
                      label="Negotiated Purchase Price"
                      value={soft.negotiatedPrice}
                      min={negotiatedMin}
                      max={negotiatedMax}
                      step={5000}
                      format={v => fmtChf(v)}
                      onChange={v => updateSimScenario(prospect.id, 'negotiatedPrice', v)}
                      disabled={isApproved}
                      unit="CHF"
                    />
                    <SliderRow
                      label="Target Vacancy Rate"
                      value={soft.vacancyRate}
                      min={0} max={30} step={0.5}
                      format={v => `${v}%`}
                      onChange={v => updateSimScenario(prospect.id, 'vacancyRate', v)}
                      disabled={isApproved}
                      unit="%"
                    />
                    <SliderRow
                      label="SPV Management Fee"
                      value={soft.spvMgmtFee}
                      min={0} max={20} step={0.5}
                      format={v => `${v}%`}
                      onChange={v => updateSimScenario(prospect.id, 'spvMgmtFee', v)}
                      disabled={isApproved}
                      unit="%"
                    />
                    <SliderRow
                      label="Platform Fee"
                      value={soft.platformFee}
                      min={0} max={15} step={0.5}
                      format={v => `${v}%`}
                      onChange={v => updateSimScenario(prospect.id, 'platformFee', v)}
                      disabled={isApproved}
                      unit="%"
                    />
                    <SliderRow
                      label="Capital Buffer"
                      value={soft.capitalBuffer}
                      min={0} max={20} step={0.5}
                      format={v => `${v}%`}
                      onChange={v => updateSimScenario(prospect.id, 'capitalBuffer', v)}
                      disabled={isApproved}
                      unit="%"
                    />
                  </div>
                </div>

                {/* ── Simulation Outputs ── */}
                <div className="bg-slate-50 px-4 py-4 border-b border-gray-100 flex-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Simulation Outputs</p>

                  {/* APY hero — white card with colored border only */}
                  <div className={`bg-white rounded-xl border ${meta.border} p-4 text-center mb-3`}>
                    <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-1">Projected Holder APY</p>
                    <p className={`text-5xl font-black leading-none tracking-tight ${meta.color}`}>
                      {output.holderAPY.toFixed(1)}%
                    </p>
                    <span className={`inline-block mt-2.5 px-3 py-0.5 rounded-full text-xs font-bold text-white ${meta.badge}`}>
                      {meta.label}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <OutputRow
                      label="Total Capital to Raise"
                      value={fmtChf(output.totalCapital)}
                      note="Negotiated price + Capex + Buffer"
                    />
                    <div className="border-t border-gray-200 pt-3">
                      <OutputRow
                        label="Net Operating Income (NOI)"
                        value={fmtChf(output.noi)}
                        note="Effective rent − fixed costs"
                      />
                    </div>
                    <OutputRow
                      label="Platform Profit / yr"
                      value={fmtChf(output.platformProfit)}
                      note="Platform fee × effective rent"
                    />
                  </div>
                </div>

                {/* ── Approve ── */}
                <div className="px-4 py-3 bg-white">
                  {isApproved ? (
                    <div className="rounded-xl border border-green-300 bg-green-50 p-3 text-center">
                      <CheckCircle2 size={22} className="text-green-600 mx-auto mb-1.5" />
                      <p className="text-sm font-bold text-green-800">Approved &amp; Sent to SPV Pipeline</p>
                      <p className="text-xs text-green-600 mt-0.5">Numbers locked — property now in Admin SPV Registry queue.</p>
                      <div className="flex items-center justify-center gap-1 mt-1.5 text-xs text-green-700">
                        <Lock size={11} /> Numbers locked
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setApproved(prev => new Set([...prev, prospect.id]))}
                      disabled={output.holderAPY < 6}
                      className={`w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-colors ${
                        output.holderAPY >= 6
                          ? 'bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white shadow-md shadow-sky-200'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {output.holderAPY >= 6
                        ? <><Send size={15} /> Approve &amp; Send to SPV Pipeline</>
                        : <><AlertTriangle size={15} /> APY Below 6% — Cannot Approve</>
                      }
                    </button>
                  )}
                </div>

              </div>
            )
          })}
        </div>
      </div>
    </Layout>
  )
}

function SlidersHorizontalIcon() {
  return (
    <div className="w-16 h-16 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center mx-auto">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0284c7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="4" y1="21" x2="4" y2="14" /><line x1="4" y1="10" x2="4" y2="3" />
        <line x1="12" y1="21" x2="12" y2="12" /><line x1="12" y1="8" x2="12" y2="3" />
        <line x1="20" y1="21" x2="20" y2="16" /><line x1="20" y1="12" x2="20" y2="3" />
        <line x1="1" y1="14" x2="7" y2="14" /><line x1="9" y1="8" x2="15" y2="8" /><line x1="17" y1="16" x2="23" y2="16" />
      </svg>
    </div>
  )
}

function HardRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-gray-500 leading-tight">{label}</span>
      <span className="text-sm font-semibold text-gray-900 whitespace-nowrap tabular-nums text-right">{value}</span>
    </div>
  )
}

function SliderRow({ label, value, min, max, step, format, onChange, disabled, unit }) {
  const pct = ((value - min) / (max - min)) * 100

  const handleInputChange = (e) => {
    const raw = Number(e.target.value)
    if (!isNaN(raw) && e.target.value !== '') {
      onChange(Math.min(max, Math.max(min, raw)))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <span className="text-xs text-gray-600 leading-tight min-w-0">{label}</span>
        <div className={`flex items-center flex-shrink-0 border border-gray-200 rounded-lg overflow-hidden bg-white ${disabled ? 'opacity-40' : ''}`}>
          {unit === 'CHF' && (
            <span className="text-[10px] text-gray-400 font-medium pl-2 select-none">CHF</span>
          )}
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            onChange={handleInputChange}
            className={`text-right text-xs font-bold px-2 py-1 bg-white text-sky-700 focus:outline-none focus:ring-1 focus:ring-sky-400 tabular-nums disabled:cursor-not-allowed ${
              unit === 'CHF' ? 'w-28' : 'w-14'
            }`}
          />
          {unit === '%' && (
            <span className="text-[10px] text-gray-400 font-medium pr-2 select-none">%</span>
          )}
        </div>
      </div>
      <input
        type="range"
        min={min} max={max} step={step}
        value={value}
        disabled={disabled}
        onChange={e => onChange(Number(e.target.value))}
        className={`w-full h-1.5 rounded-full appearance-none ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
        style={{
          background: disabled
            ? '#e5e7eb'
            : `linear-gradient(to right, #0284c7 ${pct}%, #e5e7eb ${pct}%)`,
          accentColor: '#0284c7',
        }}
      />
      <div className="flex justify-between mt-0.5">
        <span className="text-[10px] text-gray-400">{format(min)}</span>
        <span className="text-[10px] text-gray-400">{format(max)}</span>
      </div>
    </div>
  )
}

function OutputRow({ label, value, note }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-gray-700 leading-tight">{label}</p>
        {note && <p className="text-[10px] text-gray-400 mt-0.5">{note}</p>}
      </div>
      <p className="text-sm font-bold text-gray-900 whitespace-nowrap flex-shrink-0 tabular-nums text-right">{value}</p>
    </div>
  )
}
