import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { StatCard } from '@/components/ui/stat-card'
import { platformUsers, regions } from '@/data/mockData'
import { Users, ShieldCheck, UserX, Globe, Plus, UserCheck, UserMinus } from 'lucide-react'

const ROLES = ['SPV Manager', 'Platform User']
const ALL_REGIONS = ['All', ...regions]

const roleColors = {
  'SPV Manager':   'bg-violet-100 text-violet-700',
  'Platform User': 'bg-sky-100 text-sky-700',
}

const regionColors = {
  'US':               'bg-amber-50 text-amber-700 border-amber-200',
  'Switzerland':      'bg-red-50 text-red-700 border-red-200',
  'Rest of Europe':   'bg-blue-50 text-blue-700 border-blue-200',
}

function initials(name) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const emptyForm = { name: '', email: '', role: 'Platform User', region: 'US' }

export function AdminUsers() {
  const [users, setUsers] = useState(platformUsers)
  const [regionFilter, setRegionFilter] = useState('All')
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})

  const filtered = regionFilter === 'All'
    ? users
    : users.filter(u => u.region === regionFilter)

  const total    = users.length
  const spvCount = users.filter(u => u.role === 'SPV Manager').length
  const puCount  = users.filter(u => u.role === 'Platform User').length
  const disabled = users.filter(u => u.status === 'disabled').length

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
      <Header title="Users" subtitle="Manage platform users, roles and regional access" />
      <div className="ds-page">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users"     value={total}    icon={Users}       color="blue" />
          <StatCard label="SPV Managers"    value={spvCount} icon={ShieldCheck} color="violet" />
          <StatCard label="Platform Users"  value={puCount}  icon={UserCheck}   color="green" />
          <StatCard label="Disabled"        value={disabled} icon={UserX}       color="amber" />
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
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {r}
                <span className="ml-1.5 text-xs text-gray-400">
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
              <span className="ml-2 text-sm font-normal text-gray-400">({filtered.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['User', 'Email', 'Role', 'Region', 'Status', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="text-left text-xs text-gray-500 font-medium px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${user.status === 'disabled' ? 'opacity-50' : ''}`}>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          user.role === 'SPV Manager' ? 'bg-violet-100 text-violet-600' : 'bg-sky-100 text-sky-600'
                        }`}>
                          {initials(user.name)}
                        </div>
                        <span className="font-medium text-gray-900">{user.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{user.email}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${regionColors[user.region]}`}>
                        {user.region}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant={user.status === 'active' ? 'success' : 'secondary'}>
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-gray-400 text-xs">{user.joinDate}</td>
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
                    <td colSpan={7} className="px-5 py-10 text-center text-sm text-gray-400">
                      No users found for this region.
                    </td>
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
                        ? 'border-violet-500 bg-violet-50 text-violet-700'
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
