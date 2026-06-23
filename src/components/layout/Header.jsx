import { Bell, Search, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'

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
          {/* Search */}
          <div className="relative hidden md:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent w-56 placeholder:text-muted-foreground text-foreground"
            />
          </div>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false) }}
              className="relative p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <Bell size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
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
