import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { DataProvider } from '@/context/DataContext'

import { Login } from '@/pages/Login'

// Investor
import { InvestorDashboard } from '@/pages/investor/Dashboard'
import { InvestorProperties } from '@/pages/investor/Properties'
import { InvestorPortfolio } from '@/pages/investor/Portfolio'
import { InvestorKYC } from '@/pages/investor/KYC'
import { InvestorTradingDesk } from '@/pages/investor/TradingDesk'
import { InvestorTaxDocuments } from '@/pages/investor/TaxDocuments'
import { InvestorVoting } from '@/pages/investor/Voting'
import { InvestorAIReader } from '@/pages/investor/AIReader'

// Landlord
import { LandlordDashboard } from '@/pages/landlord/Dashboard'
import { LandlordPropertyUpload } from '@/pages/landlord/PropertyUpload'
import { LandlordPropertyManagement } from '@/pages/landlord/PropertyManagement'
import { LandlordKYB } from '@/pages/landlord/KYB'

// Admin
import { AdminDashboard } from '@/pages/admin/Dashboard'
import { AdminTokenizationEngine } from '@/pages/admin/TokenizationEngine'
import { AdminApprovals } from '@/pages/admin/Approvals'
import { AdminPayouts } from '@/pages/admin/Payouts'
import { AdminFeeManagement } from '@/pages/admin/FeeManagement'
import { AdminUsers } from '@/pages/admin/Users'

function ProtectedRoute({ children, role }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/" replace />
  if (role && user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Login />} />

      {/* Investor */}
      <Route path="/investor/dashboard" element={<ProtectedRoute role="investor"><InvestorDashboard /></ProtectedRoute>} />
      <Route path="/investor/properties" element={<ProtectedRoute role="investor"><InvestorProperties /></ProtectedRoute>} />
      <Route path="/investor/portfolio" element={<ProtectedRoute role="investor"><InvestorPortfolio /></ProtectedRoute>} />
      <Route path="/investor/kyc" element={<ProtectedRoute role="investor"><InvestorKYC /></ProtectedRoute>} />
      <Route path="/investor/trading" element={<ProtectedRoute role="investor"><InvestorTradingDesk /></ProtectedRoute>} />
      <Route path="/investor/taxes" element={<ProtectedRoute role="investor"><InvestorTaxDocuments /></ProtectedRoute>} />
      <Route path="/investor/voting" element={<ProtectedRoute role="investor"><InvestorVoting /></ProtectedRoute>} />
      <Route path="/investor/ai-reader" element={<ProtectedRoute role="investor"><InvestorAIReader /></ProtectedRoute>} />

      {/* Landlord */}
      <Route path="/landlord/dashboard" element={<ProtectedRoute role="landlord"><LandlordDashboard /></ProtectedRoute>} />
      <Route path="/landlord/upload" element={<ProtectedRoute role="landlord"><LandlordPropertyUpload /></ProtectedRoute>} />
      <Route path="/landlord/properties" element={<ProtectedRoute role="landlord"><LandlordPropertyManagement /></ProtectedRoute>} />
      <Route path="/landlord/kyb" element={<ProtectedRoute role="landlord"><LandlordKYB /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/tokenization" element={<ProtectedRoute role="admin"><AdminTokenizationEngine /></ProtectedRoute>} />
      <Route path="/admin/approvals" element={<ProtectedRoute role="admin"><AdminApprovals /></ProtectedRoute>} />
      <Route path="/admin/payouts" element={<ProtectedRoute role="admin"><AdminPayouts /></ProtectedRoute>} />
      <Route path="/admin/fees" element={<ProtectedRoute role="admin"><AdminFeeManagement /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  )
}
