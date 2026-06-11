import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Modal } from '@/components/ui/modal'
import { Card, CardContent } from '@/components/ui/card'
import { properties } from '@/data/mockData'
import { Building2, MapPin, TrendingUp, Layers, Search, SlidersHorizontal, CheckCircle2, FileText, X } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const typeColors = {
  'Multi-Family': 'default',
  'Commercial': 'secondary',
  'Residential': 'success',
  'Retail': 'warning',
  'Industrial': 'destructive',
  'Luxury Residential': 'default',
}

export function InvestorProperties() {
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [detail, setDetail] = useState(null)
  const [buyModal, setBuyModal] = useState(null)
  const [buyQty, setBuyQty] = useState(10)
  const [bought, setBought] = useState(false)

  const types = ['all', ...new Set(properties.map(p => p.type))]

  const filtered = properties.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.city.toLowerCase().includes(search.toLowerCase())
    const matchType = filterType === 'all' || p.type === filterType
    return matchSearch && matchType
  })

  const soldPct = (p) => ((p.totalBricks - p.availableBricks) / p.totalBricks * 100).toFixed(0)

  const handleBuy = () => {
    setBought(true)
    setTimeout(() => { setBought(false); setBuyModal(null) }, 2500)
  }

  return (
    <Layout>
      <Header title="Property Listings" subtitle="Browse and invest in tokenized real estate" />
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

        <p className="text-sm text-muted-foreground">{filtered.length} properties available</p>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map(prop => (
            <div key={prop.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
              <div className="relative h-44 overflow-hidden">
                <img src={prop.image} alt={prop.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 flex gap-1.5">
                  <Badge variant={typeColors[prop.type] || 'default'} className="text-xs">{prop.type}</Badge>
                </div>
                <div className="absolute top-3 right-3">
                  <span className="bg-white/90 backdrop-blur-sm text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                    {prop.annualYield}% yield
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="ds-section-title text-base">{prop.name}</h3>
                <div className="flex items-center gap-1 mt-1 text-gray-400 text-xs">
                  <MapPin size={12} />
                  <span>{prop.city}</span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">Price / Brick</p>
                    <p className="font-bold text-gray-900">{fmt(prop.pricePerBrick)}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">Total Value</p>
                    <p className="font-bold text-gray-900">{fmt(prop.totalValue)}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{soldPct(prop)}% sold</span>
                    <span>{prop.availableBricks.toLocaleString()} Bricks left</span>
                  </div>
                  <Progress value={parseInt(soldPct(prop))} color={parseInt(soldPct(prop)) > 80 ? 'amber' : 'blue'} />
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => setDetail(prop)}
                    className="flex-1 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => { setBuyModal(prop); setBuyQty(10); setBought(false) }}
                    className="flex-1 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                  >
                    Buy Bricks
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={detail?.name || ''} size="lg">
        {detail && (
          <div className="space-y-5">
            <img src={detail.image} alt={detail.name} className="w-full h-52 object-cover rounded-xl" />
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <MapPin size={14} />
              <span>{detail.address}</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">{detail.description}</p>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Value', value: fmt(detail.totalValue) },
                { label: 'Price / Brick', value: fmt(detail.pricePerBrick) },
                { label: 'Annual Yield', value: `${detail.annualYield}%` },
                { label: 'Monthly Rent', value: fmt(detail.monthlyRent) },
                { label: 'Total Bricks', value: detail.totalBricks.toLocaleString() },
                { label: 'Available', value: detail.availableBricks.toLocaleString() },
              ].map(stat => (
                <div key={stat.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs text-gray-400">{stat.label}</p>
                  <p className="font-bold text-gray-900 mt-0.5">{stat.value}</p>
                </div>
              ))}
            </div>

            <div>
              <h4 className="ds-section-title mb-2 text-sm">Property Highlights</h4>
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
                <p className="text-sm text-gray-400 mt-1">Transaction is being processed on-chain</p>
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
                  <p className="text-xs text-gray-400 mt-1 text-center">Max available: {buyModal.availableBricks.toLocaleString()} Bricks</p>
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
                    <span>Estimated monthly income</span>
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
