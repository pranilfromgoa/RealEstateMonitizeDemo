import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/context/AuthContext'
import { DataProvider } from '@/context/DataContext'
import { FontSizeProvider } from '@/context/FontSizeContext'

import { Login } from '@/pages/Login'

// Holder
import { HolderDashboard } from '@/pages/holder/Dashboard'
import { HolderSpvs } from '@/pages/holder/Properties'
import { HolderPortfolio } from '@/pages/holder/Portfolio'
import { HolderKYC } from '@/pages/holder/KYC'
import { HolderTradingDesk } from '@/pages/holder/TradingDesk'
import { HolderTaxDocuments } from '@/pages/holder/TaxDocuments'
import { HolderVoting } from '@/pages/holder/Voting'
import { HolderAIReader } from '@/pages/holder/AIReader'

// Admin
import { AdminDashboard } from '@/pages/admin/Dashboard'
import { AdminTokenizationEngine } from '@/pages/admin/TokenizationEngine'
import { AdminApprovals } from '@/pages/admin/Approvals'
import { AdminPayouts } from '@/pages/admin/Payouts'
import { AdminFeeManagement } from '@/pages/admin/FeeManagement'
import { AdminUsers } from '@/pages/admin/Users'
import { AdminSPV } from '@/pages/admin/SPV'
import { AdminHolders } from '@/pages/admin/Holders'
import { SpvManagerMyProperties }    from '@/pages/spv-manager/MyProperties'
import { SpvManagerRentLogging }      from '@/pages/spv-manager/RentLogging'
import { SpvManagerExpenseLogging }   from '@/pages/spv-manager/ExpenseLogging'
import { SpvManagerAppraisalReport }  from '@/pages/spv-manager/AppraisalReport'
import { SpvManagerComplianceVault }  from '@/pages/spv-manager/ComplianceVault'
import { SpvManagerInvestorUpdates }  from '@/pages/spv-manager/InvestorUpdates'
import { SpvManagerPropertyGallery }  from '@/pages/spv-manager/PropertyGallery'
import { SpvManagerGovernanceProposals } from '@/pages/spv-manager/GovernanceProposals'

// Research
import { ResearchBoard } from '@/pages/research/ProspectingBoard'
import { ScenarioModeler } from '@/pages/research/ScenarioModeler'


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

      {/* Holder */}
      <Route path="/holder/dashboard" element={<ProtectedRoute role="holder"><HolderDashboard /></ProtectedRoute>} />
      <Route path="/holder/properties" element={<ProtectedRoute role="holder"><HolderSpvs /></ProtectedRoute>} />
      <Route path="/holder/portfolio" element={<ProtectedRoute role="holder"><HolderPortfolio /></ProtectedRoute>} />
      <Route path="/holder/kyc" element={<ProtectedRoute role="holder"><HolderKYC /></ProtectedRoute>} />
      <Route path="/holder/trading" element={<ProtectedRoute role="holder"><HolderTradingDesk /></ProtectedRoute>} />
      <Route path="/holder/taxes" element={<ProtectedRoute role="holder"><HolderTaxDocuments /></ProtectedRoute>} />
      <Route path="/holder/voting" element={<ProtectedRoute role="holder"><HolderVoting /></ProtectedRoute>} />
      <Route path="/holder/ai-reader" element={<ProtectedRoute role="holder"><HolderAIReader /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/tokenization" element={<ProtectedRoute role="admin"><AdminTokenizationEngine /></ProtectedRoute>} />
      <Route path="/admin/approvals" element={<ProtectedRoute role="admin"><AdminApprovals /></ProtectedRoute>} />
      <Route path="/admin/payouts" element={<ProtectedRoute role="admin"><AdminPayouts /></ProtectedRoute>} />
      <Route path="/admin/fees" element={<ProtectedRoute role="admin"><AdminFeeManagement /></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>} />
      <Route path="/admin/spv" element={<ProtectedRoute role="admin"><AdminSPV /></ProtectedRoute>} />
      <Route path="/admin/holders" element={<ProtectedRoute role="admin"><AdminHolders /></ProtectedRoute>} />

      {/* SPV Manager */}
      <Route path="/spv_manager/dashboard"   element={<Navigate to="/spv_manager/spv" replace />} />
      <Route path="/spv_manager/spv"         element={<ProtectedRoute role="spv_manager"><AdminSPV /></ProtectedRoute>} />
      <Route path="/spv_manager/properties"  element={<ProtectedRoute role="spv_manager"><SpvManagerMyProperties /></ProtectedRoute>} />
      <Route path="/spv_manager/rent"        element={<ProtectedRoute role="spv_manager"><SpvManagerRentLogging /></ProtectedRoute>} />
      <Route path="/spv_manager/expenses"    element={<ProtectedRoute role="spv_manager"><SpvManagerExpenseLogging /></ProtectedRoute>} />
      <Route path="/spv_manager/appraisal"   element={<ProtectedRoute role="spv_manager"><SpvManagerAppraisalReport /></ProtectedRoute>} />
      <Route path="/spv_manager/vault"       element={<ProtectedRoute role="spv_manager"><SpvManagerComplianceVault /></ProtectedRoute>} />
      <Route path="/spv_manager/updates"     element={<ProtectedRoute role="spv_manager"><SpvManagerInvestorUpdates /></ProtectedRoute>} />
      <Route path="/spv_manager/gallery"     element={<ProtectedRoute role="spv_manager"><SpvManagerPropertyGallery /></ProtectedRoute>} />
      <Route path="/spv_manager/governance"  element={<ProtectedRoute role="spv_manager"><SpvManagerGovernanceProposals /></ProtectedRoute>} />

      {/* Research */}
      <Route path="/research/dashboard"  element={<Navigate to="/research/board" replace />} />
      <Route path="/research/board"      element={<ProtectedRoute role="research"><ResearchBoard /></ProtectedRoute>} />
      <Route path="/research/simulate"   element={<ProtectedRoute role="research"><ScenarioModeler /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <FontSizeProvider>
      <AuthProvider>
        <DataProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </DataProvider>
      </AuthProvider>
    </FontSizeProvider>
  )
}
