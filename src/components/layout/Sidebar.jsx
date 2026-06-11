import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Building2, Briefcase, ShieldCheck, BarChart3,
  FileText, Vote, Bot, LogOut, TrendingUp, Upload, Settings,
  ClipboardList, Banknote, Cpu, Users, ChevronRight, Layers,
  Home, Star
} from 'lucide-react'

const investorNav = [
  { label: 'Dashboard',       icon: LayoutDashboard, to: '/investor/dashboard', phase: 1 },
  { label: 'Properties',      icon: Building2,       to: '/investor/properties', phase: 1 },
  { label: 'My Portfolio',    icon: Briefcase,       to: '/investor/portfolio',  phase: 1 },
  { label: 'KYC Verification',icon: ShieldCheck,     to: '/investor/kyc',        phase: 1 },
  { label: 'Trading Desk',    icon: TrendingUp,      to: '/investor/trading',    phase: 2 },
  { label: 'Tax Documents',   icon: FileText,        to: '/investor/taxes',      phase: 2 },
  { label: "Brick Owners' Circle", icon: Vote,       to: '/investor/voting',     phase: 3 },
  { label: 'Property Intelligence', icon: Bot,        to: '/investor/ai-reader',  phase: 3 },
]

const landlordNav = [
  { label: 'Dashboard',       icon: LayoutDashboard, to: '/landlord/dashboard', phase: 1 },
  { label: 'List a Property', icon: Upload,          to: '/landlord/upload',    phase: 1 },
  { label: 'My Properties',   icon: Home,            to: '/landlord/properties',phase: 2 },
  { label: 'KYB Verification',icon: ShieldCheck,     to: '/landlord/kyb',       phase: 2 },
]

const adminNav = [
  { label: 'Dashboard',       icon: LayoutDashboard, to: '/admin/dashboard',     phase: 1 },
  { label: 'Brick Maker',     icon: Cpu,             to: '/admin/tokenization',  phase: 1 },
  { label: 'Approvals',       icon: ClipboardList,   to: '/admin/approvals',     phase: 1 },
  { label: 'Rent Payouts',    icon: Banknote,        to: '/admin/payouts',       phase: 1 },
  { label: 'Fee Management',  icon: Settings,        to: '/admin/fees',          phase: 2 },
  { label: 'Users',           icon: Users,           to: '/admin/users',         phase: 2 },
]

const phaseColors = {
  1: 'bg-blue-100 text-blue-700',
  2: 'bg-purple-100 text-purple-700',
  3: 'bg-amber-100 text-amber-700',
}

const roleColors = {
  investor: { bg: 'bg-blue-600',    light: 'bg-blue-900/40',    text: 'text-blue-300',   gradient: 'from-blue-600 to-blue-700'    },
  landlord: { bg: 'bg-emerald-600', light: 'bg-emerald-900/40', text: 'text-emerald-300',gradient: 'from-emerald-600 to-emerald-700'},
  admin:    { bg: 'bg-violet-600',  light: 'bg-violet-900/40',  text: 'text-violet-300', gradient: 'from-violet-600 to-violet-700' },
}

export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const navItems = user?.role === 'investor' ? investorNav
    : user?.role === 'landlord' ? landlordNav
    : adminNav

  const colors = roleColors[user?.role] || roleColors.admin

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const groupedItems = navItems.reduce((acc, item) => {
    const ph = `Phase ${item.phase}`
    if (!acc[ph]) acc[ph] = []
    acc[ph].push(item)
    return acc
  }, {})

  return (
    <aside className="w-64 min-h-screen bg-sidebar flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br', colors.gradient)}>
            <Layers size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sidebar-foreground font-bold text-base leading-none">BrickBloc</p>
            <p className="text-sidebar-muted-foreground text-xs mt-0.5">Real Estate Platform</p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="px-4 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold bg-gradient-to-br', colors.gradient)}>
            {user?.avatar}
          </div>
          <div className="min-w-0">
            <p className="text-sidebar-foreground text-sm font-medium truncate">{user?.name}</p>
            <p className="text-sidebar-muted-foreground text-xs truncate">{user?.email}</p>
          </div>
        </div>
        <div className="mt-2">
          <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium capitalize', colors.light, colors.text)}>
            {user?.role}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-5">
        {Object.entries(groupedItems).map(([phaseLabel, items]) => {
          const phaseNum = parseInt(phaseLabel.split(' ')[1])
          return (
            <div key={phaseLabel}>
              <p className="text-xs font-semibold text-sidebar-muted-foreground uppercase tracking-wider px-2 mb-2 flex items-center gap-2">
                {phaseLabel}
                <span className={cn('text-xs px-1.5 py-0.5 rounded font-medium', phaseColors[phaseNum])}>
                  {phaseNum === 1 ? 'MVP' : phaseNum === 2 ? 'Growth' : 'Upgrade'}
                </span>
              </p>
              <div className="space-y-1">
                {items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors group',
                        isActive
                          ? `bg-gradient-to-r ${colors.gradient} text-white shadow-sm`
                          : 'text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent'
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon size={16} className={isActive ? 'text-white' : 'text-sidebar-muted-foreground group-hover:text-sidebar-foreground'} />
                        <span className="flex-1">{item.label}</span>
                        {isActive && <ChevronRight size={14} className="text-white/70" />}
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          )
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          <LogOut size={16} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  )
}
