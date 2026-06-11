import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Building2, TrendingUp, ShieldCheck, Layers, ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'brickbloc_demo_v1'

const roles = [
  {
    key: 'investor',
    label: 'Investor',
    icon: TrendingUp,
    tagline: 'Buy Bricks, Earn Rent',
    description: 'Browse tokenized properties, purchase Bricks, track your portfolio, and earn passive rental income.',
    features: ['Browse property listings', 'Buy & sell Bricks', 'Track portfolio & earnings', "Tax documents & Property Intelligence"],
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    border: 'border-blue-200',
    bg: 'bg-blue-50',
    selectedBg: 'bg-blue-600',
    selectedBorder: 'border-blue-600',
    ring: 'ring-blue-500',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    buttonBg: 'bg-blue-600 hover:bg-blue-700',
    demo: { name: 'Alex Rivera', id: 'investor-001' },
  },
  {
    key: 'landlord',
    label: 'Landlord',
    icon: Building2,
    tagline: 'List & Manage Properties',
    description: 'Submit your properties for tokenization, track approval progress, and manage tenants from one place.',
    features: ['Submit properties for listing', 'Track approval status', 'Manage tenants & repairs', 'View monthly reports'],
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
    border: 'border-emerald-200',
    bg: 'bg-emerald-50',
    selectedBg: 'bg-emerald-600',
    selectedBorder: 'border-emerald-600',
    ring: 'ring-emerald-500',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    buttonBg: 'bg-emerald-600 hover:bg-emerald-700',
    demo: { name: 'Sarah Chen', id: 'landlord-001' },
  },
  {
    key: 'admin',
    label: 'Platform Admin',
    icon: ShieldCheck,
    tagline: 'Manage the Platform',
    description: 'Review property submissions, tokenize assets into Bricks, manage rent payouts, and oversee platform operations.',
    features: ['Tokenize properties (Brick Maker)', 'Approve property listings', 'Manage rent distributions', 'Platform analytics & fees'],
    color: 'violet',
    gradient: 'from-violet-500 to-violet-600',
    border: 'border-violet-200',
    bg: 'bg-violet-50',
    selectedBg: 'bg-violet-600',
    selectedBorder: 'border-violet-600',
    ring: 'ring-violet-500',
    iconBg: 'bg-violet-100',
    iconColor: 'text-violet-600',
    buttonBg: 'bg-violet-600 hover:bg-violet-700',
    demo: { name: 'Daniel', id: 'admin-001' },
  },
]

export function Login() {
  const [selected, setSelected] = useState(null)
  const [cleared, setCleared] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleClear = () => {
    localStorage.removeItem(STORAGE_KEY)
    setCleared(true)
    setTimeout(() => setCleared(false), 2000)
  }

  const handleLogin = () => {
    if (!selected) return
    login(selected)
    if (selected === 'investor') navigate('/investor/dashboard')
    else if (selected === 'landlord') navigate('/landlord/dashboard')
    else navigate('/admin/dashboard')
  }

  const selectedRole = roles.find(r => r.key === selected)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-950 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-96 bg-gradient-to-b from-gray-900 to-gray-950 p-10 border-r border-gray-800">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Layers size={20} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-xl leading-none">BrickBloc</p>
              <p className="text-gray-400 text-xs mt-0.5">Real Estate Tokenization</p>
            </div>
          </div>

          <div className="space-y-6 mt-12">
            <h2 className="text-3xl font-bold text-white leading-tight">
              Own a piece of<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                real estate
              </span><br/>
              starting at $100.
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              BrickBloc tokenizes premium real estate into affordable Bricks, letting anyone invest in properties and earn passive rental income.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
              { label: 'Properties Listed', value: '6' },
              { label: 'Total Investors', value: '1,247' },
              { label: 'Rent Distributed', value: '$2.4M' },
              { label: 'Avg. Annual Yield', value: '7.9%' },
            ].map(stat => (
              <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <p className="text-white font-bold text-xl">{stat.value}</p>
                <p className="text-gray-400 text-xs mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="text-gray-600 text-xs">© 2025 BrickBloc Inc. — Prototype Demo</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 justify-center mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Layers size={20} className="text-white" />
            </div>
            <p className="text-white font-bold text-2xl">BrickBloc</p>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white">Select your role to continue</h1>
            <p className="text-gray-400 text-sm mt-2">This is a prototype demo — no real login required</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {roles.map((role) => {
              const isSelected = selected === role.key
              return (
                <button
                  key={role.key}
                  onClick={() => setSelected(role.key)}
                  className={cn(
                    'relative text-left rounded-2xl p-5 border-2 transition-all duration-200',
                    isSelected
                      ? `border-${role.color}-500 bg-white/10 ring-2 ring-${role.color}-500/30`
                      : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8'
                  )}
                  style={isSelected ? {
                    borderColor: role.key === 'investor' ? '#3b82f6' : role.key === 'landlord' ? '#10b981' : '#8b5cf6',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    boxShadow: `0 0 0 4px ${role.key === 'investor' ? 'rgba(59,130,246,0.15)' : role.key === 'landlord' ? 'rgba(16,185,129,0.15)' : 'rgba(139,92,246,0.15)'}`,
                  } : {}}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 size={18} className={role.key === 'investor' ? 'text-blue-400' : role.key === 'landlord' ? 'text-emerald-400' : 'text-violet-400'} />
                    </div>
                  )}

                  <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-4', role.iconBg)}>
                    <role.icon size={20} className={role.iconColor} />
                  </div>

                  <p className="text-white font-semibold text-base">{role.label}</p>
                  <p className={cn('text-xs font-medium mt-0.5', role.iconColor)}>{role.tagline}</p>
                  <p className="text-gray-400 text-xs mt-2 leading-relaxed">{role.description}</p>

                  <div className="mt-4 space-y-1.5">
                    {role.features.map((f) => (
                      <div key={f} className="flex items-center gap-2">
                        <div className={cn('w-1.5 h-1.5 rounded-full', `bg-${role.color}-400`)} style={{ backgroundColor: role.key === 'investor' ? '#60a5fa' : role.key === 'landlord' ? '#34d399' : '#a78bfa' }} />
                        <span className="text-gray-300 text-xs">{f}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <p className="text-gray-500 text-xs">Demo as: <span className="text-gray-300">{role.demo.name}</span></p>
                  </div>
                </button>
              )
            })}
          </div>

          <button
            onClick={handleLogin}
            disabled={!selected}
            className={cn(
              'w-full py-3.5 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all',
              selected
                ? selectedRole?.buttonBg + ' shadow-lg'
                : 'bg-gray-700 cursor-not-allowed opacity-50'
            )}
            style={selected ? {
              background: selectedRole?.key === 'investor' ? 'linear-gradient(135deg, #3b82f6, #2563eb)'
                : selectedRole?.key === 'landlord' ? 'linear-gradient(135deg, #10b981, #059669)'
                : 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
            } : {}}
          >
            {selected ? `Enter as ${selectedRole?.label}` : 'Select a role to continue'}
            {selected && <ArrowRight size={18} />}
          </button>

          <div className="flex items-center justify-center mt-4 gap-3">
            <p className="text-gray-600 text-xs">Prototype — all data is simulated</p>
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-400 transition-colors"
            >
              <RotateCcw size={11} />
              {cleared ? 'Cleared!' : 'Reset demo data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
