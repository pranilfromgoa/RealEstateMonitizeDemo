import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, Upload, ShieldCheck, Building2, FileText, AlertCircle } from 'lucide-react'

export function LandlordKYB() {
  const isVerified = true

  const docs = [
    { name: 'Articles of Incorporation', status: 'verified', date: '2024-01-12' },
    { name: 'EIN/Tax ID Letter', status: 'verified', date: '2024-01-12' },
    { name: 'Business Bank Statement', status: 'verified', date: '2024-01-15' },
    { name: 'Operating Agreement', status: 'verified', date: '2024-01-14' },
    { name: 'Beneficial Ownership Form', status: 'verified', date: '2024-01-15' },
  ]

  return (
    <Layout>
      <Header title="Business Verification (KYB)" subtitle="Phase 2 — Verify your business entity to list properties" />
      <div className="ds-page max-w-3xl">
        <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <Badge className="bg-purple-600 text-white">Phase 2</Badge>
          <p className="text-sm text-purple-700">Business verification (KYB) allows self-serve property listing and higher transaction limits.</p>
        </div>

        {/* Status */}
        <div className={`rounded-2xl p-5 flex items-start gap-4 ${isVerified ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isVerified ? 'bg-green-100' : 'bg-yellow-100'}`}>
            {isVerified ? <CheckCircle2 size={24} className="text-green-600" /> : <Clock size={24} className="text-yellow-600" />}
          </div>
          <div>
            <h2 className={`font-bold text-lg ${isVerified ? 'text-green-800' : 'text-yellow-800'}`}>
              {isVerified ? 'Business Verified' : 'Verification Pending'}
            </h2>
            <p className={`text-sm mt-1 ${isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
              {isVerified
                ? 'Chen Property Group LLC is verified. You can self-serve property listings.'
                : 'Your business documents are under review. Typically takes 3-5 business days.'}
            </p>
            {isVerified && (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Verified Jan 16, 2024</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Chen Property Group LLC</span>
              </div>
            )}
          </div>
        </div>

        {/* Company info */}
        <Card>
          <CardContent className="py-5">
            <h3 className="ds-section-title mb-4 flex items-center gap-2">
              <Building2 size={16} className="text-blue-600" /> Business Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { l: 'Business Name', v: 'Chen Property Group LLC' },
                { l: 'Entity Type', v: 'Limited Liability Company' },
                { l: 'State of Formation', v: 'California' },
                { l: 'EIN / Tax ID', v: '**-***5432' },
                { l: 'Formation Date', v: '2018-06-15' },
                { l: 'Primary Owner', v: 'Sarah Chen (100%)' },
              ].map(row => (
                <div key={row.l}>
                  <p className="text-xs text-gray-400">{row.l}</p>
                  <p className="font-medium text-gray-900 mt-0.5">{row.v}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card>
          <CardContent className="py-5">
            <h3 className="ds-section-title mb-4 flex items-center gap-2">
              <FileText size={16} className="text-blue-600" /> Verified Documents
            </h3>
            <div className="space-y-3">
              {docs.map(doc => (
                <div key={doc.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 size={16} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-400">Uploaded {doc.date}</p>
                  </div>
                  <Badge variant="success">Verified</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* KYB Benefits */}
        <Card>
          <CardContent className="py-5">
            <h3 className="ds-section-title mb-4">What KYB Unlocks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                'Self-serve property listing (no manual submission)',
                'Receive rent distributions directly to business account',
                'Access to the landlord dashboard & analytics',
                'Multiple property listings simultaneously',
                'Priority review queue for new submissions',
                'Dedicated account manager support',
              ].map(item => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2 size={14} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="ds-inset flex items-start gap-3">
          <AlertCircle size={15} className="text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-gray-500 leading-relaxed">
            Business verification is required under FinCEN regulations. Your business documents are encrypted and stored securely. We verify beneficial ownership for anti-money laundering compliance.
          </p>
        </div>
      </div>
    </Layout>
  )
}
