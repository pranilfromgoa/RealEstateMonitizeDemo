import { createContext, useContext, useState, useEffect } from 'react'
import {
  properties as defaultProperties,
  pendingSubmissions as defaultSubmissions,
  rentHistory as defaultRentHistory,
  kycRequests as defaultKycRequests,
  portfolioHoldings as defaultHoldings,
  transactions as defaultTransactions,
  marketListings as defaultListings,
} from '@/data/mockData'

const DataContext = createContext(null)
const STORAGE_KEY = 'brickbloc_demo_v1'

function getDefaults() {
  return {
    properties: defaultProperties,
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
      if (saved) return JSON.parse(saved)
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

  const addProperty = (prop) =>
    update('properties', prev => [...prev, prop])

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

  const buyBricks = (propertyId, qty, pricePerBrick, investorId = 'investor-001') => {
    const today = new Date().toISOString().split('T')[0]
    const txHash = '0x' + Math.random().toString(16).slice(2, 42)
    setStore(prev => {
      const existing = prev.portfolioHoldings.find(
        h => h.investorId === investorId && h.propertyId === propertyId
      )
      const newHoldings = existing
        ? prev.portfolioHoldings.map(h =>
            h.investorId === investorId && h.propertyId === propertyId
              ? { ...h, bricks: h.bricks + qty }
              : h
          )
        : [...prev.portfolioHoldings, {
            investorId, propertyId, bricks: qty,
            purchasePrice: pricePerBrick, purchaseDate: today, earnedRent: 0,
          }]
      return {
        ...prev,
        portfolioHoldings: newHoldings,
        properties: prev.properties.map(p =>
          p.id === propertyId
            ? { ...p, availableBricks: Math.max(0, p.availableBricks - qty) }
            : p
        ),
        transactions: [{
          id: `tx-${Date.now()}`,
          type: 'buy', investorId, propertyId,
          bricks: qty, amount: qty * pricePerBrick * 1.005,
          date: today, txHash,
        }, ...prev.transactions],
      }
    })
  }

  const createListing = (propertyId, qty, askPrice, investorId = 'investor-001') => {
    const today = new Date().toISOString().split('T')[0]
    const txHash = '0x' + Math.random().toString(16).slice(2, 42)
    setStore(prev => ({
      ...prev,
      marketListings: [{
        id: `mkt-${Date.now()}`,
        propertyId, sellerId: investorId,
        bricks: qty, askPrice,
        listedDate: today, status: 'active',
      }, ...prev.marketListings],
      transactions: [{
        id: `tx-${Date.now()}`,
        type: 'list', investorId,
        propertyId, bricks: qty,
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
        h => h.investorId === buyerInvestorId && h.propertyId === listing.propertyId
      )
      const holdingsAfterBuy = buyerExisting
        ? prev.portfolioHoldings.map(h =>
            h.investorId === buyerInvestorId && h.propertyId === listing.propertyId
              ? { ...h, bricks: h.bricks + qty }
              : h
          )
        : [...prev.portfolioHoldings, {
            investorId: buyerInvestorId, propertyId: listing.propertyId,
            bricks: qty, purchasePrice: listing.askPrice,
            purchaseDate: today, earnedRent: 0,
          }]
      const newHoldings = holdingsAfterBuy
        .map(h =>
          h.investorId === listing.sellerId && h.propertyId === listing.propertyId
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
          propertyId: listing.propertyId,
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
      addProperty,
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
