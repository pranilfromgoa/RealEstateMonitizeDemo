import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { StatCard } from '@/components/ui/stat-card'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { platformStats, properties, rentHistory, pendingSubmissions, kycRequests } from '@/data/mockData'
import { Building2, DollarSign, Users, TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export function AdminDashboard() {
  const pendingPayouts = rentHistory.filter(r => r.status === 'pending')
  const recentRent = rentHistory.filter(r => r.status === 'distributed').slice(0, 5)

  return (
    <Layout>
      <Header title="Admin Dashboard" subtitle="Platform overview and operations" />
      <div className="ds-page">
        {/* Alerts */}
        {(platformStats.pendingApprovals > 0 || pendingPayouts.length > 0) && (
          <div className="space-y-2">
            {platformStats.pendingApprovals > 0 && (
              <div className="ds-alert-warning border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <AlertCircle size={16} className="text-amber-600" />
                <p className="text-sm">{platformStats.pendingApprovals} property submissions pending review</p>
                <Link to="/admin/approvals"><Button size="sm" variant="outline" className="ml-auto border-amber-300 text-amber-700 hover:bg-amber-100">Review <ArrowRight size={13} /></Button></Link>
              </div>
            )}
            {pendingPayouts.length > 0 && (
              <div className="ds-alert-info border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-3">
                <AlertCircle size={16} className="text-blue-600" />
                <p className="text-sm">{pendingPayouts.length} rent payout pending processing</p>
                <Link to="/admin/payouts"><Button size="sm" variant="outline" className="ml-auto border-blue-300 text-blue-700 hover:bg-blue-100">Process <ArrowRight size={13} /></Button></Link>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Value Locked" value={`$${(platformStats.totalValueLocked / 1000000).toFixed(1)}M`} icon={DollarSign} color="green" trend={15} />
          <StatCard label="Active Investors" value={platformStats.totalInvestors.toLocaleString()} icon={Users} color="blue" trend={22} />
          <StatCard label="Properties Listed" value={platformStats.totalPropertiesListed} icon={Building2} color="purple" />
          <StatCard label="Platform Fees Earned" value={fmt(platformStats.platformFeeEarned)} icon={TrendingUp} color="amber" trend={11} />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Rent Distributed (Total)" value={`$${(platformStats.totalRentDistributed / 1000000).toFixed(2)}M`} icon={DollarSign} color="green" />
          <StatCard label="Bricks Issued" value={platformStats.totalBricksIssued.toLocaleString()} icon={Building2} color="blue" />
          <StatCard label="Bricks Sold" value={platformStats.totalBricksSold.toLocaleString()} icon={TrendingUp} color="purple" sub={`${(platformStats.totalBricksSold / platformStats.totalBricksIssued * 100).toFixed(0)}% of total`} />
          <StatCard label="Active Landlords" value={platformStats.totalLandlords} icon={Users} color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Properties overview */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Properties</CardTitle>
                <Link to="/admin/tokenization"><Button variant="outline" size="sm">+ Tokenize New</Button></Link>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {properties.map(prop => (
                <div key={prop.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                  <img src={prop.image} alt="" className="w-12 h-9 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{prop.name}</p>
                    <p className="text-xs text-gray-400">{prop.city} · {fmt(prop.totalValue)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-500">{((prop.totalBricks - prop.availableBricks) / prop.totalBricks * 100).toFixed(0)}% sold</p>
                    <Badge variant="success" className="text-xs">{prop.annualYield}%</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent activity */}
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Pending Actions</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {pendingSubmissions.slice(0, 2).map(sub => (
                  <div key={sub.id} className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                    <Clock size={15} className="text-amber-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{sub.propertyName}</p>
                      <p className="text-xs text-gray-500">Submitted by {sub.landlordName} · {sub.submittedDate}</p>
                    </div>
                    <Badge variant="warning">Review</Badge>
                  </div>
                ))}
                {pendingPayouts.map(p => (
                  <div key={p.id} className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl">
                    <DollarSign size={15} className="text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Payout Pending: {properties.find(pr => pr.id === p.propertyId)?.name}</p>
                      <p className="text-xs text-gray-500">{fmt(p.amount)} · Due {p.date}</p>
                    </div>
                    <Badge variant="default">Process</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Recent Rent Distributions</CardTitle></CardHeader>
              <CardContent className="p-0">
                {recentRent.slice(0, 4).map(rent => {
                  const prop = properties.find(p => p.id === rent.propertyId)
                  return (
                    <div key={rent.id} className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0">
                      <CheckCircle2 size={14} className="text-green-500 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{prop?.name}</p>
                        <p className="text-xs text-gray-400">{rent.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-green-600">{fmt(rent.amount)}</p>
                        <p className="text-xs text-gray-400">fee: {fmt(rent.fee || 0)}</p>
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
