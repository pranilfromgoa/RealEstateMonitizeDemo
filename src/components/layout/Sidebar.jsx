import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Building2, Briefcase, ShieldCheck,
  FileText, Vote, Bot, LogOut, TrendingUp, Settings,
  Banknote, Cpu, Users, Layers, Landmark, UserCheck, Home,
  Search, SlidersHorizontal, Receipt, ClipboardList, BarChart3,
  Vault, Megaphone, Images, Scale, ShieldAlert,
} from 'lucide-react'

const holderNav = [
  { label: 'Dashboard',            icon: LayoutDashboard, to: '/holder/dashboard',  group: 'PLATFORM' },
  { label: 'SPV Marketplace',                  icon: Building2,       to: '/holder/properties', group: 'PLATFORM' },
  { label: 'My Portfolio',         icon: Briefcase,       to: '/holder/portfolio',  group: 'PLATFORM' },
  { label: 'KYC Verification',     icon: ShieldCheck,     to: '/holder/kyc',        group: 'PLATFORM' },
  { label: 'Trading Desk',         icon: TrendingUp,      to: '/holder/trading',    group: 'TRADING'  },
  { label: 'Tax Documents',        icon: FileText,        to: '/holder/taxes',      group: 'TRADING'  },
  { label: "Brick Owners' Circle", icon: Vote,            to: '/holder/voting',     group: 'COMMUNITY'},
  { label: 'SPV Intelligence',      icon: Bot,             to: '/holder/ai-reader',  group: 'COMMUNITY'},
]

const adminNav = [
  { label: 'Dashboard',        icon: LayoutDashboard, to: '/admin/dashboard',    group: 'PLATFORM'   },
  { label: 'Brick Maker',      icon: Cpu,             to: '/admin/tokenization', group: 'PLATFORM'   },
  { label: 'KYC Verification', icon: ShieldCheck,     to: '/admin/approvals',    group: 'PLATFORM'   },
  { label: 'Rent Payouts',     icon: Banknote,        to: '/admin/payouts',      group: 'PLATFORM'   },
  { label: 'SPV Registry',     icon: Landmark,        to: '/admin/spv',          group: 'MANAGEMENT' },
  { label: 'Holders',          icon: UserCheck,       to: '/admin/holders',      group: 'MANAGEMENT' },
  { label: 'Fee Management',   icon: Settings,        to: '/admin/fees',         group: 'MANAGEMENT' },
  { label: 'Users',            icon: Users,           to: '/admin/users',        group: 'MANAGEMENT' },
  { label: 'Link Security',   icon: ShieldAlert,     to: '/admin/security',     group: 'SECURITY'   },
]

const spvManagerNav = [
  { label: 'SPVs Managed By Me',  icon: Home,          to: '/spv_manager/properties', group: 'MANAGEMENT'   },
  { label: 'SPV Registry',        icon: Landmark,      to: '/spv_manager/spv',        group: 'MANAGEMENT'   },
  { label: 'Log Rent Income',     icon: Receipt,       to: '/spv_manager/rent',       group: 'FINANCIALS'   },
  { label: 'Expenses',            icon: ClipboardList, to: '/spv_manager/expenses',   group: 'FINANCIALS'   },
  { label: 'Appraisal Report',    icon: BarChart3,     to: '/spv_manager/appraisal',  group: 'FINANCIALS'   },
  { label: 'Compliance Vault',    icon: Vault,         to: '/spv_manager/vault',      group: 'FINANCIALS'   },
  { label: 'Investor Updates',    icon: Megaphone,     to: '/spv_manager/updates',    group: 'INVESTOR REL' },
  { label: 'Property Gallery',    icon: Images,        to: '/spv_manager/gallery',    group: 'INVESTOR REL' },
  { label: 'Governance',          icon: Scale,         to: '/spv_manager/governance', group: 'GOVERNANCE'   },
]

const researchNav = [
  { label: 'Prospecting Board', icon: Search,            to: '/research/board',    group: 'RESEARCH' },
  { label: 'Scenario Modeler',  icon: SlidersHorizontal, to: '/research/simulate', group: 'RESEARCH' },
]

const roleConfig = {
  holder: {
    dot:            'bg-sky-500',
    portalLabel:    'HOLDER PORTAL',
    accessLabel:    'PERSONAL ACCESS',
    accessColor:    'text-sky-600',
    description:    'Browse SPVs, trade Bricks & track your holdings.',
    activeClass:    'bg-sky-600 text-white shadow-sm',
    gradient:       'from-sky-500 to-sky-600',
  },
  admin: {
    dot:            'bg-sky-500',
    portalLabel:    'ADMIN PORTAL',
    accessLabel:    'WHOLE SYSTEM ACCESS',
    accessColor:    'text-sky-600',
    description:    'Manage tokenization, approvals, payouts & platform settings.',
    activeClass:    'bg-sky-600 text-white shadow-sm',
    gradient:       'from-sky-500 to-sky-600',
  },
  spv_manager: {
    dot:            'bg-sky-500',
    portalLabel:    'SPV MANAGER PORTAL',
    accessLabel:    'SPV REGISTRY ACCESS',
    accessColor:    'text-sky-600',
    description:    'Create and manage real estate SPVs.',
    activeClass:    'bg-sky-600 text-white shadow-sm',
    gradient:       'from-sky-500 to-sky-600',
  },
  research: {
    dot:            'bg-sky-500',
    portalLabel:    'RESEARCH PORTAL',
    accessLabel:    'INTERNAL RESEARCH ACCESS',
    accessColor:    'text-sky-600',
    description:    'Scout properties, run simulations & feed the SPV pipeline.',
    activeClass:    'bg-sky-600 text-white shadow-sm',
    gradient:       'from-sky-500 to-sky-600',
  },
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const { clearSimState } = useData()
  const navigate = useNavigate()

  const navItems = user?.role === 'holder' ? holderNav
    : user?.role === 'spv_manager' ? spvManagerNav
    : user?.role === 'research' ? researchNav
    : adminNav

  const cfg = roleConfig[user?.role] || roleConfig.admin

  const handleLogout = () => {
    clearSimState()
    logout()
    navigate('/')
  }

  const groupedItems = navItems.reduce((acc, item) => {
    if (!acc[item.group]) acc[item.group] = []
    acc[item.group].push(item)
    return acc
  }, {})

  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br', cfg.gradient)}>
            <Layers size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sidebar-foreground font-bold text-base leading-none" style={{fontFamily: '"Space Grotesk", sans-serif'}}>BrickChain</p>
            <p className="text-sidebar-muted-foreground text-xs mt-0.5">Real Estate Platform</p>
          </div>
        </div>
      </div>

      {/* Role context card — matches PROPCHAIN "ADMIN PORTAL" card */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('w-2 h-2 rounded-full flex-shrink-0', cfg.dot)} />
            <span className="text-xs font-bold text-sidebar-foreground tracking-widest">{cfg.portalLabel}</span>
          </div>
          <p className={cn('text-xs font-semibold tracking-wider mb-1.5', cfg.accessColor)}>
            {cfg.accessLabel}
          </p>
          <p className="text-xs text-sidebar-muted-foreground leading-relaxed">{cfg.description}</p>
        </div>
        <div className="mt-3 flex items-center gap-2.5">
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold bg-gradient-to-br flex-shrink-0', cfg.gradient)}>
            {user?.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-sidebar-foreground text-sm font-semibold truncate leading-tight">{user?.name}</p>
            <p className="text-sidebar-muted-foreground text-xs truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {Object.entries(groupedItems).map(([groupLabel, items]) => (
          <div key={groupLabel}>
            <p className="text-xs font-semibold text-sidebar-muted-foreground tracking-widest uppercase px-2 mb-2">
              {groupLabel}
            </p>
            <div className="space-y-0.5">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group w-full',
                      isActive
                        ? cfg.activeClass
                        : 'text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        size={16}
                        className={isActive ? 'text-white' : 'text-sidebar-muted-foreground group-hover:text-sidebar-foreground'}
                      />
                      <span className="flex-1 font-medium">{item.label}</span>
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors font-medium"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
