import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { StatCard } from '@/components/ui/stat-card'
import { researchUsers, regions, auditActions } from '@/data/mockData'
import { Users, ShieldCheck, UserX, Globe, Plus, UserCheck, UserMinus, Activity, ShieldAlert } from 'lucide-react'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts'

const TIER_COLORS = {
  'Super Admin':        '#7c3aed',
  'Tech Admin':         '#0ea5e9',
  'Compliance Officer': '#10b981',
  'SPV Manager':        '#f59e0b',
  'Support Tier 1':     '#94a3b8',
  'Support Tier 2':     '#64748b',
}
const TIER_ORDER = ['Super Admin', 'Tech Admin', 'Compliance Officer', 'SPV Manager', 'Support Tier 1', 'Support Tier 2']

const ROLES = ['SPV Manager', 'Research User']
const ALL_REGIONS = ['All', ...regions]

const roleColors = {
  'SPV Manager':   'bg-sky-100 text-sky-700',
  'Research User': 'bg-sky-100 text-sky-700',
}

const regionColors = {
  'US':               'bg-amber-50 text-amber-700 border-amber-200',
  'Switzerland':      'bg-red-50 text-red-700 border-red-200',
  'Rest of Europe':   'bg-blue-50 text-blue-700 border-blue-200',
}

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const emptyForm = { name: '', email: '', role: 'Research User', region: 'US' }

export function AdminUsers() {
  const [users, setUsers] = useState(researchUsers)
  const [regionFilter, setRegionFilter] = useState('All')
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  const filtered = regionFilter === 'All'
    ? users
    : users.filter(u => u.region === regionFilter)

  const total           = users.length
  const spvCount        = users.filter(u => u.role === 'SPV Manager').length
  const puCount         = users.filter(u => u.role === 'Research User').length
  const disabled        = users.filter(u => u.status === 'disabled').length
  const activeSessions  = users.filter(u => u.sessionActive).length
  const flaggedUsers    = users.filter(u => u.securityFlag)
  const securityFlags   = flaggedUsers.length

  const tierData = TIER_ORDER
    .map(tier => ({
      name: tier,
      value: users.filter(u => u.permissionTier === tier).length,
      fill: TIER_COLORS[tier],
    }))
    .filter(d => d.value > 0)

  const toggleStatus = (id) => {
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, status: u.status === 'active' ? 'disabled' : 'active' } : u
    ))
  }

  const validate = () => {
    const e = {}
    if (!form.name.trim())  e.name  = 'Name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email'
    if (users.find(u => u.email.toLowerCase() === form.email.toLowerCase())) e.email = 'Email already exists'
    return e
  }

  const handleAdd = () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    const newUser = {
      id: `pu-${Date.now()}`,
      name:     form.name.trim(),
      email:    form.email.trim(),
      role:     form.role,
      region:   form.region,
      status:   'active',
      joinDate: new Date().toISOString().split('T')[0],
    }
    setUsers(prev => [newUser, ...prev])
    setForm(emptyForm)
    setErrors({})
    setAddOpen(false)
  }

  return (
    <Layout>
      <Header title="Users" subtitle="Manage research users, roles and regional access" />
      <div className="ds-page">

        {/* Stats row 1 */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users"     value={total}    icon={Users}       color="blue" />
          <StatCard label="SPV Managers"    value={spvCount} icon={ShieldCheck} color="blue" />
          <StatCard label="Research Users"  value={puCount}  icon={UserCheck}   color="green" />
          <StatCard label="Disabled"        value={disabled} icon={UserX}       color="amber" />
        </div>

        {/* Stats row 2: highlighted security metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Active Sessions */}
          <div className="bg-gradient-to-br from-emerald-50 to-sky-50 border border-emerald-200 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-200">
              <Activity size={22} className="text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">🌟 Active Sessions</p>
              <p className="text-4xl font-extrabold text-emerald-700 leading-none mt-1">{activeSessions}</p>
              <p className="text-xs text-emerald-600 mt-1">staff members logged in right now</p>
            </div>
          </div>

          {/* Security Flags */}
          <div className={`border rounded-2xl p-5 flex items-start gap-4 ${
            securityFlags > 0
              ? 'bg-gradient-to-br from-red-50 to-rose-50 border-red-300'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${
              securityFlags > 0 ? 'bg-red-500 shadow-red-200' : 'bg-gray-400 shadow-gray-200'
            }`}>
              <ShieldAlert size={22} className="text-white" strokeWidth={2} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className={`text-xs font-semibold uppercase tracking-wide ${securityFlags > 0 ? 'text-red-700' : 'text-gray-600'}`}>
                  🌟 Security Flags
                </p>
                {securityFlags > 0 && (
                  <span className="bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                    {securityFlags}
                  </span>
                )}
              </div>
              <p className={`text-4xl font-extrabold leading-none mt-1 ${securityFlags > 0 ? 'text-red-600' : 'text-gray-600'}`}>
                {securityFlags}
              </p>
              {securityFlags > 0 ? (
                <div className="mt-2 space-y-1">
                  {flaggedUsers.map(u => (
                    <p key={u.id} className="text-xs text-red-600 truncate">
                      <span className="font-semibold">{u.name}:</span> {u.securityFlagReason}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-600 mt-1">No suspicious activity detected</p>
              )}
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Chart 1: Role & Privilege Distribution */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
            <p className="text-sm font-semibold text-gray-900">Role & Privilege Distribution</p>
            <p className="text-xs text-gray-600 mt-0.5 mb-4">Permission tier breakdown across all staff</p>
            <div className="flex gap-5 flex-1 items-center">
              <div style={{ width: 160, height: 160, flexShrink: 0 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={tierData}
                      cx="50%"
                      cy="50%"
                      innerRadius={44}
                      outerRadius={70}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      strokeWidth={0}
                    >
                      {tierData.map((e, i) => <Cell key={i} fill={e.fill} />)}
                    </Pie>
                    <Tooltip
                      formatter={(v, name) => [v + ' users', name]}
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: 'none' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-2.5 min-w-0">
                {tierData.map((d, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: d.fill }} />
                    <span className="text-xs text-gray-600 truncate flex-1">{d.name}</span>
                    <span className="text-xs font-bold text-gray-800 flex-shrink-0">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 2: Audit Trail / System Action Volume */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 flex flex-col">
            <p className="text-sm font-semibold text-gray-900">System Action Volume</p>
            <p className="text-xs text-gray-600 mt-0.5 mb-4">Audit trail — admin actions over the last 7 days</p>
            <div style={{ height: 160 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={auditActions} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: 'none' }}
                  />
                  <Line type="monotone" dataKey="kycApprovals" name="KYC Approvals" stroke="#10b981" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="propEdits"    name="Property Edits" stroke="#0ea5e9" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="resets"       name="Resets"         stroke="#f59e0b" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-2 justify-center">
              {[['#10b981','KYC Approvals'],['#0ea5e9','Property Edits'],['#f59e0b','Resets']].map(([c,l]) => (
                <div key={l} className="flex items-center gap-1.5">
                  <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: c }} />
                  <span className="text-xs text-gray-600">{l}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Region filter + Add button */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <Globe size={14} className="text-gray-400 ml-2" />
            {ALL_REGIONS.map(r => (
              <button
                key={r}
                onClick={() => setRegionFilter(r)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  regionFilter === r
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-700'
                }`}
              >
                {r}
                <span className="ml-1.5 text-xs text-gray-600">
                  ({r === 'All' ? users.length : users.filter(u => u.region === r).length})
                </span>
              </button>
            ))}
          </div>
          <Button onClick={() => { setForm(emptyForm); setErrors({}); setAddOpen(true) }} className="flex items-center gap-2">
            <Plus size={15} /> Add User
          </Button>
        </div>

        {/* Users table */}
        <Card>
          <CardHeader>
            <CardTitle>
              {regionFilter === 'All' ? 'All Users' : `Users — ${regionFilter}`}
              <span className="ml-2 text-sm font-normal text-gray-600">({filtered.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['User', 'Permission Tier', 'Region', 'Session', 'Status', 'Last Login', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs text-gray-600 font-medium px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${user.status === 'disabled' ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {initials(user.name)}
                          </div>
                          {user.sessionActive && (
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" title="Active session" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium text-gray-900 text-sm">{user.name}</span>
                            {user.securityFlag && (
                              <ShieldAlert size={13} className="text-red-500 flex-shrink-0" title={user.securityFlagReason} />
                            )}
                          </div>
                          <p className="text-xs text-gray-600">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: TIER_COLORS[user.permissionTier] || '#94a3b8' }}
                      >
                        {user.permissionTier || user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${regionColors[user.region]}`}>
                        {user.region}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {user.sessionActive
                        ? <span className="flex items-center gap-1.5 text-xs text-emerald-700 font-medium"><span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />Live</span>
                        : <span className="text-xs text-gray-600">Offline</span>
                      }
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-gray-600 text-xs">{user.lastLogin || user.joinDate}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => toggleStatus(user.id)}
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
                          user.status === 'active'
                            ? 'border-red-200 text-red-600 hover:bg-red-50'
                            : 'border-green-200 text-green-600 hover:bg-green-50'
                        }`}
                      >
                        {user.status === 'active'
                          ? <><UserMinus size={12} /> Disable</>
                          : <><UserCheck size={12} /> Enable</>
                        }
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-600">No users found for this region.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Add User Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add New User" size="sm">
        <div className="space-y-4">
          <div>
            <label className="ds-label mb-1.5">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g. John Smith"
              className="ds-input w-full"
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="ds-label mb-1.5">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="e.g. john@example.com"
              className="ds-input w-full"
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="ds-label mb-1.5">Role</label>
            <div className="grid grid-cols-2 gap-2">
              {ROLES.map(r => (
                <button
                  key={r}
                  onClick={() => setForm(f => ({ ...f, role: r }))}
                  className={`py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-colors text-left ${
                    form.role === r
                      ? r === 'SPV Manager'
                        ? 'border-sky-500 bg-sky-50 text-sky-700'
                        : 'border-sky-500 bg-sky-50 text-sky-700'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="ds-label mb-1.5">Region</label>
            <div className="flex flex-col gap-2">
              {regions.map(reg => (
                <button
                  key={reg}
                  onClick={() => setForm(f => ({ ...f, region: reg }))}
                  className={`py-2 px-3 rounded-xl border-2 text-sm font-medium transition-colors text-left ${
                    form.region === reg
                      ? 'border-gray-900 bg-gray-50 text-gray-900'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {reg}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleAdd}>
              <Plus size={14} /> Add User
            </Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
