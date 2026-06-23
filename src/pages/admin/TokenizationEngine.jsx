import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useData } from '@/context/DataContext'
import { Cpu, CheckCircle2, Zap, ArrowRight, Info, AlertCircle, Copy, ExternalLink, Activity, FileText } from 'lucide-react'

const fmt    = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
const fmtNum = (n) => new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n)
const fmtChf = (n) => `CHF ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(n)}`
const shortAddr = (addr) => addr ? addr.slice(0, 6) + '...' + addr.slice(-4) : '—'
const genWallet = () => '0x' + Array.from({ length: 40 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')

const steps = [
  { id: 1, label: 'SPV Validated',          desc: 'Documents verified, legal checks passed' },
  { id: 2, label: 'LLC Confirmed',           desc: 'Business entity linked to property' },
  { id: 3, label: 'Valuation Set',           desc: 'Appraisal reviewed and price approved' },
  { id: 4, label: 'Brick Count Defined',     desc: 'Total supply and price per Brick set' },
  { id: 5, label: 'Smart Contract Deployed', desc: 'ERC-1155 token deployed on blockchain' },
  { id: 6, label: 'Bricks Minted',           desc: 'Tokens issued and listed on platform' },
]

const defaultForm = {
  spvLegalName: '',
  totalValuation: '',
  tokenSymbol: '',
  pricePerBrick: '',
  publicStorePct: 70,
  sponsorEquityPct: 25,
  liquidityPoolPct: 5,
}

function deriveSymbol(name) {
  return (name || '').split(/[\s\-_]+/).map(w => w[0] || '').join('').toUpperCase().slice(0, 5)
}

const propertyTypeBanners = {
  Commercial:    { color: 'amber', text: 'Commercial properties are generally exempt from Lex Koller restrictions. Foreign investors are permitted.' },
  Industrial:    { color: 'amber', text: 'Industrial/logistics properties are generally exempt from Lex Koller restrictions.' },
  Residential:   { color: 'red',   text: 'Residential properties in Switzerland may be subject to Lex Koller restrictions. Investor KYC must confirm eligibility.' },
  'Multi-Family':{ color: 'red',   text: 'Multi-family residential properties may be subject to Lex Koller restrictions in certain jurisdictions.' },
  Hospitality:   { color: 'amber', text: 'Hospitality properties may require additional compliance checks under applicable local regulations.' },
}

// Static Tailwind classes keyed by colour name (avoids purge issues with dynamic strings)
const LEDGER_BADGE = {
  sky:     'bg-sky-500/20 text-sky-400',
  violet:  'bg-violet-500/20 text-violet-400',
  emerald: 'bg-emerald-500/20 text-emerald-400',
}
const CAP_DOT = {
  sky:    'bg-sky-500',
  violet: 'bg-violet-500',
  emerald:'bg-emerald-500',
}

export function AdminTokenizationEngine() {
  const { spvs, updateSpv } = useData()
  const approvedQueue = spvs.filter(s => s.status === 'approved')

  const [selectedSpv, setSelectedSpv]   = useState(null)
  const [form, setForm]                 = useState(defaultForm)
  const [running, setRunning]           = useState(false)
  const [runStep, setRunStep]           = useState(0)
  const [txHash, setTxHash]             = useState('')

  // Result modal
  const [showResult, setShowResult]     = useState(false)
  const [resultPhase, setResultPhase]   = useState(0)   // 0=asset only  1=+captable  2=+ledger
  const [ledgerCount, setLedgerCount]   = useState(0)
  const [publicWallet, setPublicWallet] = useState('')
  const [sponsorWallet, setSponsorWallet] = useState('')
  const [liqWallet, setLiqWallet]       = useState('')
  const [completedAt, setCompletedAt]   = useState('')

  // ─── Derived ─────────────────────────────────────────────────────────────────
  const totalSupply   = Math.floor((parseFloat(form.totalValuation) || 0) / (parseFloat(form.pricePerBrick) || 1))
  const distTotal     = (parseInt(form.publicStorePct) || 0) + (parseInt(form.sponsorEquityPct) || 0) + (parseInt(form.liquidityPoolPct) || 0)
  const publicBricks  = Math.round(totalSupply * ((parseInt(form.publicStorePct)  || 0) / 100))
  const sponsorBricks = Math.round(totalSupply * ((parseInt(form.sponsorEquityPct)|| 0) / 100))
  const liqBricks     = totalSupply - publicBricks - sponsorBricks

  const capRows = [
    { label: 'Public Store',    dotCls: CAP_DOT.sky,     bricks: publicBricks,  pct: form.publicStorePct,   wallet: publicWallet },
    { label: 'Sponsor Equity',  dotCls: CAP_DOT.violet,  bricks: sponsorBricks, pct: form.sponsorEquityPct, wallet: sponsorWallet },
    { label: 'Liquidity Pool',  dotCls: CAP_DOT.emerald, bricks: liqBricks,     pct: form.liquidityPoolPct, wallet: liqWallet },
  ]

  const ledgerEvents = [
    { type: 'CONTRACT_DEPLOYED', badgeCls: LEDGER_BADGE.sky,     title: 'SPV Smart Contract Created',                           from: 'Admin',       to: txHash ? shortAddr(txHash) : '—' },
    { type: 'MINT',              badgeCls: LEDGER_BADGE.violet,  title: `Minted ${fmtNum(totalSupply)} ${form.tokenSymbol} Bricks`, from: '0x000...000', to: txHash ? shortAddr(txHash) : '—' },
    { type: 'TRANSFER',          badgeCls: LEDGER_BADGE.emerald, title: `Allocated ${fmtNum(publicBricks)} ${form.tokenSymbol} (Public)`,   from: '0x000...000', to: shortAddr(publicWallet) },
    { type: 'TRANSFER',          badgeCls: LEDGER_BADGE.emerald, title: `Allocated ${fmtNum(sponsorBricks)} ${form.tokenSymbol} (Sponsor)`, from: '0x000...000', to: shortAddr(sponsorWallet) },
    { type: 'TRANSFER',          badgeCls: LEDGER_BADGE.emerald, title: `Allocated ${fmtNum(liqBricks)} ${form.tokenSymbol} (Liq. Pool)`,   from: '0x000...000', to: shortAddr(liqWallet) },
  ]

  // ─── Handlers ────────────────────────────────────────────────────────────────
  const handleSelectSpv = (spv) => {
    setSelectedSpv(spv)
    setRunning(false)
    setRunStep(0)
    setShowResult(false)
    setForm({
      spvLegalName:   spv.legalName || spv.propertyDisplayName || '',
      totalValuation: String(spv.totalValuation || ''),
      tokenSymbol:    deriveSymbol(spv.propertyDisplayName || spv.legalName),
      pricePerBrick:  String(spv.pricePerBrick || '100'),
      publicStorePct: 70,
      sponsorEquityPct: 25,
      liquidityPoolPct: 5,
    })
  }

  const handleClearSpv = () => {
    setSelectedSpv(null)
    setForm(defaultForm)
    setRunning(false)
    setRunStep(0)
    setShowResult(false)
    setResultPhase(0)
    setLedgerCount(0)
    setTxHash('')
  }

  const handleRun = () => {
    // Open modal immediately so progress is visible from the first step
    setShowResult(true)
    setRunning(true)
    setRunStep(0)
    setResultPhase(0)
    setLedgerCount(0)

    let s = 0
    const hash = '0x' + Array.from({ length: 40 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('')
    const today = new Date().toISOString().split('T')[0]
    const ts    = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC'

    const interval = setInterval(() => {
      s++
      setRunStep(s)
      if (s >= steps.length) {
        clearInterval(interval)
        if (selectedSpv) {
          updateSpv(selectedSpv.id, {
            status: 'live',
            tokenizationDate: today,
            contractAddress: hash,
            totalBricks: totalSupply,
            pricePerBrick: parseFloat(form.pricePerBrick) || selectedSpv.pricePerBrick,
            monthlyRent: selectedSpv.monthlyRent,
          })
        }
        const pubW  = genWallet()
        const sponW = genWallet()
        const liqW  = genWallet()
        setTxHash(hash)
        setPublicWallet(pubW)
        setSponsorWallet(sponW)
        setLiqWallet(liqW)
        setCompletedAt(ts)
        setRunning(false)

        // Animate result sections
        setTimeout(() => setResultPhase(1), 1500)
        setTimeout(() => {
          setResultPhase(2)
          let lc = 0
          const li = setInterval(() => {
            lc++
            setLedgerCount(lc)
            if (lc >= 5) clearInterval(li)
          }, 600)
        }, 3000)
      }
    }, 700)
  }

  const typeBanner = selectedSpv ? propertyTypeBanners[selectedSpv.propertyType] : null
  const canRun = form.spvLegalName && form.tokenSymbol && form.pricePerBrick && totalSupply > 0 && distTotal === 100

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <Layout>
      <Header title="Brick Maker — Tokenization Engine" subtitle="Convert verified SPVs into digital Bricks" />
      <div className="ds-page">

        <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <Cpu size={16} className="text-sky-600" />
          <p className="text-sm text-sky-700">The Brick Maker officially divides a real-world property (held in an LLC) into digital Bricks on the blockchain. Select an approved property submission below to pre-fill the form, then adjust as needed before minting.</p>
        </div>

        <div className="flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-600" />
          <h2 className="ds-section-title">Approved &amp; Ready to Tokenize</h2>
          {approvedQueue.length > 0 && <Badge variant="success" className="text-xs">{approvedQueue.length} pending</Badge>}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_504px] gap-6 items-start">

          {/* Left: SPV queue */}
          <div>
            {approvedQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
                <CheckCircle2 size={28} className="text-gray-200 mb-3" />
                <p className="text-sm text-gray-400">No SPVs awaiting tokenization.</p>
                <p className="text-xs text-gray-300 mt-1">Approved submissions will appear here for selection.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {approvedQueue.map(spv => {
                  const isSelected = selectedSpv?.id === spv.id
                  return (
                    <div key={spv.id}
                      className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${isSelected ? 'border-sky-500 bg-sky-50 shadow-md' : 'border-gray-200 bg-white hover:border-sky-300 hover:shadow-sm'}`}
                      onClick={() => isSelected ? handleClearSpv() : handleSelectSpv(spv)}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{spv.propertyDisplayName || spv.legalName}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{spv.propertyAddress}</p>
                        </div>
                        {isSelected
                          ? <Badge variant="secondary" className="text-xs bg-sky-100 text-sky-700">Selected</Badge>
                          : <Badge variant="default" className="text-xs">Approved</Badge>}
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="bg-gray-50 rounded-lg p-2"><p className="text-gray-400">Valuation</p><p className="font-bold text-gray-900 mt-0.5">{fmt(spv.totalValuation)}</p></div>
                        <div className="bg-gray-50 rounded-lg p-2"><p className="text-gray-400">Price per Brick</p><p className="font-bold text-gray-900 mt-0.5">{spv.pricePerBrick ? `CHF ${spv.pricePerBrick}` : '—'}</p></div>
                        <div className="bg-gray-50 rounded-lg p-2"><p className="text-gray-400">Total Bricks</p><p className="font-bold text-gray-900 mt-0.5">{spv.totalBricks ? spv.totalBricks.toLocaleString() : '—'}</p></div>
                        <div className="bg-gray-50 rounded-lg p-2"><p className="text-gray-400">Target APY</p><p className="font-bold text-sky-700 mt-0.5">{spv.targetAPY ? `${spv.targetAPY}%` : '—'}</p></div>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
                        <span className="font-medium text-gray-600">{spv.propertyType}</span>
                        <span>·</span><span>{spv.region}</span>
                        <span>·</span><span>{spv.legalName}</span>
                      </div>
                      {!isSelected && (
                        <button className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-sky-600 hover:text-sky-800 transition-colors">
                          <ArrowRight size={12} /> Select for Brick Maker
                        </button>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Right: Configure Tokenization Parameters */}
          <div className="lg:sticky lg:top-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu size={16} className="text-sky-600" />
                  {selectedSpv ? `Tokenization Parameters : ${selectedSpv.propertyDisplayName || selectedSpv.legalName}` : 'Configure Tokenization Parameters'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">

                {(
                  <>
                    {/* 1. ASSET DETAILS */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">1. Asset Details (from Database)</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="ds-label">SPV Legal Name</label>
                          <input value={form.spvLegalName} onChange={e => setForm(f => ({ ...f, spvLegalName: e.target.value }))}
                            className="ds-input" placeholder="e.g. Seefeld Wohnbau AG" />
                        </div>
                        <div>
                          <label className="ds-label">Total Valuation (CHF)</label>
                          <input type="number" value={form.totalValuation} onChange={e => setForm(f => ({ ...f, totalValuation: e.target.value }))}
                            className="ds-input" placeholder="e.g. 6500000" />
                        </div>
                      </div>
                      {typeBanner && (
                        <div className={`rounded-lg p-3 flex items-start gap-2 ${typeBanner.color === 'red' ? 'bg-red-50 border border-red-200' : 'bg-amber-50 border border-amber-200'}`}>
                          <AlertCircle size={13} className={`mt-0.5 flex-shrink-0 ${typeBanner.color === 'red' ? 'text-red-500' : 'text-amber-500'}`} />
                          <div className="text-xs">
                            <p className={`font-semibold ${typeBanner.color === 'red' ? 'text-red-800' : 'text-amber-800'}`}>Property Type: {selectedSpv.propertyType}</p>
                            <p className={`mt-0.5 ${typeBanner.color === 'red' ? 'text-red-700' : 'text-amber-700'}`}>{typeBanner.text}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2. BLOCKCHAIN DETAILS */}
                    <div className="space-y-3">
                      <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">2. Blockchain Details</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="ds-label">Token Symbol</label>
                          <input value={form.tokenSymbol}
                            onChange={e => setForm(f => ({ ...f, tokenSymbol: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) }))}
                            className="ds-input font-mono tracking-wider" placeholder="e.g. SEEFD" />
                        </div>
                        <div>
                          <label className="ds-label">Price Per Brick (CHF)</label>
                          <input type="number" value={form.pricePerBrick} onChange={e => setForm(f => ({ ...f, pricePerBrick: e.target.value }))}
                            className="ds-input" placeholder="100" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between px-3 py-2.5 bg-gray-50 rounded-lg">
                        <span className="text-xs text-gray-500">Total Supply to Mint:</span>
                        <span className="text-base font-bold text-sky-600">{totalSupply > 0 ? `${fmtNum(totalSupply)} Bricks` : '—'}</span>
                      </div>
                    </div>

                    {/* 3. INITIAL DISTRIBUTION */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase">3. Initial Distribution (Cap Table)</p>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${distTotal === 100 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>Total: {distTotal}%</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="ds-label">Public Store %</label>
                          <input type="number" min="0" max="100" value={form.publicStorePct}
                            onChange={e => setForm(f => ({ ...f, publicStorePct: Math.max(0, parseInt(e.target.value) || 0) }))}
                            className="ds-input" />
                          <p className="text-xs text-gray-400 mt-1">{fmtNum(publicBricks)} Bricks</p>
                        </div>
                        <div>
                          <label className="ds-label">Sponsor Equity %</label>
                          <input type="number" min="0" max="100" value={form.sponsorEquityPct}
                            onChange={e => setForm(f => ({ ...f, sponsorEquityPct: Math.max(0, parseInt(e.target.value) || 0) }))}
                            className="ds-input" />
                          <p className="text-xs text-gray-400 mt-1">{fmtNum(sponsorBricks)} Bricks</p>
                        </div>
                        <div>
                          <label className="ds-label">Liquidity Pool %</label>
                          <input type="number" min="0" max="100" value={form.liquidityPoolPct}
                            onChange={e => setForm(f => ({ ...f, liquidityPoolPct: Math.max(0, parseInt(e.target.value) || 0) }))}
                            className="ds-input" />
                          <p className="text-xs text-gray-400 mt-1">{fmtNum(liqBricks)} Bricks</p>
                        </div>
                      </div>
                      <div className="flex rounded-full overflow-hidden h-2 bg-gray-100">
                        <div className="bg-sky-500 transition-all duration-300"     style={{ width: `${Math.min(form.publicStorePct, 100)}%` }} />
                        <div className="bg-violet-500 transition-all duration-300"  style={{ width: `${Math.min(form.sponsorEquityPct, 100)}%` }} />
                        <div className="bg-emerald-500 transition-all duration-300" style={{ width: `${Math.min(form.liquidityPoolPct, 100)}%` }} />
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-gray-500">
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />Public</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-500 inline-block" />Sponsor</span>
                        <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Liquidity</span>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="pt-1 space-y-3">
                      <p className="text-[11px] text-gray-400 flex items-center gap-1.5">
                        <Info size={11} className="flex-shrink-0" /> Will deploy ERC-1643 standard to Polygon network
                      </p>
                      <Button className="w-full" onClick={handleRun} disabled={!canRun}>
                        <Zap size={15} /> Run Tokenization Engine
                      </Button>
                      {distTotal !== 100 && (
                        <p className="text-xs text-red-500 text-center">Distribution must total 100% before minting</p>
                      )}
                      {selectedSpv && (
                        <button onClick={handleClearSpv} className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1">
                          Clear &amp; start fresh
                        </button>
                      )}
                    </div>
                  </>
                )}

              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ── Result Modal ────────────────────────────────────────────────────── */}
      {showResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col">

            {/* Modal header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${running ? 'bg-sky-50' : 'bg-green-100'}`}>
                  {running
                    ? <Cpu size={22} className="text-sky-500 animate-pulse" />
                    : <CheckCircle2 size={22} className="text-green-600" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">{running ? 'Tokenization in Progress…' : 'Tokenization Complete'}</h2>
                    {!running && <span className="bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full tracking-wider">LIVE ON BLOCKCHAIN</span>}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {running
                      ? <>Minting <span className="font-semibold text-sky-600">{fmtNum(totalSupply)} {form.tokenSymbol} Bricks</span> for {form.spvLegalName}</>
                      : <>Successfully minted <span className="font-semibold text-gray-700">{fmtNum(totalSupply)} Bricks</span> for {form.spvLegalName}</>}
                  </p>
                </div>
              </div>
              {!running && (
                <div className="text-right flex-shrink-0">
                  <p className="text-[10px] text-sky-500 font-semibold mb-0.5">Timestamp</p>
                  <p className="text-xs text-sky-600 font-mono">{completedAt}</p>
                </div>
              )}
            </div>

            {/* Modal body */}
            <div className="flex flex-1 overflow-hidden min-h-0">

              {/* ── Running: full-width progress view ── */}
              {running && (
                <div className="flex-1 flex flex-col items-center justify-center p-10 gap-6">
                  <div className="text-center mb-2">
                    <div className="w-14 h-14 rounded-full bg-sky-50 border-2 border-sky-200 flex items-center justify-center mx-auto mb-4">
                      <Cpu size={24} className="text-sky-600 animate-pulse" />
                    </div>
                    <h3 className="text-base font-bold text-gray-900">Tokenizing {form.spvLegalName}</h3>
                    <p className="text-sm text-gray-500 mt-1">Creating <span className="font-semibold text-sky-600">{fmtNum(totalSupply)} {form.tokenSymbol} Bricks</span> at {fmtChf(parseFloat(form.pricePerBrick) || 0)}/Brick</p>
                  </div>
                  <div className="w-full max-w-md">
                    <Progress value={runStep / steps.length * 100} color="blue" />
                    <p className="text-xs text-gray-400 text-right mt-1">{runStep}/{steps.length} steps</p>
                  </div>
                  <div className="w-full max-w-md space-y-2">
                    {steps.map((s, i) => (
                      <div key={s.id} className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-300 ${i < runStep ? 'bg-green-50' : i === runStep ? 'bg-blue-50' : 'bg-gray-50'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold transition-colors duration-300 ${i < runStep ? 'bg-green-500 text-white' : i === runStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'}`}>
                          {i < runStep ? '✓' : s.id}
                        </div>
                        <div className="flex-1">
                          <p className={`text-sm font-medium transition-colors duration-300 ${i < runStep ? 'text-green-800' : i === runStep ? 'text-blue-700' : 'text-gray-400'}`}>{s.label}</p>
                          {i === runStep && <p className="text-xs text-blue-500 animate-pulse">Processing…</p>}
                          {i < runStep  && <p className="text-xs text-green-600">Complete</p>}
                        </div>
                        {i < runStep && <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400">Please wait — deploying smart contract to Polygon network</p>
                </div>
              )}

              {/* ── Done: left panel asset + cap table ── */}
              {!running && <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* Asset Identity & Smart Contract — visible immediately */}
                <div>
                  <p className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
                    <FileText size={13} className="text-gray-400" /> Asset Identity &amp; Smart Contract
                  </p>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 mb-4">
                    <div>
                      <p className="text-[10px] text-gray-400 mb-1">Legal Name</p>
                      <p className="text-sm font-semibold text-gray-900">{form.spvLegalName}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 mb-1">Token Symbol</p>
                      <p className="text-sm font-semibold text-sky-600 font-mono flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-sky-100 flex items-center justify-center text-[8px]">◎</span>
                        {form.tokenSymbol}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 mb-1">Price Per Brick (Off Chain DB)</p>
                      <p className="text-sm font-semibold text-gray-900">{fmtChf(parseFloat(form.pricePerBrick) || 0)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 mb-1">Total Valuation (Off Chain DB)</p>
                      <p className="text-sm font-semibold text-gray-900">{fmtChf(parseFloat(form.totalValuation) || 0)}</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg px-3 py-2.5">
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Generated Smart Contract Address</p>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-mono text-blue-600 break-all leading-relaxed">{txHash}</p>
                      <button className="flex-shrink-0 p-1.5 rounded hover:bg-gray-200 transition-colors">
                        <Copy size={12} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Initial Cap Table — fades in at phase 1 */}
                <div className={`transition-all duration-700 ${resultPhase >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                  <p className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
                    <FileText size={13} className="text-gray-400" /> Initial Cap Table (Mapping Balances)
                  </p>
                  {/* 3-colour progress bar */}
                  <div className="flex rounded-full overflow-hidden h-2.5 bg-gray-100 mb-4">
                    <div className="bg-sky-500 transition-all duration-1000"     style={{ width: resultPhase >= 1 ? `${form.publicStorePct}%`   : '0%' }} />
                    <div className="bg-violet-500 transition-all duration-1000"  style={{ width: resultPhase >= 1 ? `${form.sponsorEquityPct}%` : '0%' }} />
                    <div className="bg-emerald-500 transition-all duration-1000" style={{ width: resultPhase >= 1 ? `${form.liquidityPoolPct}%` : '0%' }} />
                  </div>
                  <div className="space-y-2">
                    {capRows.map((row, i) => (
                      <div key={i}
                        className="flex items-center justify-between py-2.5 px-3 rounded-lg bg-gray-50 transition-all duration-500"
                        style={{ transitionDelay: `${i * 150 + 200}ms` }}>
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${row.dotCls}`} />
                          <div>
                            <p className="text-sm font-medium text-gray-800">{row.label}</p>
                            <p className="text-xs text-gray-400 font-mono">wallet: {row.wallet ? shortAddr(row.wallet) : '—'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{fmtNum(row.bricks)} Bricks</p>
                          <p className="text-xs text-gray-400">{row.pct}% of total</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>}

              {/* Right panel: Blockchain Ledger — fades in at phase 2, hidden while running */}
              {!running && <div className={`w-72 bg-slate-900 flex flex-col flex-shrink-0 transition-all duration-500 ${resultPhase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
                <div className="px-4 py-3 border-b border-slate-700 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-emerald-400" />
                    <p className="text-sm font-semibold text-white">Blockchain Ledger</p>
                  </div>
                  <span className="bg-emerald-500/20 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded-full">Live Events</span>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {ledgerEvents.map((ev, i) => (
                    <div key={i}
                      className={`rounded-lg bg-slate-800 p-3 transition-all duration-500 ${i < ledgerCount ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${ev.badgeCls}`}>{ev.type}</span>
                        <span className="text-[10px] text-emerald-400 font-semibold">Confirmed</span>
                      </div>
                      <p className="text-xs font-medium text-white mb-1.5">{ev.title}</p>
                      <div className="text-[10px] text-slate-400 space-y-0.5">
                        <p>From: <span className="text-slate-300 font-mono">{ev.from}</span></p>
                        <p>To: <span className="text-slate-300 font-mono">{ev.to}</span></p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-3 border-t border-slate-700 flex-shrink-0">
                  <button className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors py-1.5">
                    <ExternalLink size={11} /> View on Block Explorer
                  </button>
                </div>
              </div>}

            </div>

            {/* Modal footer — hidden while steps are running */}
            {!running && (
              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
                <Button variant="outline" onClick={handleClearSpv}>Return to Dashboard</Button>
                <Button onClick={handleClearSpv}>
                  Publish to Marketplace <ArrowRight size={14} className="ml-1" />
                </Button>
              </div>
            )}

          </div>
        </div>
      )}

    </Layout>
  )
}
