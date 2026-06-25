import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { StatCard } from '@/components/ui/stat-card'
import { useData } from '@/context/DataContext'
import { TrendingUp, ArrowLeftRight, DollarSign, Plus, CheckCircle2, Tag, ChevronDown, ChevronUp, ShoppingCart, Briefcase } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(n)

const HOLDER_ID = 'investor-001'

const TX_CONFIG = {
  buy:        { label: 'Bought',       bg: 'bg-blue-100',  text: 'text-blue-700',  icon: ShoppingCart, amountColor: 'text-red-500',   sign: '-' },
  market_buy: { label: 'Market Buy',   bg: 'bg-blue-100',  text: 'text-blue-700',  icon: ShoppingCart, amountColor: 'text-red-500',   sign: '-' },
  list:       { label: 'Listed',       bg: 'bg-amber-100', text: 'text-amber-700', icon: Tag,          amountColor: 'text-green-600', sign: '+' },
}

export function HolderTradingDesk() {
  const { spvs, portfolioHoldings, marketListings, transactions, createListing, buyFromMarket } = useData()
  const [tab, setTab] = useState('my_holdings')
  const [buyModal, setBuyModal] = useState(null)
  const [sellModal, setSellModal] = useState(null)
  const [qty, setQty] = useState(10)
  const [sellQty, setSellQty] = useState(10)
  const [sellPrice, setSellPrice] = useState(102)
  const [done, setDone] = useState(false)
  const [expandedProp, setExpandedProp] = useState(null)

  const myHoldings = portfolioHoldings.filter(h => h.investorId === HOLDER_ID)
  const myListings = marketListings.filter(l => l.sellerId === HOLDER_ID && l.status === 'active')
  const otherListings = marketListings.filter(l => l.sellerId !== HOLDER_ID && l.status === 'active')

  const handleConfirmBuy = () => {
    buyFromMarket(buyModal.id, qty, HOLDER_ID)
    setDone(true)
    setTimeout(() => { setDone(false); setBuyModal(null) }, 2500)
  }

  const handleConfirmSell = () => {
    createListing(sellModal.spvId, sellQty, sellPrice, HOLDER_ID)
    setDone(true)
    setTimeout(() => { setDone(false); setSellModal(null) }, 2500)
  }

  return (
    <Layout>
      <Header title="Trading Desk" subtitle="Phase 2 — Secondary market for Brick trading" />
      <div className="ds-page">
        <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <Badge variant="default" className="bg-sky-600 text-white">Phase 2</Badge>
          <p className="text-sm text-sky-700">The secondary market lets verified holders buy and sell Bricks directly with each other.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Available to Buy" value={otherListings.length} icon={ArrowLeftRight} color="blue" sub={otherListings.length === 1 ? 'SPV' : 'SPVs'} />
          <StatCard label="My Holdings" value={myHoldings.reduce((s, h) => s + h.bricks, 0).toLocaleString()} icon={TrendingUp} color="green" sub="total Bricks" />
          <StatCard label="My Listed Bricks" value={myListings.reduce((s, l) => s + l.bricks, 0).toLocaleString()} icon={Tag} color="amber" sub="total Bricks" />
          <StatCard label="Listed for Sale" value={new Set(myListings.map(l => l.spvId)).size} icon={DollarSign} color="purple" sub={new Set(myListings.map(l => l.spvId)).size === 1 ? 'SPV' : 'SPVs'} />
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {[
            { key: 'my_holdings', label: 'My Holdings' },
            { key: 'buy', label: 'Buy Bricks' },
            { key: 'sell', label: 'List for Sale' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* My Holdings Tab */}
        {tab === 'my_holdings' && (
          <div className="space-y-4">
            {myHoldings.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center text-gray-600">
                  <Briefcase size={32} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">You don't hold any Bricks yet. Go to <button className="text-blue-500 underline" onClick={() => setTab('buy')}>Buy Bricks</button> to get started.</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Briefcase size={15} className="text-blue-500" /> My Holdings</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {myHoldings.map(h => {
                    const spv = spvs.find(s => s.id === h.spvId)
                    if (!spv) return null
                    const listed = myListings.filter(l => l.spvId === h.spvId).reduce((s, l) => s + l.bricks, 0)
                    const available = h.bricks - listed
                    const currentValue = h.bricks * spv.pricePerBrick
                    const spvTx = transactions.filter(t =>
                      t.investorId === HOLDER_ID &&
                      t.spvId === h.spvId &&
                      (t.type === 'buy' || t.type === 'market_buy' || t.type === 'list')
                    )
                    const isExpanded = expandedProp === h.spvId
                    return (
                      <div key={h.spvId} className="border-b border-gray-100 last:border-0">
                        <button
                          onClick={() => setExpandedProp(isExpanded ? null : h.spvId)}
                          className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left">
                          <img src={spv.image} alt="" className="w-14 h-10 rounded-xl object-cover flex-shrink-0" />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{spv.name}</p>
                            <p className="text-xs text-gray-600 mt-0.5">
                              <span className="font-medium text-gray-700">{h.bricks} Bricks</span>
                              {listed > 0 && <> · <span className="text-amber-600 font-medium">{listed} listed</span></>}
                              {' '}· <span className="text-green-700 font-medium">{available} available</span>
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-bold text-gray-900">{fmt(currentValue)}</p>
                            <p className="text-xs text-gray-600">current value</p>
                          </div>
                          <div className="ml-2 flex-shrink-0">
                            {isExpanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="bg-gray-50 border-t border-gray-100">
                            {spvTx.length === 0 ? (
                              <p className="text-xs text-gray-600 text-center py-4">No transactions recorded for this property.</p>
                            ) : (
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-gray-200">
                                    {['Date', 'Type', 'Bricks', 'Amount', 'Tx Hash'].map(h => (
                                      <th key={h} className={`text-xs text-gray-600 font-medium px-5 py-2 ${['Date', 'Bricks', 'Amount'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {spvTx.map(tx => {
                                    const cfg = TX_CONFIG[tx.type]
                                    if (!cfg) return null
                                    return (
                                      <tr key={tx.id} className="border-b border-gray-100 last:border-0 hover:bg-white transition-colors">
                                        <td className="px-5 py-2.5 text-gray-600 text-xs text-right">{tx.date}</td>
                                        <td className="px-5 py-2.5">
                                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${cfg.bg} ${cfg.text}`}>
                                            <cfg.icon size={10} /> {cfg.label}
                                          </span>
                                        </td>
                                        <td className="px-5 py-2.5 text-gray-700 font-medium text-right">{tx.bricks}</td>
                                        <td className={`px-5 py-2.5 font-medium text-xs text-right ${cfg.amountColor}`}>
                                          {cfg.sign}{fmt(tx.amount)}
                                        </td>
                                        <td className="px-5 py-2.5">
                                          <span className="text-xs text-blue-400 font-mono">{tx.txHash.slice(0, 10)}…</span>
                                        </td>
                                      </tr>
                                    )
                                  })}
                                </tbody>
                              </table>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Buy Bricks Tab */}
        {tab === 'buy' && (
          <Card>
            <CardHeader><CardTitle>Available on Secondary Market</CardTitle></CardHeader>
            <CardContent className="p-0">
              {otherListings.length === 0 ? (
                <p className="text-sm text-gray-600 text-center py-10">No listings available on the secondary market right now.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      {['SPV', 'Bricks', 'Ask Price', 'vs. Floor', 'Seller', 'Listed', ''].map(h => (
                        <th key={h} className={`text-xs text-gray-600 font-medium px-5 py-3 ${['Bricks', 'Ask Price', 'vs. Floor', 'Listed'].includes(h) ? 'text-right' : 'text-left'}`}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {otherListings.map(listing => {
                      const spv = spvs.find(s => s.id === listing.spvId)
                      if (!spv) return null
                      const premium = ((listing.askPrice - spv.pricePerBrick) / spv.pricePerBrick * 100).toFixed(1)
                      return (
                        <tr key={listing.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <img src={spv.image} alt="" className="w-10 h-8 rounded-lg object-cover" />
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{spv.name}</p>
                                <p className="text-xs text-gray-600">{spv.city}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3 font-medium text-gray-900 text-right">{listing.bricks}</td>
                          <td className="px-5 py-3 font-semibold text-gray-900 text-right">${listing.askPrice}</td>
                          <td className="px-5 py-3 text-right">
                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${parseFloat(premium) > 0 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                              {parseFloat(premium) > 0 ? '+' : ''}{premium}%
                            </span>
                          </td>
                          <td className="px-5 py-3 text-gray-600 text-xs">Anonymous</td>
                          <td className="px-5 py-3 text-gray-600 text-xs text-right">{listing.listedDate}</td>
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
              )}
            </CardContent>
          </Card>
        )}

        {/* List for Sale Tab */}
        {tab === 'sell' && (
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>List Bricks from My Portfolio</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {myHoldings.map(h => {
                    const spv = spvs.find(s => s.id === h.spvId)
                    if (!spv) return null
                    const listed = myListings.filter(l => l.spvId === h.spvId).reduce((s, l) => s + l.bricks, 0)
                    const available = h.bricks - listed
                    return (
                      <div key={h.spvId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <img src={spv.image} alt="" className="w-14 h-10 rounded-xl object-cover" />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{spv.name}</p>
                          <p className="text-sm text-gray-600">
                            Owned: <span className="font-medium text-gray-700">{h.bricks}</span>
                            {listed > 0 && <> · Listed: <span className="font-medium text-amber-600">{listed}</span></>}
                            {' '}· Available to list: <span className="font-medium text-green-700">{available}</span>
                          </p>
                        </div>
                        <Button variant="outline" size="sm" disabled={available <= 0}
                          onClick={() => { setSellModal({ ...h, availableToList: available }); setSellQty(Math.min(10, available)); setSellPrice(spv.pricePerBrick); setDone(false) }}>
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
          const spv = spvs.find(s => s.id === buyModal.spvId)
          return done ? (
            <div className="text-center py-8">
              <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-900">Purchase Complete!</h3>
              <p className="text-gray-500 mt-1 text-sm">You purchased {qty} Bricks from the secondary market.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="ds-alert-info flex items-center gap-4">
                <img src={spv?.image} alt="" className="w-16 h-12 rounded-lg object-cover" />
                <div>
                  <p className="font-semibold">{spv?.name}</p>
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
                <Button className="flex-1" onClick={handleConfirmBuy}>Confirm Purchase</Button>
              </div>
            </div>
          )
        })()}
      </Modal>

      {/* Sell Modal */}
      <Modal open={!!sellModal} onClose={() => setSellModal(null)} title="List Bricks for Sale">
        {sellModal && (() => {
          const spv = spvs.find(s => s.id === sellModal.spvId)
          const maxSell = sellModal.availableToList || sellModal.bricks
          return done ? (
            <div className="text-center py-8">
              <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-gray-900">Listing Created!</h3>
              <p className="text-gray-500 mt-1 text-sm">{sellQty} Bricks listed at ${sellPrice}/brick</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-4 flex items-center gap-4">
                <img src={spv?.image} alt="" className="w-16 h-12 rounded-lg object-cover" />
                <div>
                  <p className="font-semibold">{spv?.name}</p>
                  <p className="text-sm text-muted-foreground">Available to list: <span className="font-medium text-gray-800">{maxSell} Bricks</span> · Floor: ${spv?.pricePerBrick}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="ds-label mb-2">Quantity to list (max {maxSell})</label>
                  <input type="number" value={sellQty} min={1} max={maxSell}
                    onChange={e => setSellQty(Math.min(maxSell, Math.max(1, parseInt(e.target.value) || 1)))}
                    className="ds-input" />
                </div>
                <div>
                  <label className="ds-label mb-2">Ask price per Brick ($)</label>
                  <input type="number" value={sellPrice} min={1}
                    onChange={e => setSellPrice(Math.max(1, parseFloat(e.target.value) || 1))}
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
                <Button variant="success" className="flex-1" onClick={handleConfirmSell}>Create Listing</Button>
              </div>
            </div>
          )
        })()}
      </Modal>
    </Layout>
  )
}
