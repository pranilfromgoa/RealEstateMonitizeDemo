import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { landlords } from '@/data/mockData'
import { useData } from '@/context/DataContext'
import { Building2, DollarSign, TrendingUp, Users, ArrowUpRight, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const statusVariant = { pending: 'warning', under_review: 'default', approved: 'success', rejected: 'destructive' }

export function LandlordDashboard() {
  const { properties, rentHistory, pendingSubmissions } = useData()
  const landlord = landlords.find(l => l.id === 'landlord-001')
  const mySubmissions = pendingSubmissions.filter(s => s.landlordId === 'landlord-001')
  const myProps = properties.filter(p => p.landlordId === 'landlord-001')
  const totalValue = myProps.reduce((s, p) => s + p.totalValue, 0)
  const totalMonthlyRent = myProps.reduce((s, p) => s + p.monthlyRent, 0)
  const totalBricksSold = myProps.reduce((s, p) => s + (p.totalBricks - p.availableBricks), 0)

  const recentRent = rentHistory.filter(r => myProps.some(p => p.id === r.propertyId)).slice(0, 5)

  return (
    <Layout>
      <Header title="Landlord Dashboard" subtitle={`Welcome, ${landlord?.name}`} />
      <div className="ds-page">
        {/* KYB notice */}
        <div className="ds-alert-success border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <CheckCircle2 size={18} className="text-green-600" />
          <p className="text-sm">Your business is verified (KYB). You can list properties and receive rent distributions.</p>
          <Badge variant="success" className="ml-auto">Verified</Badge>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="My Properties" value={myProps.length} icon={Building2} color="blue" />
          <StatCard label="Total Portfolio Value" value={fmt(totalValue)} icon={DollarSign} color="green" />
          <StatCard label="Monthly Rent Income" value={fmt(totalMonthlyRent)} icon={TrendingUp} color="amber" />
          <StatCard label="Bricks Sold" value={totalBricksSold.toLocaleString()} icon={Users} sub="across all properties" color="purple" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* My properties */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Listed Properties</CardTitle>
                  <Link to="/landlord/properties">
                    <Button variant="outline" size="sm">Manage All <ArrowUpRight size={14} /></Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {myProps.map(prop => {
                  const soldPct = ((prop.totalBricks - prop.availableBricks) / prop.totalBricks * 100)
                  return (
                    <div key={prop.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                      <img src={prop.image} alt={prop.name} className="w-16 h-12 rounded-lg object-cover flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-900 truncate">{prop.name}</p>
                          <Badge variant="success">{prop.annualYield}% yield</Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{prop.city} · {prop.type}</p>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{soldPct.toFixed(0)}% of Bricks sold</span>
                            <span>{fmt(prop.monthlyRent)}/mo expected rent</span>
                          </div>
                          <Progress value={soldPct} color="green" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Submissions in review */}
          {mySubmissions.length > 0 && (
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Submissions in Review</CardTitle>
                    <Link to="/landlord/upload">
                      <Button variant="outline" size="sm">+ Submit New</Button>
                    </Link>
                  </div>
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
                          <p className="font-semibold text-gray-900 truncate">{sub.propertyName}</p>
                          <Badge variant={statusVariant[sub.status] || 'warning'}>{sub.status.replace('_', ' ')}</Badge>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">{sub.address} · Submitted {sub.submittedDate}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Est. value: {fmt(sub.estimatedValue)} · {sub.proposal?.suggestedBrickCount?.toLocaleString() || '—'} Bricks proposed</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Rent history */}
          <div>
            <Card>
              <CardHeader><CardTitle>Recent Rent Distributions</CardTitle></CardHeader>
              <CardContent className="p-0">
                {recentRent.map(rent => {
                  const prop = myProps.find(p => p.id === rent.propertyId)
                  return (
                    <div key={rent.id} className="px-4 py-3 border-b border-gray-50 last:border-0">
                      <div className="flex justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-32">{prop?.name}</p>
                        <Badge variant={rent.status === 'distributed' ? 'success' : 'warning'}>
                          {rent.status}
                        </Badge>
                      </div>
                      <div className="flex justify-between mt-1">
                        <p className="text-xs text-gray-400">{rent.date}</p>
                        <p className="text-sm font-semibold text-green-600">{fmt(rent.amount)}</p>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  )
}
