import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { investors, landlords } from '@/data/mockData'
import { StatCard } from '@/components/ui/stat-card'
import { Users, ShieldCheck, Building2, TrendingUp } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export function AdminUsers() {
  return (
    <Layout>
      <Header title="Users" subtitle="Manage investors and landlords on the platform" />
      <div className="ds-page">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Investors" value="1,247" icon={Users} color="blue" trend={22} />
          <StatCard label="KYC Verified" value="1,089" sub="87.3% of investors" icon={ShieldCheck} color="green" />
          <StatCard label="Total Landlords" value="38" icon={Building2} color="amber" />
          <StatCard label="KYB Verified" value="31" sub="81.6% of landlords" icon={ShieldCheck} color="purple" />
        </div>

        <Card>
          <CardHeader><CardTitle>Investors</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Name', 'Email', 'KYC', 'Bricks', 'Total Invested', 'Earned', 'Joined'].map(h => (
                    <th key={h} className="text-left text-xs text-gray-500 font-medium px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {investors.map(inv => (
                  <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                          {inv.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-gray-900">{inv.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500">{inv.email}</td>
                    <td className="px-5 py-3">
                      <Badge variant={inv.kycStatus === 'verified' ? 'success' : 'warning'}>{inv.kycStatus}</Badge>
                    </td>
                    <td className="px-5 py-3 font-medium text-gray-900">{inv.totalBricks}</td>
                    <td className="px-5 py-3 text-gray-700">{fmt(inv.totalInvested)}</td>
                    <td className="px-5 py-3 text-green-600 font-medium">{fmt(inv.totalEarned)}</td>
                    <td className="px-5 py-3 text-gray-400">{inv.joinDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Landlords</CardTitle></CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Name', 'Company', 'Email', 'KYB', 'Properties', 'Joined'].map(h => (
                    <th key={h} className="text-left text-xs text-gray-500 font-medium px-5 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {landlords.map(l => (
                  <tr key={l.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">
                          {l.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-gray-900">{l.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">{l.company}</td>
                    <td className="px-5 py-3 text-gray-500">{l.email}</td>
                    <td className="px-5 py-3">
                      <Badge variant={l.kybStatus === 'verified' ? 'success' : 'warning'}>{l.kybStatus}</Badge>
                    </td>
                    <td className="px-5 py-3 text-gray-700">{l.properties.length}</td>
                    <td className="px-5 py-3 text-gray-400">{l.joinDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}
