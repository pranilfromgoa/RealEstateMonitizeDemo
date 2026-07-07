import { Bell, Search, LogOut, ChevronDown, Building2, Users, UserCheck, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect, useMemo } from 'react'
import { researchUsers } from '@/data/mockData'

const roleColors = {
  holder:      'from-sky-500 to-sky-600',
  admin:       'from-sky-500 to-sky-600',
  spv_manager: 'from-sky-500 to-sky-600',
}

const roleRingColors = {
  holder:      'ring-sky-500/30',
  admin:       'ring-sky-500/30',
  spv_manager: 'ring-sky-500/30',
}

// ─── Search result icons & labels per category ────────────────────────────────
const CATEGORY_META = {
  holder: { label: 'HOLDERS',  Icon: UserCheck,  color: 'text-sky-600',    bg: 'bg-sky-50' },
  spv:    { label: 'SPVs',     Icon: Building2,  color: 'text-violet-600', bg: 'bg-violet-50' },
  user:   { label: 'USERS',    Icon: Users,      color: 'text-emerald-600',bg: 'bg-emerald-50' },
}

function kycBadge(status) {
  if (status === 'verified')  return 'bg-emerald-100 text-emerald-700'
  if (status === 'pending')   return 'bg-amber-100   text-amber-700'
  return 'bg-red-100 text-red-700'
}

function spvStatusBadge(status) {
  if (status === 'live')    return 'bg-emerald-100 text-emerald-700'
  if (status === 'pending') return 'bg-amber-100   text-amber-700'
  if (status === 'draft')   return 'bg-gray-100    text-gray-600'
  return 'bg-red-100 text-red-700'
}

function userStatusBadge(status) {
  if (status === 'active')   return 'bg-emerald-100 text-emerald-700'
  if (status === 'disabled') return 'bg-red-100     text-red-700'
  return 'bg-gray-100 text-gray-600'
}

// ─── GlobalSearch component ───────────────────────────────────────────────────
function GlobalSearch() {
  const { investors, spvs } = useData()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    function onClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return null

    const holders = investors
      .filter(i =>
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map(i => ({
        key: i.id, primary: i.name, secondary: i.email,
        badge: i.kycStatus, badgeClass: kycBadge(i.kycStatus),
        to: '/admin/holders',
      }))

    const spvResults = spvs
      .filter(s =>
        s.name.toLowerCase().includes(q) ||
        (s.city && s.city.toLowerCase().includes(q))
      )
      .slice(0, 4)
      .map(s => ({
        key: s.id, primary: s.name, secondary: s.city,
        badge: s.status, badgeClass: spvStatusBadge(s.status),
        to: '/admin/spv',
      }))

    const users = researchUsers
      .filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      )
      .slice(0, 4)
      .map(u => ({
        key: u.id, primary: u.name, secondary: u.email,
        badge: u.status, badgeClass: userStatusBadge(u.status),
        to: '/admin/users',
      }))

    return { holder: holders, spv: spvResults, user: users }
  }, [query, investors, spvs])

  const hasAnyResults = results && (
    results.holder.length > 0 || results.spv.length > 0 || results.user.length > 0
  )
  const showEmpty = results && !hasAnyResults

  function handleSelect(to) {
    navigate(to)
    setQuery('')
    setOpen(false)
  }

  function handleClear() {
    setQuery('')
    setOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className="relative hidden md:block" ref={containerRef}>
      {/* Input */}
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10" />
      <input
        ref={inputRef}
        type="text"
        value={query}
        placeholder="Search holders, SPVs, users…"
        aria-label="Global search"
        className="pl-9 pr-8 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent w-64 placeholder:text-muted-foreground text-foreground"
        onChange={e => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => query.trim().length >= 2 && setOpen(true)}
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label="Clear search"
        >
          <X size={13} />
        </button>
      )}

      {/* Dropdown */}
      {open && query.trim().length >= 2 && (
        <div className="absolute right-0 top-11 w-96 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          {showEmpty ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-muted-foreground">No results for <span className="font-semibold text-foreground">"{query}"</span></p>
            </div>
          ) : (
            <div className="py-2">
              {(['holder', 'spv', 'user']).map(cat => {
                const items = results[cat]
                if (!items.length) return null
                const { label, Icon, color, bg } = CATEGORY_META[cat]
                return (
                  <div key={cat} className="mb-1">
                    {/* Group header */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5">
                      <Icon size={11} className={color} />
                      <span className={`text-xs font-bold tracking-wider ${color}`}>{label}</span>
                    </div>
                    {/* Result rows */}
                    {items.map(item => (
                      <button
                        key={item.key}
                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors text-left"
                        onClick={() => handleSelect(item.to)}
                      >
                        <div className={`w-7 h-7 rounded-full ${bg} flex items-center justify-center flex-shrink-0`}>
                          <Icon size={13} className={color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.primary}</p>
                          <p className="text-xs text-muted-foreground truncate">{item.secondary}</p>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize flex-shrink-0 ${item.badgeClass}`}>
                          {item.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────
export function Header({ title, subtitle }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef(null)
  const notifRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setShowUserMenu(false)
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifications(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const notifications = [
    { id: 1, text: 'Rent distributed for Sunset Heights', time: '2h ago', unread: true },
    { id: 2, text: 'New property listing approved', time: '5h ago', unread: true },
    { id: 3, text: 'KYC verification completed', time: '1d ago', unread: false },
  ]

  const roleBadgeColors = {
    holder:      'bg-sky-100 text-sky-700',
    admin:       'bg-sky-100 text-sky-700',
    spv_manager: 'bg-sky-100 text-sky-700',
  }

  return (
    <header className="bg-white border-b border-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-3">

          {/* Search — admin only */}
          {user?.role === 'admin' && <GlobalSearch />}

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false) }}
              aria-label="View notifications"
              className="relative p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell size={18} aria-hidden="true" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" aria-hidden="true" />
              <span className="sr-only">Unread notifications</span>
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-10 w-80 bg-popover text-popover-foreground rounded-xl shadow-xl border border-border z-20">
                <div className="px-4 py-3 border-b border-border">
                  <p className="font-semibold text-foreground text-sm">Notifications</p>
                </div>
                {notifications.map(n => (
                  <div key={n.id} className={`px-4 py-3 border-b border-border/50 hover:bg-accent cursor-pointer ${n.unread ? 'bg-sky-50/50' : ''}`}>
                    <p className="text-sm text-foreground">{n.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.time}</p>
                  </div>
                ))}
                <div className="px-4 py-2 text-center">
                  <button className="text-xs text-sky-600 hover:text-sky-800 font-medium">View all</button>
                </div>
              </div>
            )}
          </div>

          {/* User menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false) }}
              className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl hover:bg-accent transition-colors"
            >
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${roleColors[user?.role] || 'from-gray-500 to-gray-600'} flex items-center justify-center text-white text-sm font-bold`}>
                {user?.avatar}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-foreground leading-tight">{user?.name}</p>
                <p className="text-xs text-muted-foreground capitalize leading-tight">{user?.role}</p>
              </div>
              <ChevronDown size={14} className="text-muted-foreground hidden md:block" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-12 w-56 bg-popover text-popover-foreground rounded-xl shadow-xl border border-border z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-muted/50">
                  <p className="text-sm font-semibold text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{user?.email}</p>
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium capitalize ${roleBadgeColors[user?.role] || 'bg-secondary text-secondary-foreground'}`}>
                    {user?.role}
                  </span>
                </div>
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-destructive hover:bg-destructive/10 transition-colors font-medium"
                  >
                    <LogOut size={15} />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
