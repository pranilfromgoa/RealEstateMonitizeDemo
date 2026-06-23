import { createContext, useContext, useState, useEffect } from 'react'
import {
  spvs as defaultSpvs,
  investors as defaultInvestors,
  pendingSubmissions as defaultSubmissions,
  rentHistory as defaultRentHistory,
  kycRequests as defaultKycRequests,
  portfolioHoldings as defaultHoldings,
  transactions as defaultTransactions,
  marketListings as defaultListings,
} from '@/data/mockData'

const DataContext = createContext(null)
const STORAGE_KEY = 'brickchain_demo_v5'

function getDefaults() {
  return {
    spvs: defaultSpvs,
    investors: defaultInvestors,
    pendingSubmissions: defaultSubmissions,
    rentHistory: defaultRentHistory,
    kycRequests: defaultKycRequests,
    portfolioHoldings: defaultHoldings,
    transactions: defaultTransactions,
    marketListings: defaultListings,
  }
}

export function DataProvider({ children }) {
  const [store, setStore] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        // Backfill coverImage for any SPV that was saved before the field existed
        const defaultImageMap = Object.fromEntries(defaultSpvs.map(s => [s.id, s.coverImage]))
        // Remap legacy propertyType values to the canonical set
        const TYPE_REMAP = { 'Retail': 'Commercial', 'Self-Storage': 'Industrial', 'Luxury Residential': 'Residential' }
        parsed.spvs = (parsed.spvs || defaultSpvs).map(s => ({
          ...s,
          coverImage: s.coverImage || defaultImageMap[s.id] || '',
          propertyType: TYPE_REMAP[s.propertyType] || s.propertyType || 'Residential',
          type:         TYPE_REMAP[s.type]         || s.type         || 'Residential',
        }))
        return parsed
      }
    } catch {}
    return getDefaults()
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store))
    } catch {}
  }, [store])

  const update = (key, fn) =>
    setStore(prev => ({ ...prev, [key]: typeof fn === 'function' ? fn(prev[key]) : fn }))

  const addSubmission = (sub) =>
    update('pendingSubmissions', prev => [sub, ...prev])

  const updateSubmission = (id, changes) =>
    update('pendingSubmissions', prev =>
      prev.map(s => s.id === id ? { ...s, ...changes } : s)
    )

  const updateKyc = (id, changes) =>
    update('kycRequests', prev =>
      prev.map(k => k.id === id ? { ...k, ...changes } : k)
    )

  const updateInvestor = (id, changes) =>
    update('investors', prev =>
      prev.map(inv => inv.id === id ? { ...inv, ...changes } : inv)
    )

  const updateSpv = (id, changes) =>
    update('spvs', prev =>
      prev.map(s => s.id === id ? { ...s, ...changes } : s)
    )

  const addSpv = (spv) =>
    update('spvs', prev => [...prev, spv])

  const processRentPayout = (id, amount) => {
    const fee = amount * 0.05
    update('rentHistory', prev =>
      prev.map(r =>
        r.id === id
          ? { ...r, status: 'distributed', amount, fee, netAmount: amount - fee, txHash: '0x' + Math.random().toString(16).slice(2, 42) }
          : r
      )
    )
  }

  const buyBricks = (spvId, qty, pricePerBrick, investorId = 'investor-001') => {
    const today = new Date().toISOString().split('T')[0]
    const txHash = '0x' + Math.random().toString(16).slice(2, 42)
    setStore(prev => {
      const existing = prev.portfolioHoldings.find(
        h => h.investorId === investorId && h.spvId === spvId
      )
      const newHoldings = existing
        ? prev.portfolioHoldings.map(h =>
            h.investorId === investorId && h.spvId === spvId
              ? { ...h, bricks: h.bricks + qty }
              : h
          )
        : [...prev.portfolioHoldings, {
            investorId, spvId, bricks: qty,
            purchasePrice: pricePerBrick, purchaseDate: today, earnedRent: 0,
          }]
      return {
        ...prev,
        portfolioHoldings: newHoldings,
        spvs: prev.spvs.map(s =>
          s.id === spvId
            ? { ...s, availableBricks: Math.max(0, s.availableBricks - qty) }
            : s
        ),
        transactions: [{
          id: `tx-${Date.now()}`,
          type: 'buy', investorId, spvId,
          bricks: qty, amount: qty * pricePerBrick * 1.005,
          date: today, txHash,
        }, ...prev.transactions],
      }
    })
  }

  const createListing = (spvId, qty, askPrice, investorId = 'investor-001') => {
    const today = new Date().toISOString().split('T')[0]
    const txHash = '0x' + Math.random().toString(16).slice(2, 42)
    setStore(prev => ({
      ...prev,
      marketListings: [{
        id: `mkt-${Date.now()}`,
        spvId, sellerId: investorId,
        bricks: qty, askPrice,
        listedDate: today, status: 'active',
      }, ...prev.marketListings],
      transactions: [{
        id: `tx-${Date.now()}`,
        type: 'list', investorId,
        spvId, bricks: qty,
        amount: qty * askPrice,
        date: today, txHash,
      }, ...prev.transactions],
    }))
  }

  const buyFromMarket = (listingId, qty, buyerInvestorId = 'investor-001') => {
    const today = new Date().toISOString().split('T')[0]
    const txHash = '0x' + Math.random().toString(16).slice(2, 42)
    setStore(prev => {
      const listing = prev.marketListings.find(l => l.id === listingId)
      if (!listing) return prev
      const remaining = listing.bricks - qty
      const newListings = remaining <= 0
        ? prev.marketListings.filter(l => l.id !== listingId)
        : prev.marketListings.map(l => l.id === listingId ? { ...l, bricks: remaining } : l)
      const buyerExisting = prev.portfolioHoldings.find(
        h => h.investorId === buyerInvestorId && h.spvId === listing.spvId
      )
      const holdingsAfterBuy = buyerExisting
        ? prev.portfolioHoldings.map(h =>
            h.investorId === buyerInvestorId && h.spvId === listing.spvId
              ? { ...h, bricks: h.bricks + qty }
              : h
          )
        : [...prev.portfolioHoldings, {
            investorId: buyerInvestorId, spvId: listing.spvId,
            bricks: qty, purchasePrice: listing.askPrice,
            purchaseDate: today, earnedRent: 0,
          }]
      const newHoldings = holdingsAfterBuy
        .map(h =>
          h.investorId === listing.sellerId && h.spvId === listing.spvId
            ? { ...h, bricks: h.bricks - qty }
            : h
        )
        .filter(h => h.bricks > 0)
      return {
        ...prev,
        marketListings: newListings,
        portfolioHoldings: newHoldings,
        transactions: [{
          id: `tx-${Date.now()}`,
          type: 'market_buy', investorId: buyerInvestorId,
          spvId: listing.spvId,
          bricks: qty, amount: qty * listing.askPrice * 1.01,
          date: today, txHash,
        }, ...prev.transactions],
      }
    })
  }

  const resetData = () => {
    localStorage.removeItem(STORAGE_KEY)
    setStore(getDefaults())
  }

  return (
    <DataContext.Provider value={{
      ...store,
      addSubmission,
      updateSubmission,
      updateKyc,
      updateInvestor,
      updateSpv,
      addSpv,
      buyBricks,
      createListing,
      buyFromMarket,
      processRentPayout,
      resetData,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used inside DataProvider')
  return ctx
}
