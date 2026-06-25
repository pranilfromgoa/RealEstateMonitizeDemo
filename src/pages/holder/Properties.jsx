import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Modal } from '@/components/ui/modal'
import { Card, CardContent } from '@/components/ui/card'
import { useData } from '@/context/DataContext'
import { Building2, MapPin, TrendingUp, Layers, Search, SlidersHorizontal, CheckCircle2, FileText, X, Info } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const typeColors = {
  'Multi-Family': 'default',
  'Commercial': 'secondary',
  'Residential': 'success',
  'Retail': 'warning',
  'Industrial': 'destructive',
  'Luxury Residential': 'default',
}

function getQualData(spv) {
  const key = `${spv.id}|${spv.annualYield}|${spv.totalValue}`
  const hash = Math.abs(key.split('').reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0))
  const score = (mult, lo, hi) => +(lo + (hash * mult % 1500) / 1500 * (hi - lo)).toFixed(1)

  const loc  = Math.min(5.0, score(1,  3.8, 5.0))
  const nbhd = Math.min(5.0, score(7,  3.8, 5.0))
  const reg  = Math.min(5.0, score(13, 3.8, 5.0))
  const rent = Math.min(5.0, score(19, 3.5, 5.0))

  const locImpact  = +(Math.max(0, (loc  - 4.0) * 1.5)).toFixed(1)
  const nbhdImpact = +(Math.max(0, (nbhd - 4.0) * 1.0)).toFixed(1)
  const regImpact  = +(Math.max(0, (reg  - 4.0) * 0.5)).toFixed(1)
  const premiumPct = +(locImpact + nbhdImpact + regImpact).toFixed(1)

  const avg = (loc + nbhd + reg + rent) / 4
  const stabilityScore = Math.min(98, Math.round((avg - 3.5) / 1.5 * 28 + 70))
  const rating = stabilityScore >= 95 ? 'A+' : stabilityScore >= 91 ? 'A' : stabilityScore >= 87 ? 'A-' : 'B+'
  const ratingColor = stabilityScore >= 91 ? 'text-green-700' : stabilityScore >= 87 ? 'text-sky-700' : 'text-amber-700'

  return {
    stabilityScore,
    rating,
    ratingColor,
    premiumPct,
    basePrice: Math.round(spv.pricePerBrick / (1 + premiumPct / 100)),
    factors: [
      { label: 'Location Desirability',        score: loc,  impact: locImpact  },
      { label: 'Neighborhood Stability',        score: nbhd, impact: nbhdImpact },
      { label: 'Political / Regulatory Risk',   score: reg,  impact: regImpact  },
      { label: 'Expected Rental Yield Rating',  score: rent, impact: 0          },
    ],
  }
}

export function HolderSpvs() {
  const { spvs, buyBricks } = useData()
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [detail, setDetail] = useState(null)
  const [buyModal, setBuyModal] = useState(null)
  const [buyQty, setBuyQty] = useState(10)
  const [bought, setBought] = useState(false)

  const activeSpvs = spvs.filter(s => s.status === 'live')
  const types = ['all', ...new Set(activeSpvs.map(s => s.type))]

  const filtered = activeSpvs.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.city.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || s.type === filterType
    return matchSearch && matchType
  })

  const soldPct = (p) => ((p.totalBricks - p.availableBricks) / p.totalBricks * 100).toFixed(0)

  const detailQual = detail ? getQualData(detail) : null

  const handleBuy = () => {
    buyBricks(buyModal.id, buyQty, buyModal.pricePerBrick)
    setBought(true)
    setTimeout(() => { setBought(false); setBuyModal(null) }, 2500)
  }

  return (
    <Layout>
      <Header title="SPV Marketplace" subtitle="Browse and invest in tokenized SPVs" />
      <div className="ds-page">
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-52">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="ds-input pl-9"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal size={16} className="text-gray-400" />
            {types.map(t => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === t ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}
              >
                {t === 'all' ? 'All Types' : t}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground">{filtered.length} SPVs available</p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(spv => {
            const qual = getQualData(spv)
            return (
              <div key={spv.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="relative h-44 overflow-hidden rounded-t-2xl">
                  <img src={spv.image} alt={spv.name} className="w-full h-full object-cover" />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <Badge variant={typeColors[spv.type] || 'default'} className="text-xs">{spv.type}</Badge>
                  </div>
                  <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
                    <span className={`bg-white/90 backdrop-blur-sm text-xs font-bold px-2 py-1 rounded-full ${qual.ratingColor}`}>
                      {qual.stabilityScore}% Stable · {qual.rating}
                    </span>
                    <span className="bg-white/90 backdrop-blur-sm text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                      {spv.annualYield}% yield
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="ds-section-title text-base">{spv.name}</h3>
                  <div className="flex items-center gap-1 mt-1 text-gray-400 text-xs">
                    <MapPin size={12} />
                    <span className="text-gray-600">{spv.city}</span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-600">Price / Brick</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <p className="font-bold text-gray-900">{fmt(spv.pricePerBrick)}</p>
                        <div className="relative group">
                          <Info size={11} className="text-gray-400 cursor-help flex-shrink-0" />
                          <div className="pointer-events-none absolute z-30 hidden group-hover:block bottom-full right-0 mb-1.5 w-60 bg-gray-900 text-white text-[10px] rounded-xl p-3 leading-relaxed shadow-xl">
                            <p className="font-semibold text-white mb-1">Price Breakdown</p>
                            <p>Base <span className="text-gray-300">{fmt(qual.basePrice)}</span> × (1 + {qual.premiumPct}% premium) = {fmt(spv.pricePerBrick)}</p>
                            <p className="mt-1 text-gray-400">Premium reflects low regulatory risk &amp; high neighborhood stability.</p>
                          </div>
                        </div>
                      </div>
                      {qual.premiumPct > 0 && (
                        <p className="text-[9px] text-amber-600 font-semibold mt-0.5">+{qual.premiumPct}% safety premium</p>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-600">Total Value</p>
                      <p className="font-bold text-gray-900 mt-0.5">{fmt(spv.totalValue)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2">
                      <p className="text-xs text-gray-600">Expected Rent</p>
                      <p className="font-bold text-green-700 mt-0.5">{spv.monthlyRent ? fmt(spv.monthlyRent) + '/mo' : '—'}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>{soldPct(spv)}% sold</span>
                      <span>{spv.availableBricks.toLocaleString()} Bricks left</span>
                    </div>
                    <Progress value={parseInt(soldPct(spv))} color={parseInt(soldPct(spv)) > 80 ? 'amber' : 'blue'} />
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => setDetail(spv)}
                      className="flex-1 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                    >
                      Details
                    </button>
                    <button
                      onClick={() => { setBuyModal(spv); setBuyQty(10); setBought(false) }}
                      className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Buy Bricks
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.name || ''} size="lg">
        {detail && detailQual && (
          <div className="space-y-5">
            <img src={detail.image} alt={detail.name} className="w-full h-52 object-cover rounded-xl" />
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <MapPin size={14} />
              <span>{detail.address}</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{detail.description}</p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Value',      value: fmt(detail.totalValue)    },
                { label: 'Price / Brick',    value: fmt(detail.pricePerBrick) },
                { label: 'Annual Yield',     value: `${detail.annualYield}%`  },
                { label: 'Expected Rent/mo', value: fmt(detail.monthlyRent)   },
                { label: 'Total Bricks',     value: detail.totalBricks.toLocaleString()     },
                { label: 'Available',        value: detail.availableBricks.toLocaleString() },
              ].map(stat => (
                <div key={stat.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-600">{stat.label}</p>
                  <p className="font-bold text-gray-900 mt-0.5">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Qualitative Valuation */}
            <div className="border border-sky-200 rounded-2xl overflow-hidden">
              <div className="bg-sky-50 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-sky-900 text-sm">Qualitative Valuation</p>
                  <p className="text-xs text-sky-600 mt-0.5">Stability metrics driving the token price premium</p>
                </div>
                <span className={`text-sm font-black px-3 py-1 rounded-full bg-white border border-sky-200 ${detailQual.ratingColor}`}>
                  {detailQual.rating} &nbsp;·&nbsp; {detailQual.stabilityScore}%
                </span>
              </div>
              <div className="p-4 space-y-5">

                {/* Four factor meters */}
                <div className="space-y-3.5">
                  {detailQual.factors.map(f => (
                    <div key={f.label}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-medium text-gray-700">{f.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 tabular-nums">{f.score.toFixed(1)} / 5.0</span>
                          {f.impact > 0 ? (
                            <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                              +{f.impact}% premium
                            </span>
                          ) : (
                            <span className="text-[10px] font-semibold text-gray-600 bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5">
                              +0.0%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="bg-gray-100 rounded-full h-2">
                        <div
                          className="rounded-full h-2 transition-all"
                          style={{
                            width: `${(f.score / 5) * 100}%`,
                            background: f.score >= 4.5 ? '#16a34a' : f.score >= 4.0 ? '#0ea5e9' : '#f59e0b',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Math explainer */}
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                  <p className="text-xs font-semibold text-gray-600 mb-3">Final Token Price Calculation</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-center min-w-[80px]">
                      <p className="text-[10px] text-gray-600 mb-0.5">Base Price</p>
                      <p className="font-bold text-gray-900 text-sm">{fmt(detailQual.basePrice)}</p>
                    </div>
                    <span className="text-gray-600 font-bold text-xl select-none">×</span>
                    <div className="bg-white border border-amber-200 rounded-lg px-3 py-2 text-center min-w-[100px]">
                      <p className="text-[10px] text-amber-600 mb-0.5">Multiplier</p>
                      <p className="font-bold text-amber-700 text-sm">(1 + {detailQual.premiumPct}%)</p>
                    </div>
                    <span className="text-gray-600 font-bold text-xl select-none">=</span>
                    <div className="bg-white border border-sky-300 rounded-lg px-3 py-2 text-center min-w-[90px] ring-2 ring-sky-100">
                      <p className="text-[10px] text-sky-600 mb-0.5">Price / Brick</p>
                      <p className="font-bold text-sky-700 text-sm">{fmt(detail.pricePerBrick)}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-600 mt-3 leading-relaxed">
                    A {detailQual.premiumPct}% premium is applied above the base property valuation, reflecting exceptional scores in location desirability, neighborhood stability, and regulatory safety — factors that materially reduce long-term investment risk.
                  </p>
                </div>

              </div>
            </div>

            <div>
              <h4 className="ds-section-title mb-2 text-sm">SPV Highlights</h4>
              <div className="grid grid-cols-2 gap-2">
                {detail.highlights.map(h => (
                  <div key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                    {h}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="ds-section-title mb-2 text-sm">Verified Documents</h4>
              <div className="grid grid-cols-2 gap-2">
                {detail.documents.map(doc => (
                  <div key={doc.name} className="flex items-center gap-2 text-sm text-muted-foreground bg-green-50 rounded-lg px-3 py-2">
                    <FileText size={14} className="text-green-600" />
                    <span className="flex-1">{doc.name}</span>
                    <Badge variant="success" className="text-xs">Verified</Badge>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setDetail(null)}>Close</Button>
              <Button className="flex-1" onClick={() => { setDetail(null); setBuyModal(detail); setBuyQty(10) }}>
                Buy Bricks
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Buy Modal */}
      <Modal open={!!buyModal} onClose={() => { setBuyModal(null); setBought(false) }} title={`Buy Bricks — ${buyModal?.name}`}>
        {buyModal && (
          <div className="space-y-5">
            {bought ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Purchase Successful!</h3>
                <p className="text-gray-500 mt-2">You have purchased {buyQty} Bricks in {buyModal.name}</p>
                <p className="text-sm text-gray-600 mt-1">Transaction is being processed on-chain</p>
              </div>
            ) : (
              <>
                <div className="ds-alert-info flex items-center gap-4">
                  <img src={buyModal.image} alt="" className="w-16 h-12 rounded-lg object-cover" />
                  <div>
                    <p className="font-semibold text-gray-900">{buyModal.name}</p>
                    <p className="text-sm text-muted-foreground">{buyModal.city} · {buyModal.annualYield}% annual yield</p>
                  </div>
                </div>

                <div>
                  <label className="ds-label mb-2">Number of Bricks</label>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setBuyQty(Math.max(1, buyQty - 1))} className="w-10 h-10 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-xl font-bold">−</button>
                    <input
                      type="number"
                      value={buyQty}
                      onChange={e => setBuyQty(Math.max(1, Math.min(buyModal.availableBricks, parseInt(e.target.value) || 1)))}
                      className="flex-1 text-center py-2.5 border border-gray-200 rounded-lg text-lg font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button onClick={() => setBuyQty(Math.min(buyModal.availableBricks, buyQty + 1))} className="w-10 h-10 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 text-xl font-bold">+</button>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 text-center">Max available: {buyModal.availableBricks.toLocaleString()} Bricks</p>
                </div>

                <div className="ds-inset space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Price per Brick</span>
                    <span className="font-medium">{fmt(buyModal.pricePerBrick)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Quantity</span>
                    <span className="font-medium">{buyQty}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Platform fee (0.5%)</span>
                    <span className="font-medium">{fmt(buyQty * buyModal.pricePerBrick * 0.005)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-blue-600">{fmt(buyQty * buyModal.pricePerBrick * 1.005)}</span>
                  </div>
                  <div className="flex justify-between text-xs text-green-600 bg-green-50 rounded-lg px-3 py-2 mt-2">
                    <span>Expected monthly income</span>
                    <span className="font-semibold">{fmt(buyModal.monthlyRent * buyQty / buyModal.totalBricks)}/mo</span>
                  </div>
                </div>

                <div>
                  <p className="ds-label mb-2">Payment Method</p>
                  <div className="grid grid-cols-2 gap-2">
                    {['Bank Transfer', 'Crypto Wallet'].map(m => (
                      <button key={m} className="py-2.5 px-4 border-2 border-blue-200 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium">
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => setBuyModal(null)}>Cancel</Button>
                  <Button className="flex-1" onClick={handleBuy}>Confirm Purchase</Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  )
}
