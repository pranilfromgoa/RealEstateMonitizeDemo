import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Progress } from '@/components/ui/progress'
import { landlords } from '@/data/mockData'
import { useData } from '@/context/DataContext'
import { Building2, Wrench, Users, FileText, Plus, CheckCircle2, MapPin, TrendingUp, Clock, XCircle } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const maintenanceLogs = [
  { id: 'm1', propertyId: 'prop-001', issue: 'HVAC unit 3B — filter replacement', status: 'completed', date: '2025-05-15', cost: 180 },
  { id: 'm2', propertyId: 'prop-001', issue: 'Lobby lighting — LED upgrade', status: 'completed', date: '2025-04-22', cost: 450 },
  { id: 'm3', propertyId: 'prop-003', issue: 'Unit 2 — plumbing leak under sink', status: 'in_progress', date: '2025-06-08', cost: 0 },
  { id: 'm4', propertyId: 'prop-001', issue: 'Parking lot — pothole repair', status: 'pending', date: '2025-06-01', cost: 0 },
]

const statusVariant = { pending: 'warning', under_review: 'default', approved: 'success', rejected: 'destructive' }

export function LandlordPropertyManagement() {
  const { properties, rentHistory, pendingSubmissions } = useData()
  const mySubmissions = pendingSubmissions.filter(s => s.landlordId === 'landlord-001')
  const [selectedProp, setSelectedProp] = useState('prop-001')
  const [addMaintModal, setAddMaintModal] = useState(false)
  const [addTenantModal, setAddTenantModal] = useState(false)
  const [maintForm, setMaintForm] = useState({ issue: '', priority: 'medium' })
  const [submitted, setSubmitted] = useState(false)

  const myProps = properties.filter(p => p.landlordId === 'landlord-001')
  const prop = myProps.find(p => p.id === selectedProp)
  const propLogs = maintenanceLogs.filter(m => m.propertyId === selectedProp)
  const propRent = rentHistory.filter(r => r.propertyId === selectedProp).slice(0, 4)

  const handleAddMaint = () => { setSubmitted(true); setTimeout(() => { setSubmitted(false); setAddMaintModal(false); setMaintForm({ issue: '', priority: 'medium' }) }, 1500) }

  return (
    <Layout>
      <Header title="My Properties" subtitle="Phase 2 — Manage listings, tenants and maintenance" />
      <div className="ds-page">
        <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <Badge className="bg-purple-600 text-white">Phase 2</Badge>
          <p className="text-sm text-purple-700">Self-serve property management dashboard — update tenants, log repairs, and view monthly reports.</p>
        </div>

        {/* Submissions awaiting tokenization */}
        {mySubmissions.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock size={16} className="text-amber-500" /> Pending Submissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {mySubmissions.map(sub => (
                <div key={sub.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    sub.status === 'approved' ? 'bg-green-100' : sub.status === 'rejected' ? 'bg-red-100' : 'bg-amber-100'
                  }`}>
                    {sub.status === 'approved' ? <CheckCircle2 size={16} className="text-green-600" />
                      : sub.status === 'rejected' ? <XCircle size={16} className="text-red-600" />
                      : <Clock size={16} className="text-amber-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-gray-900">{sub.propertyName}</p>
                      <Badge variant={statusVariant[sub.status] || 'warning'}>{sub.status.replace('_', ' ')}</Badge>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">{sub.address} · Submitted {sub.submittedDate}</p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {sub.documents.filter(d => d.uploaded).length}/{sub.documents.length} docs · Est. {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(sub.estimatedValue)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Property tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {myProps.map(p => (
            <button key={p.id} onClick={() => setSelectedProp(p.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors flex-shrink-0 ${selectedProp === p.id ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300'}`}>
              <img src={p.image} alt="" className="w-6 h-5 rounded object-cover" />
              {p.name}
            </button>
          ))}
        </div>

        {prop && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Property overview */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardContent className="py-4">
                  <img src={prop.image} alt={prop.name} className="w-full h-36 object-cover rounded-xl mb-3" />
                  <h3 className="font-semibold text-gray-900">{prop.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                    <MapPin size={12} /> {prop.address}
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Expected Rent</p>
                      <p className="font-bold text-green-700">{fmt(prop.monthlyRent)}/mo</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Yield</p>
                      <p className="font-bold text-green-600">{prop.annualYield}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-400">Occupancy</p>
                      <p className="font-bold text-gray-900">{prop.financials.occupancy}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <p className="text-xs text-gray-400">LLC</p>
                      <p className="font-bold text-gray-900 text-xs">{prop.llcName.split(' ').slice(0, 2).join(' ')}</p>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Bricks sold</span>
                      <span>{((prop.totalBricks - prop.availableBricks) / prop.totalBricks * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={(prop.totalBricks - prop.availableBricks) / prop.totalBricks * 100} color="blue" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Recent Rent</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {propRent.map(r => (
                    <div key={r.id} className="px-4 py-3 border-b border-gray-50 last:border-0 flex justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{fmt(r.amount)}</p>
                        <p className="text-xs text-gray-400">{r.date}</p>
                      </div>
                      <Badge variant={r.status === 'distributed' ? 'success' : 'warning'}>{r.status}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Maintenance & Tenants */}
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Maintenance Log</CardTitle>
                    <Button size="sm" onClick={() => setAddMaintModal(true)}><Plus size={14} /> Log Issue</Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {propLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${log.status === 'completed' ? 'bg-green-100' : log.status === 'in_progress' ? 'bg-blue-100' : 'bg-amber-100'}`}>
                        <Wrench size={15} className={log.status === 'completed' ? 'text-green-600' : log.status === 'in_progress' ? 'text-blue-600' : 'text-amber-600'} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{log.issue}</p>
                        <p className="text-xs text-gray-400">{log.date} {log.cost > 0 && `· Cost: ${fmt(log.cost)}`}</p>
                      </div>
                      <Badge variant={log.status === 'completed' ? 'success' : log.status === 'in_progress' ? 'default' : 'warning'}>
                        {log.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                  {propLogs.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No maintenance issues logged</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Tenant Directory</CardTitle>
                    <Button size="sm" variant="outline" onClick={() => setAddTenantModal(true)}><Plus size={14} /> Add Tenant</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { unit: '1A', name: 'Maria Gonzalez', lease: '2024-08-01', end: '2025-07-31', rent: 1500, status: 'current' },
                      { unit: '1B', name: 'James Lee', lease: '2024-03-15', end: '2025-03-14', rent: 1550, status: 'renewal_due' },
                      { unit: '2A', name: 'Priya Sharma', lease: '2025-01-01', end: '2025-12-31', rent: 1600, status: 'current' },
                      { unit: '2B', name: 'Robert Chen', lease: '2024-11-01', end: '2025-10-31', rent: 1575, status: 'current' },
                    ].map(tenant => (
                      <div key={tenant.unit} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <Users size={15} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded font-mono">Unit {tenant.unit}</span>
                            <span className="text-sm font-medium text-gray-900">{tenant.name}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">Lease: {tenant.lease} → {tenant.end} · {fmt(tenant.rent)}/mo</p>
                        </div>
                        <Badge variant={tenant.status === 'current' ? 'success' : 'warning'}>
                          {tenant.status === 'renewal_due' ? 'Renewal Due' : 'Current'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Maintenance Modal */}
      <Modal open={addMaintModal} onClose={() => setAddMaintModal(false)} title="Log Maintenance Issue">
        {submitted ? (
          <div className="text-center py-6">
            <CheckCircle2 size={40} className="text-green-500 mx-auto mb-3" />
            <p className="font-semibold text-gray-900">Issue Logged Successfully</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="ds-label">Issue Description *</label>
              <textarea value={maintForm.issue} onChange={e => setMaintForm(f => ({ ...f, issue: e.target.value }))}
                rows={3} className="ds-textarea resize-none"
                placeholder="Describe the maintenance issue..." />
            </div>
            <div>
              <label className="ds-label">Priority</label>
              <select value={maintForm.priority} onChange={e => setMaintForm(f => ({ ...f, priority: e.target.value }))}
                className="ds-select">
                <option value="low">Low — Non-urgent</option>
                <option value="medium">Medium — Needs attention this week</option>
                <option value="high">High — Urgent / Safety issue</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setAddMaintModal(false)}>Cancel</Button>
              <Button className="flex-1" disabled={!maintForm.issue} onClick={handleAddMaint}>Log Issue</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={addTenantModal} onClose={() => setAddTenantModal(false)} title="Add Tenant">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="ds-label">Tenant Name</label>
              <input className="ds-input" placeholder="Full name" />
            </div>
            <div>
              <label className="ds-label">Unit Number</label>
              <input className="ds-input" placeholder="e.g. 3A" />
            </div>
            <div>
              <label className="ds-label">Lease Start</label>
              <input type="date" className="ds-input" />
            </div>
            <div>
              <label className="ds-label">Monthly Rent ($)</label>
              <input type="number" className="ds-input" placeholder="1500" />
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setAddTenantModal(false)}>Cancel</Button>
            <Button className="flex-1" onClick={() => setAddTenantModal(false)}>Add Tenant</Button>
          </div>
        </div>
      </Modal>
    </Layout>
  )
}
