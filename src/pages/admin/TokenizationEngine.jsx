import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { properties, pendingSubmissions } from '@/data/mockData'
import { Cpu, CheckCircle2, Hash, Zap, Layers, ArrowRight, AlertTriangle, User, MessageSquare } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const steps = [
  { id: 1, label: 'Property Validated', desc: 'Documents verified, legal checks passed' },
  { id: 2, label: 'LLC Confirmed', desc: 'Business entity linked to property' },
  { id: 3, label: 'Valuation Set', desc: 'Appraisal reviewed and price approved' },
  { id: 4, label: 'Brick Count Defined', desc: 'Total supply and price per Brick set' },
  { id: 5, label: 'Smart Contract Deployed', desc: 'ERC-1155 token deployed on blockchain' },
  { id: 6, label: 'Bricks Minted', desc: 'Tokens issued and listed on platform' },
]

const defaultForm = {
  propertyName: '',
  address: '',
  llcName: '',
  appraisalValue: '',
  brickCount: '',
  pricePerBrick: '',
}

const approvedQueue = pendingSubmissions.filter(s => s.status === 'approved')

export function AdminTokenizationEngine() {
  const [selectedSub, setSelectedSub] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [running, setRunning] = useState(false)
  const [runStep, setRunStep] = useState(0)
  const [done, setDone] = useState(false)
  const [txHash, setTxHash] = useState('')

  const handleSelectSub = (sub) => {
    setSelectedSub(sub)
    setDone(false)
    setRunning(false)
    setRunStep(0)
    setForm({
      propertyName: sub.propertyName,
      address: sub.address || '',
      llcName: sub.llcName || '',
      appraisalValue: String(sub.estimatedValue || ''),
      brickCount: String(sub.proposal.suggestedBrickCount),
      pricePerBrick: String(sub.proposal.suggestedPricePerBrick),
    })
  }

  const handleClearSub = () => {
    setSelectedSub(null)
    setForm(defaultForm)
    setDone(false)
    setRunning(false)
    setRunStep(0)
  }

  const handleRun = () => {
    setRunning(true)
    setRunStep(0)
    let s = 0
    const interval = setInterval(() => {
      s++
      setRunStep(s)
      if (s >= steps.length) {
        clearInterval(interval)
        setDone(true)
        setTxHash('0x' + Math.random().toString(16).slice(2, 42))
      }
    }, 700)
  }

  const platformRaise = (parseInt(form.brickCount) || 0) * (parseInt(form.pricePerBrick) || 0)

  return (
    <Layout>
      <Header title="Brick Maker — Tokenization Engine" subtitle="Convert verified properties into digital Bricks" />
      <div className="ds-page">
        <div className="bg-violet-50 border border-violet-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <Cpu size={16} className="text-violet-600" />
          <p className="text-sm text-violet-700">The Brick Maker officially divides a real-world property (held in an LLC) into digital Bricks on the blockchain. Select an approved property below to pre-fill the form with the landlord's proposal, then adjust as needed before minting.</p>
        </div>

        {/* Approved & Ready to Tokenize queue */}
        {approvedQueue.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 size={16} className="text-green-600" />
              <h2 className="ds-section-title">Approved & Ready to Tokenize</h2>
              <Badge variant="success" className="text-xs">{approvedQueue.length} pending</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {approvedQueue.map(sub => {
                const isSelected = selectedSub?.id === sub.id
                return (
                  <div key={sub.id}
                    className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${isSelected ? 'border-violet-500 bg-violet-50 shadow-md' : 'border-gray-200 bg-white hover:border-violet-300 hover:shadow-sm'}`}
                    onClick={() => isSelected ? handleClearSub() : handleSelectSub(sub)}>
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{sub.propertyName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{sub.address || sub.city}</p>
                      </div>
                      {isSelected
                        ? <Badge variant="secondary" className="text-xs bg-violet-100 text-violet-700">Selected</Badge>
                        : <Badge variant="success" className="text-xs">Approved</Badge>
                      }
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-gray-400">Equity to tokenize</p>
                        <p className="font-bold text-gray-900 mt-0.5">{sub.proposal.tokenizePercent}%</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-gray-400">Price per Brick</p>
                        <p className="font-bold text-gray-900 mt-0.5">${sub.proposal.suggestedPricePerBrick}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-gray-400">Suggested Bricks</p>
                        <p className="font-bold text-gray-900 mt-0.5">{sub.proposal.suggestedBrickCount.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-2">
                        <p className="text-gray-400">Desired raise</p>
                        <p className="font-bold text-emerald-700 mt-0.5">{fmt(sub.proposal.desiredRaise)}</p>
                      </div>
                    </div>

                    {sub.proposal.notes && (
                      <div className="flex items-start gap-1.5 text-xs text-gray-500 bg-amber-50 rounded-lg p-2">
                        <MessageSquare size={11} className="text-amber-500 mt-0.5 flex-shrink-0" />
                        <p className="italic line-clamp-2">"{sub.proposal.notes}"</p>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-400">
                      <User size={11} />
                      <span>{sub.landlordName}</span>
                      <span className="mx-1">·</span>
                      <span>{sub.submittedDate}</span>
                    </div>

                    {!isSelected && (
                      <button className="mt-3 w-full flex items-center justify-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800 transition-colors">
                        <ArrowRight size={12} /> Pre-fill Brick Maker
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* New tokenization form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu size={16} className="text-violet-600" />
                {selectedSub ? `Tokenize: ${selectedSub.propertyName}` : 'New Tokenization'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {done ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Tokenization Complete!</h3>
                  <p className="text-sm text-muted-foreground">{parseInt(form.brickCount).toLocaleString()} Bricks created for {form.propertyName}</p>
                  <div className="bg-gray-50 rounded-xl p-4 text-left space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Contract Address:</span><span className="font-mono text-xs text-blue-600">{txHash.slice(0, 20)}…</span></div>
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Bricks Issued:</span><span className="font-medium">{parseInt(form.brickCount).toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Price/Brick:</span><span className="font-medium">{fmt(parseInt(form.pricePerBrick))}</span></div>
                    <div className="flex justify-between"><span className="text-sm text-muted-foreground">Total Raise:</span><span className="font-medium">{fmt(parseInt(form.brickCount) * parseInt(form.pricePerBrick))}</span></div>
                  </div>
                  <Button onClick={handleClearSub} variant="outline" className="w-full">
                    Tokenize Another Property
                  </Button>
                </div>
              ) : running ? (
                <div className="space-y-4 py-2">
                  <p className="text-sm font-medium text-gray-700">Tokenization in progress…</p>
                  <Progress value={runStep / steps.length * 100} color="blue" />
                  <div className="space-y-2">
                    {steps.map((s, i) => (
                      <div key={s.id} className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${i < runStep ? 'bg-green-50' : i === runStep ? 'bg-blue-50' : 'bg-gray-50'}`}>
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${i < runStep ? 'bg-green-500 text-white' : i === runStep ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                          {i < runStep ? '✓' : s.id}
                        </div>
                        <div>
                          <p className={`text-sm font-medium ${i < runStep ? 'text-green-800' : i === runStep ? 'text-blue-800' : 'text-gray-500'}`}>{s.label}</p>
                          {i === runStep && <p className="text-xs text-blue-600 animate-pulse">Processing…</p>}
                          {i < runStep && <p className="text-xs text-green-600">✓ Complete</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* Landlord proposal comparison when pre-filled */}
                  {selectedSub && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={14} className="text-amber-600" />
                        <p className="text-xs font-semibold text-amber-800">Landlord's Proposal — Review &amp; Adjust Below</p>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        {[
                          { l: 'Equity', proposed: `${selectedSub.proposal.tokenizePercent}%`, final: `${selectedSub.proposal.tokenizePercent}%` },
                          { l: 'Brick Count', proposed: selectedSub.proposal.suggestedBrickCount.toLocaleString(), final: (parseInt(form.brickCount) || 0).toLocaleString() },
                          { l: 'Price/Brick', proposed: `$${selectedSub.proposal.suggestedPricePerBrick}`, final: `$${form.pricePerBrick || '—'}` },
                          { l: 'Total Raise', proposed: fmt(selectedSub.proposal.desiredRaise), final: fmt(platformRaise) },
                        ].map(row => {
                          const changed = row.proposed !== row.final
                          return (
                            <div key={row.l} className="text-center">
                              <p className="text-gray-500 font-medium mb-1">{row.l}</p>
                              <p className="text-gray-600">{row.proposed}</p>
                              <div className="text-gray-300 text-xs">↓</div>
                              <p className={`font-bold ${changed ? 'text-violet-700' : 'text-gray-600'}`}>{row.final}</p>
                              {changed && <p className="text-violet-500 text-xs mt-0.5">modified</p>}
                            </div>
                          )
                        })}
                      </div>
                      <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
                        <span>Landlord proposed ↑</span>
                        <span className="text-violet-600 font-medium">Platform final (editable) ↓</span>
                      </div>
                      {selectedSub.proposal.notes && (
                        <div className="flex items-start gap-1.5 text-xs">
                          <MessageSquare size={11} className="text-amber-500 mt-0.5 flex-shrink-0" />
                          <p className="text-amber-700 italic">"{selectedSub.proposal.notes}"</p>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-3">
                    <div>
                      <label className="ds-label">Property Name</label>
                      <input value={form.propertyName} onChange={e => setForm(f => ({ ...f, propertyName: e.target.value }))}
                        className="ds-input"
                        placeholder="e.g. Harbor Walk Hotel" />
                    </div>
                    <div>
                      <label className="ds-label">Address</label>
                      <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                        className="ds-input"
                        placeholder="123 Main St, Miami, FL" />
                    </div>
                    <div>
                      <label className="ds-label">LLC Name</label>
                      <input value={form.llcName} onChange={e => setForm(f => ({ ...f, llcName: e.target.value }))}
                        className="ds-input"
                        placeholder="Harbor Walk Properties LLC" />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="ds-label">Appraised Value ($)</label>
                        <input type="number" value={form.appraisalValue} onChange={e => setForm(f => ({ ...f, appraisalValue: e.target.value }))}
                          className="ds-input" />
                      </div>
                      <div>
                        <label className="ds-label">Brick Count</label>
                        <input type="number" value={form.brickCount} onChange={e => setForm(f => ({ ...f, brickCount: e.target.value }))}
                          className={`ds-input ${selectedSub && form.brickCount !== String(selectedSub.proposal.suggestedBrickCount) ? 'border-violet-400 bg-violet-50' : ''}`} />
                      </div>
                      <div>
                        <label className="ds-label">Price/Brick ($)</label>
                        <input type="number" value={form.pricePerBrick} onChange={e => setForm(f => ({ ...f, pricePerBrick: e.target.value }))}
                          className={`ds-input ${selectedSub && form.pricePerBrick !== String(selectedSub.proposal.suggestedPricePerBrick) ? 'border-violet-400 bg-violet-50' : ''}`} />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
                    <div className="flex justify-between"><span>Total raise</span><span className="font-medium">{fmt(platformRaise)}</span></div>
                    <div className="flex justify-between"><span>Token standard</span><span className="font-medium">ERC-1155</span></div>
                    <div className="flex justify-between"><span>Network</span><span className="font-medium">Ethereum L2 (Polygon)</span></div>
                  </div>
                  <Button className="w-full" onClick={handleRun} disabled={!form.propertyName || !form.brickCount || !form.pricePerBrick}>
                    <Zap size={15} /> Run Tokenization Engine
                  </Button>
                  {selectedSub && (
                    <button onClick={handleClearSub} className="w-full text-xs text-gray-400 hover:text-gray-600 transition-colors py-1">
                      Clear &amp; start fresh
                    </button>
                  )}
                </>
              )}
            </CardContent>
          </Card>

          {/* Existing tokenized properties */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Layers size={15} className="text-gray-500" /> Tokenized Properties</CardTitle></CardHeader>
            <CardContent className="p-0">
              {properties.map(prop => (
                <div key={prop.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                  <img src={prop.image} alt="" className="w-12 h-9 rounded-lg object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{prop.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Hash size={10} className="text-gray-400" />
                      <p className="text-xs text-blue-500 font-mono">0x{prop.id.replace('prop-', '')}...a4f</p>
                    </div>
                    <p className="text-xs text-gray-400">{prop.totalBricks.toLocaleString()} Bricks · {fmt(prop.pricePerBrick)}/brick</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge variant="success" className="text-xs">Live</Badge>
                    <p className="text-xs text-gray-400 mt-1">{prop.tokenizationDate}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
