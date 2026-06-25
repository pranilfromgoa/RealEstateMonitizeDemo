import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Clock, Upload, ShieldCheck, AlertCircle, FileText, User, Home, CreditCard } from 'lucide-react'

const steps = [
  { id: 1, label: 'Personal Information', icon: User, status: 'completed' },
  { id: 2, label: 'Identity Document', icon: CreditCard, status: 'completed' },
  { id: 3, label: 'Proof of Address', icon: Home, status: 'completed' },
  { id: 4, label: 'Verification Review', icon: ShieldCheck, status: 'completed' },
]

export function HolderKYC() {
  const [showResubmit, setShowResubmit] = useState(false)
  const isVerified = true

  return (
    <Layout>
      <Header title="KYC Verification" subtitle="Identity verification for regulated platform access" />
      <div className="ds-page-narrow">
        {/* Status Banner */}
        <div className={`flex items-start gap-4 ${isVerified ? 'ds-alert-success' : 'ds-alert-warning'}`}>
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isVerified ? 'bg-green-100' : 'bg-yellow-100'}`}>
            {isVerified
              ? <CheckCircle2 size={24} className="text-green-600" />
              : <Clock size={24} className="text-yellow-600" />
            }
          </div>
          <div>
            <h2 className={`font-bold text-lg ${isVerified ? 'text-green-800' : 'text-yellow-800'}`}>
              {isVerified ? 'Identity Verified' : 'Verification Pending'}
            </h2>
            <p className={`text-sm mt-1 ${isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
              {isVerified
                ? 'Your identity has been verified. You have full access to buy and sell Bricks.'
                : 'Your documents are under review. This typically takes 1-2 business days.'}
            </p>
            {isVerified && (
              <div className="mt-2 flex flex-wrap gap-2">
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Verified Feb 10, 2024</span>
                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Valid until Feb 10, 2026</span>
              </div>
            )}
          </div>
        </div>

        {/* Steps */}
        <Card>
          <CardContent className="py-6">
            <h3 className="ds-section-title mb-5">Verification Steps</h3>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    step.status === 'completed' ? 'bg-green-100' : step.status === 'active' ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    {step.status === 'completed'
                      ? <CheckCircle2 size={20} className="text-green-600" />
                      : <step.icon size={20} className={step.status === 'active' ? 'text-blue-600' : 'text-gray-400'} />
                    }
                  </div>
                  <div className="flex-1">
                    <p className={`font-medium text-sm ${step.status === 'completed' ? 'text-gray-900' : 'text-gray-600'}`}>{step.label}</p>
                    {step.status === 'completed' && <p className="text-xs text-green-600">Completed</p>}
                  </div>
                  <Badge variant={step.status === 'completed' ? 'success' : 'secondary'}>
                    {step.status === 'completed' ? 'Done' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* What KYC Enables */}
        <Card>
          <CardContent className="py-5">
            <h3 className="ds-section-title mb-4">What KYC Unlocks</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { icon: CheckCircle2, text: 'Buy and sell Bricks (up to $50,000/year)' },
                { icon: CheckCircle2, text: 'Receive rent distributions directly to wallet' },
                { icon: CheckCircle2, text: 'Access to secondary market trading' },
                { icon: CheckCircle2, text: 'Vote on property decisions' },
                { icon: CheckCircle2, text: 'Download annual tax documents' },
                { icon: CheckCircle2, text: 'Enhanced account limits' },
              ].map(item => (
                <div key={item.text} className="flex items-start gap-2">
                  <item.icon size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-muted-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submitted Documents */}
        <Card>
          <CardContent className="py-5">
            <h3 className="ds-section-title mb-4">Submitted Documents</h3>
            <div className="space-y-3">
              {[
                { name: 'Passport (ID Page)', type: 'Primary ID', uploaded: '2024-02-08' },
                { name: 'Utility Bill — Electric', type: 'Proof of Address', uploaded: '2024-02-08' },
                { name: 'Selfie with ID', type: 'Liveness Check', uploaded: '2024-02-08' },
              ].map(doc => (
                <div key={doc.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText size={16} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                    <p className="text-xs text-gray-600">{doc.type} · Uploaded {doc.uploaded}</p>
                  </div>
                  <Badge variant="success">Verified</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Legal */}
        <div className="ds-inset flex items-start gap-3">
          <AlertCircle size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Identity verification is required under financial regulations (AML/KYC). Your documents are encrypted and stored securely. Personal information is never stored on the blockchain. Verification expires after 2 years and must be renewed.
          </p>
        </div>
      </div>
    </Layout>
  )
}
