import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { StatCard } from '@/components/ui/stat-card'
import { marketListings, properties, portfolioHoldings } from '@/data/mockData'
import { TrendingUp, TrendingDown, ArrowLeftRight, DollarSign, Plus, CheckCircle2 } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

export function InvestorTradingDesk() {
  const [tab, setTab] = useState('buy')
  const [buyModal, setBuyModal] = useState(null)
  const [sellModal, setSellModal] = useState(null)
  const [qty, setQty] = useState(10)
  const [sellQty, setSellQty] = useState(10)
  const [sellPrice, setSellPrice] = useState(102)
  const [done, setDone] = useState(false)
  const myHoldings = portfolioHoldings.filter(h => h.investorId === 'investor-001')

  const handleConfirm = () => {
    setDone(true)
    setTimeout(() => { setDone(false); setBuyModal(null); setSellModal(null) }, 2500)
  }

  return (
    <Layout>
      <Header title="Trading Desk" subtitle="Phase 2 — Secondary market for Brick trading" />
      <div className="ds-page">
        <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <Badge variant="default" className="bg-purple-600 text-white">Phase 2</Badge>
          <p className="text-sm text-purple-700">The secondary market lets verified investors buy and sell Bricks directly with each other.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Active Listings" value="5" icon={ArrowLeftRight} color="blue" />
          <StatCard label="24h Volume" value="$8,450" icon={TrendingUp} color="green" />
          <StatCard label="Avg. Premium" value="+2.8%" icon={TrendingUp} color="purple" />
          <StatCard label="My Listings" value="2" icon={DollarSign} color="amber" />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {['buy', 'sell'].map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t === 'buy' ? 'Buy Bricks' : 'List Bricks for Sale'}
            </button>
          ))}
        </div>

        {tab === 'buy' && (
          <Card>
            <CardHeader><CardTitle>Available on Secondary Market</CardTitle></CardHeader>
            <CardContent className="p-0">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Property', 'Bricks', 'Ask Price', 'vs. Floor', 'Seller', 'Listed', ''].map(h => (
                      <th key={h} className="text-left text-xs text-gray-500 font-medium px-5 py-3">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {marketListings.map(listing => {
                    const prop = properties.find(p => p.id === listing.propertyId)
                    if (!prop) return null
                    const premium = ((listing.askPrice - prop.pricePerBrick) / prop.pricePerBrick * 100).toFixed(1)
                    return (
                      <tr key={listing.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img src={prop.image} alt="" className="w-10 h-8 rounded-lg object-cover" />
                            <div>
                              <p className="font-medium text-gray-900 text-sm">{prop.name}</p>
                              <p className="text-xs text-gray-400">{prop.city}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 font-medium text-gray-900">{listing.bricks}</td>
                        <td className="px-5 py-3 font-semibold text-gray-900">${listing.askPrice}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-medium px-2 py-1 rounded-full ${parseFloat(premium) > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                            {parseFloat(premium) > 0 ? '+' : ''}{premium}%
                          </span>
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">Anonymous</td>
                        <td className="px-5 py-3 text-gray-400 text-xs">{listing.listedDate}</td>
                        <td className="px-5 py-3">
                          <Button size="sm" onClick={() => { setBuyModal(listing); setQty(listing.bricks); setDone(false) }}>
                            Buy
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {tab === 'sell' && (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>List Bricks from My Portfolio</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myHoldings.map(h => {
                    const prop = properties.find(p => p.id === h.propertyId)
                    if (!prop) return null
                    return (
                      <div key={h.propertyId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <img src={prop.image} alt="" className="w-14 h-10 rounded-xl object-cover" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{prop.name}</p>
                          <p className="text-sm text-gray-400">You own: <span className="font-medium text-gray-700">{h.bricks} Bricks</span> · Floor: $100/brick</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => { setSellModal(h); setSellQty(10); setSellPrice(102); setDone(false) }}>
                          <Plus size={14} /> List for Sale
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Buy Modal */}
      <Modal open={!!buyModal} onClose={() => setBuyModal(null)} title="Buy Bricks (Secondary Market)">
        {buyModal && (() => {
          const prop = properties.find(p => p.id === buyModal.propertyId)
          return done ? (
            <div className="text-center py-8">
              <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-900">Purchase Complete!</h3>
              <p className="text-gray-500 mt-1 text-sm">You purchased {qty} Bricks from the secondary market.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="ds-alert-info flex items-center gap-4">
                <img src={prop?.image} alt="" className="w-16 h-12 rounded-lg object-cover" />
                <div>
                  <p className="font-semibold">{prop?.name}</p>
                  <p className="text-sm text-muted-foreground">Ask: ${buyModal.askPrice}/brick</p>
                </div>
              </div>
              <div>
                <label className="ds-label mb-2">Quantity (max {buyModal.bricks})</label>
                <input type="number" value={qty} max={buyModal.bricks} min={1}
                  onChange={e => setQty(Math.min(buyModal.bricks, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="ds-input" />
              </div>
              <div className="ds-inset space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Price/Brick</span><span className="font-medium">${buyModal.askPrice}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Quantity</span><span className="font-medium">{qty}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Trading fee (1%)</span><span className="font-medium">{fmt(qty * buyModal.askPrice * 0.01)}</span></div>
                <div className="border-t pt-2 flex justify-between font-bold"><span>Total</span><span className="text-blue-600">{fmt(qty * buyModal.askPrice * 1.01)}</span></div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setBuyModal(null)}>Cancel</Button>
                <Button className="flex-1" onClick={handleConfirm}>Confirm Purchase</Button>
              </div>
            </div>
          )
        })()}
      </Modal>

      {/* Sell Modal */}
      <Modal open={!!sellModal} onClose={() => setSellModal(null)} title="List Bricks for Sale">
        {sellModal && (() => {
          const prop = properties.find(p => p.id === sellModal.propertyId)
          return done ? (
            <div className="text-center py-8">
              <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-900">Listing Created!</h3>
              <p className="text-gray-500 mt-1 text-sm">{sellQty} Bricks listed at ${sellPrice}/brick</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                <img src={prop?.image} alt="" className="w-16 h-12 rounded-lg object-cover" />
                <div>
                  <p className="font-semibold">{prop?.name}</p>
                  <p className="text-sm text-muted-foreground">You own: {sellModal.bricks} Bricks · Floor: $100</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="ds-label mb-2">Quantity to sell</label>
                  <input type="number" value={sellQty} min={1} max={sellModal.bricks}
                    onChange={e => setSellQty(Math.min(sellModal.bricks, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="ds-input" />
                </div>
                <div>
                  <label className="ds-label mb-2">Ask price per Brick ($)</label>
                  <input type="number" value={sellPrice} min={90} max={200}
                    onChange={e => setSellPrice(Math.max(90, parseFloat(e.target.value) || 90))}
                    className="ds-input" />
                </div>
              </div>
              <div className="ds-inset space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Listing value</span><span className="font-medium">{fmt(sellQty * sellPrice)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Platform fee (1%)</span><span className="font-medium text-red-500">-{fmt(sellQty * sellPrice * 0.01)}</span></div>
                <div className="border-t pt-2 flex justify-between font-bold"><span>Net proceeds</span><span className="text-green-600">{fmt(sellQty * sellPrice * 0.99)}</span></div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setSellModal(null)}>Cancel</Button>
                <Button variant="success" className="flex-1" onClick={handleConfirm}>Create Listing</Button>
              </div>
            </div>
          )
        })()}
      </Modal>
    </Layout>
  )
}
