import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { useFontSize } from '@/context/FontSizeContext'
import { Layers, ArrowRight, RotateCcw, ShieldCheck, TrendingUp, Search } from 'lucide-react'

const roles = [
  {
    key: 'admin',
    initials: 'AD',
    label: 'System Admin',
    sublabel: 'Admin (Whole System View)',
    description: 'Access entire platform database',
    demo: { name: 'Daniel', id: 'admin-001' },
    icon: ShieldCheck,
  },
  {
    key: 'spv_manager',
    initials: 'SM',
    label: 'SPV Manager',
    sublabel: 'SPV Manager (Registry & Structuring)',
    description: 'Create, edit and manage SPV assets',
    demo: { name: 'Sara Chen', id: 'spv-mgr-001' },
    icon: Layers,
  },
  {
    key: 'holder',
    initials: 'HO',
    label: 'Holder',
    sublabel: 'Holder (Portfolio, Trade, Rent...)',
    description: 'Access personal inventory, marketplace',
    demo: { name: 'Alex Rivera', id: 'investor-001' },
    icon: TrendingUp,
  },
  {
    key: 'research',
    initials: 'RU',
    label: 'Research User',
    sublabel: 'Research (Property Scouting & Simulation)',
    description: 'Scout properties & run investment simulations',
    demo: { name: 'Emily Watson', id: 'research-001' },
    icon: Search,
  },
]

const roleTheme = {
  admin: {
    cardSelected:  'border-violet-500 bg-violet-50 shadow-sm ring-2 ring-violet-200',
    badgeSelected: 'bg-violet-600 text-white',
    badgeDefault:  'bg-violet-100 text-violet-700 group-hover:bg-violet-600 group-hover:text-white',
  },
  spv_manager: {
    cardSelected:  'border-teal-500 bg-teal-50 shadow-sm ring-2 ring-teal-200',
    badgeSelected: 'bg-teal-600 text-white',
    badgeDefault:  'bg-teal-100 text-teal-700 group-hover:bg-teal-600 group-hover:text-white',
  },
  holder: {
    cardSelected:  'border-sky-500 bg-sky-50 shadow-sm ring-2 ring-sky-200',
    badgeSelected: 'bg-sky-600 text-white',
    badgeDefault:  'bg-sky-100 text-sky-700 group-hover:bg-sky-600 group-hover:text-white',
  },
  research: {
    cardSelected:  'border-amber-500 bg-amber-50 shadow-sm ring-2 ring-amber-200',
    badgeSelected: 'bg-amber-600 text-white',
    badgeDefault:  'bg-amber-100 text-amber-700 group-hover:bg-amber-600 group-hover:text-white',
  },
}

export function Login() {
  const [selected, setSelected] = useState('spv_manager')
  const [cleared, setCleared] = useState(false)
  const { login } = useAuth()
  const { resetData } = useData()
  const { fontSize, setFontSize } = useFontSize()
  const navigate = useNavigate()

  const handleClear = () => {
    resetData()
    setCleared(true)
    setTimeout(() => setCleared(false), 2000)
  }

  const handleLogin = () => {
    if (!selected) return
    login(selected)
    if (selected === 'holder') navigate('/holder/dashboard')
    else if (selected === 'spv_manager') navigate('/spv_manager/spv')
    else if (selected === 'research') navigate('/research/board')
    else navigate('/admin/dashboard')
  }

  const selectedRole = roles.find(r => r.key === selected)

  return (
    <div className="min-h-screen flex font-sans">

      {/* ── LEFT PANEL ────────────────────────────────────────── */}
      <div
        className="hidden lg:flex flex-col justify-between w-[42.24rem] p-10 select-none"
        style={{ background: '#0369a1' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)' }}>
            <Layers size={22} className="text-white" />
          </div>
          <div>
            <p className="text-white font-black text-xl tracking-widest leading-none" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              BRICKCHAIN
            </p>
            <p className="text-sky-200 text-[10px] mt-1 tracking-widest uppercase">Real Estate Tokenization</p>
          </div>
        </div>

        {/* Big tagline — vertically centered */}
        <div>
          <h1
            className="text-white font-black leading-[1.0] uppercase"
            style={{ fontFamily: '"Space Grotesk", sans-serif', fontSize: '2.25rem', letterSpacing: '-0.02em' }}
          >
            {/* FRACTIONAL<br />REAL ESTATE<br />ASSETS */}
            Fractional Ownership. <br />Exponential Growth.<br />

          </h1>


        </div>

        {/* Footer strip */}
        <div className="flex items-center justify-between">
          <p className="text-sky-300/60 text-[10px] tracking-[0.2em] uppercase">Stability in Fractional Fidelity</p>
          <p className="text-sky-300/60 text-[10px] tracking-[0.2em] uppercase">© 100% Regulated Sandbox</p>
        </div>
      </div>

      {/* ── RIGHT PANEL ───────────────────────────────────────── */}
      <div className="flex-1 bg-white flex flex-col p-10">
        <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-lg">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center">
              <Layers size={20} className="text-white" />
            </div>
            <p className="font-black text-xl tracking-widest text-gray-900" style={{ fontFamily: '"Space Grotesk", sans-serif' }}>
              BRICKCHAIN
            </p>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h2
              className="text-2xl font-extrabold text-slate-900 font-display uppercase tracking-wider"
              style={{ fontFamily: '"Space Grotesk", sans-serif', letterSpacing: '-0.01em' }}
            >
              WELCOME TO BRICKCHAIN
            </h2>
            
            <p className="text-xs text-slate-500 mt-1.5 font-medium">
              Access fractional real estate investments, trade Bricks &amp; earn passive rental income
            </p>
          </div>

          {/* One-click sign-in label */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] text-gray-400 tracking-[0.18em] uppercase font-semibold">
              Sandbox Sign-In
            </p>
            <p className="text-[10px] text-sky-600 tracking-[0.15em] uppercase font-semibold">
              Instant Entry
            </p>
          </div>

          {/* Role cards */}
          <div className="grid grid-cols-2 gap-3 mb-6 justify-items-start">
            {roles.map(role => {
              const isSelected = selected === role.key
              return (
                <button
                  key={role.key}
                  onClick={() => setSelected(role.key)}
                  onDoubleClick={() => {
                    login(role.key)
                    if (role.key === 'holder') navigate('/holder/dashboard')
                    else if (role.key === 'spv_manager') navigate('/spv_manager/spv')
                    else if (role.key === 'research') navigate('/research/board')
                    else navigate('/admin/dashboard')
                  }}
                  className={`group text-left px-3 py-2 rounded-xl border transition-all duration-150 flex items-center gap-2.5 ${
                    isSelected ? roleTheme[role.key].cardSelected : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white'
                  }`}
                >
                  <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-black tracking-wider transition-colors ${
                    isSelected ? roleTheme[role.key].badgeSelected : roleTheme[role.key].badgeDefault
                  }`}>
                    {role.initials}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm leading-tight">{role.label}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5 leading-snug">{role.sublabel}</p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <p className="text-[12px] text-gray-400">Select a role above to continue</p>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          {/* Demo identity line */}
          <div className="mb-4 h-5 text-center">
            {selected ? (
              <p className="text-[12px] text-gray-500">
                Signing in as{' '}
                <span className="font-semibold text-gray-800">{selectedRole?.demo.name}</span>
              </p>
            ) : (
              <p className="text-[12px] text-gray-400"></p>
            )}
          </div>

          {/* CTA button */}
          <button
            onClick={handleLogin}
            disabled={!selected}
            className={`w-full py-2.5 bg-[#0284c7] hover:bg-[#0369a1] text-white font-extrabold uppercase rounded-xl text-xs tracking-widest cursor-pointer shadow-sm transition hover:shadow-md flex items-center justify-center space-x-2  ${
              selected
                ? 'cursor-pointer hover:opacity-90 active:scale-[0.99]'
                : 'cursor-not-allowed opacity-40'
            }`}
            style={selected ? { background: '#0369a1' } : { background: '#94a3b8' }}
          >
            {selected ? `Enter Platform` : 'Select a Role to Continue'}
            {selected && <ArrowRight size={15} />}
          </button>

        </div>
        </div>

        {/* Footer — pinned to bottom of right panel */}
        <div className="flex items-center gap-2">
          <span className="text-amber-500 text-xs flex-shrink-0">⚠</span>
          <div className="flex-1 flex items-center justify-between gap-4">
            <p className="text-[12px] font-bold text-gray-400 leading-snug">
              Sandbox mode — all data is simulated for demo purposes.
            </p>
            <div className="flex items-center gap-3 flex-shrink-0">
              <select
                value={fontSize}
                onChange={e => setFontSize(e.target.value)}
                className="text-[10px] border border-gray-200 rounded-lg px-2 py-1 text-gray-500 bg-white focus:outline-none focus:ring-2 focus:ring-sky-200 cursor-pointer"
              >
                <option value="default">Default size</option>
                <option value="compact">Compact size</option>
                <option value="mini">Mini size</option>
              </select>
              <button
                onClick={handleClear}
                className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition-colors whitespace-nowrap"
              >
                <RotateCcw size={10} />
                {cleared ? 'Cleared!' : 'Reset data'}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
