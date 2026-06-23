import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { taxDocuments } from '@/data/mockData'
import { FileText, Download, AlertCircle, CheckCircle2, Clock } from 'lucide-react'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(n)

export function HolderTaxDocuments() {
  const myDocs = taxDocuments.filter(d => d.investorId === 'investor-001')

  return (
    <Layout>
      <Header title="Tax Documents" subtitle="Phase 2 — Auto-generated annual tax reports" />
      <div className="ds-page-narrow">
        <div className="bg-sky-50 border border-sky-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <Badge variant="default" className="bg-sky-600 text-white">Phase 2</Badge>
          <p className="text-sm text-sky-700">Tax documents are auto-generated at year-end showing all rental income and capital gains from Brick trading.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: '2024 Total Income', value: fmt(myDocs.find(d => d.year === 2024)?.rentIncome || 0) },
            { label: '2024 Capital Gains', value: fmt(myDocs.find(d => d.year === 2024)?.capitalGains || 0) },
            { label: '2024 Platform Fees', value: fmt(myDocs.find(d => d.year === 2024)?.platformFees || 0) },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <p className="text-xs text-gray-400">{s.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Documents list */}
        <Card>
          <CardHeader><CardTitle>Tax Documents</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {myDocs.map(doc => (
              <div key={doc.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${doc.status === 'available' ? 'bg-sky-50' : 'bg-gray-100'}`}>
                  <FileText size={20} className={doc.status === 'available' ? 'text-sky-600' : 'text-gray-400'} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Form {doc.type} — Tax Year {doc.year}</p>
                  <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                    <span>Rental income: <span className="font-medium text-gray-700">{fmt(doc.rentIncome)}</span></span>
                    <span>Capital gains: <span className="font-medium text-gray-700">{fmt(doc.capitalGains)}</span></span>
                    <span>Fees paid: <span className="font-medium text-gray-700">{fmt(doc.platformFees)}</span></span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={doc.status === 'available' ? 'success' : 'warning'}>
                    {doc.status === 'available' ? 'Ready' : 'In Progress'}
                  </Badge>
                  {doc.status === 'available' && (
                    <Button variant="outline" size="sm">
                      <Download size={14} /> Download
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Info */}
        <Card>
          <CardContent className="py-5">
            <h3 className="ds-section-title mb-3">Tax Information</h3>
            <div className="space-y-3">
              {[
                { title: 'Form 1099-DIV', desc: 'Issued for rental income distributions received during the tax year. Available by January 31st of the following year.' },
                { title: 'Capital Gains', desc: 'Gains from selling Bricks on the secondary market. Short-term if held under 1 year, long-term if held over 1 year.' },
                { title: 'Deductible Fees', desc: 'Platform fees may be deductible as investment expenses. Consult your tax advisor for guidance.' },
              ].map(item => (
                <div key={item.title} className="flex gap-3">
                  <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="ds-alert-warning flex items-start gap-3">
          <AlertCircle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs">This document is provided for informational purposes only and does not constitute tax advice. Please consult a qualified tax professional for guidance specific to your situation.</p>
        </div>
      </div>
    </Layout>
  )
}
