import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useData } from '@/context/DataContext'
import { ClipboardList, CheckCircle2, XCircle, Clock, FileText, User, Building2, AlertCircle, ArrowRight, Cpu } from 'lucide-react'
import { Link } from 'react-router-dom'

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

export function AdminApprovals() {
  const { pendingSubmissions: submissions, kycRequests: kyc, updateSubmission, updateKyc } = useData()
  const [detail, setDetail] = useState(null)
  const [tab, setTab] = useState('properties')
  const [actionDone, setActionDone] = useState({})

  const handleAction = (id, action, type = 'sub') => {
    setActionDone(a => ({ ...a, [id]: action }))
    if (type === 'sub') {
      updateSubmission(id, { status: action === 'approve' ? 'approved' : 'rejected' })
    } else {
      updateKyc(id, { status: action === 'approve' ? 'approved' : 'rejected' })
    }
    setDetail(null)
  }

  const pendingCount = submissions.filter(s => s.status === 'pending' || s.status === 'under_review').length
  const kycPendingCount = kyc.filter(k => k.status === 'pending' || k.status === 'under_review').length
  const approvedCount = submissions.filter(s => s.status === 'approved').length

  return (
    <Layout>
      <Header title="Approvals" subtitle="Review and approve property submissions and identity verifications" />
      <div className="ds-page">
        {approvedCount > 0 && (
          <div className="ds-alert-success border border-green-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <Cpu size={16} className="text-green-600 flex-shrink-0" />
            <p className="text-sm flex-1">
              <span className="font-semibold">{approvedCount} {approvedCount === 1 ? 'property' : 'properties'} approved</span> and ready to tokenize — next step is the Brick Maker.
            </p>
            <Link to="/admin/tokenization">
              <Button size="sm" className="flex-shrink-0 bg-green-600 hover:bg-green-700 text-white">
                Go to Brick Maker <ArrowRight size={13} />
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
            <p className="text-sm text-muted-foreground mt-0.5">Property Submissions Pending</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-blue-600">{kycPendingCount}</p>
            <p className="text-sm text-muted-foreground mt-0.5">KYC/KYB Reviews Pending</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-green-600">{submissions.filter(s => s.status === 'approved').length + kyc.filter(k => k.status === 'approved').length}</p>
            <p className="text-sm text-muted-foreground mt-0.5">Approved Today</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {[
            { key: 'properties', label: `Properties (${pendingCount})` },
            { key: 'kyc', label: `KYC/KYB (${kycPendingCount})` },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.key ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'properties' && (
          <Card>
            <CardHeader><CardTitle>Property Submission Queue</CardTitle></CardHeader>
            <CardContent className="p-0">
              {submissions.map(sub => (
                <div key={sub.id} className="flex flex-wrap items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    sub.status === 'approved' ? 'bg-green-100' : sub.status === 'rejected' ? 'bg-red-100' : sub.status === 'under_review' ? 'bg-blue-100' : 'bg-amber-100'
                  }`}>
                    {sub.status === 'approved' ? <CheckCircle2 size={18} className="text-green-600" />
                      : sub.status === 'rejected' ? <XCircle size={18} className="text-red-600" />
                      : <Clock size={18} className="text-amber-600" />}
                  </div>
                  <div className="flex-1 min-w-48">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{sub.propertyName}</p>
                      <Badge variant={sub.status === 'approved' ? 'success' : sub.status === 'rejected' ? 'destructive' : sub.status === 'under_review' ? 'default' : 'warning'}>
                        {sub.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-400">{sub.address}</p>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                      <span>By: <span className="font-medium text-gray-700">{sub.landlordName}</span></span>
                      <span>Value: <span className="font-medium text-gray-700">{fmt(sub.estimatedValue)}</span></span>
                      <span>Submitted: {sub.submittedDate}</span>
                      <span>Docs: {sub.documents.filter(d => d.uploaded).length}/{sub.documents.length}</span>
                    </div>
                    {sub.notes && <p className="text-xs text-amber-600 mt-1">📋 {sub.notes}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => {
                      if (sub.status === 'pending') updateSubmission(sub.id, { status: 'under_review' })
                      setDetail(sub)
                    }}>
                      <FileText size={13} /> Review
                    </Button>
                    {(sub.status === 'pending' || sub.status === 'under_review') && (
                      <>
                        <Button size="sm" variant="success" onClick={() => handleAction(sub.id, 'approve')}>
                          <CheckCircle2 size={13} /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleAction(sub.id, 'reject')}>
                          <XCircle size={13} /> Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {tab === 'kyc' && (
          <Card>
            <CardHeader><CardTitle>Identity Verification Queue</CardTitle></CardHeader>
            <CardContent className="p-0">
              {kyc.map(req => (
                <div key={req.id} className="flex flex-wrap items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    req.status === 'approved' ? 'bg-green-100' : req.status === 'rejected' ? 'bg-red-100' : 'bg-amber-100'
                  }`}>
                    {req.type === 'KYC' ? <User size={16} className="text-gray-600" /> : <Building2 size={16} className="text-gray-600" />}
                  </div>
                  <div className="flex-1 min-w-48">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900">{req.name}</p>
                      <Badge variant="secondary" className="text-xs">{req.type}</Badge>
                      <Badge variant={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'destructive' : req.status === 'under_review' ? 'default' : 'warning'}>
                        {req.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                      <span>Submitted: {req.submittedDate}</span>
                      <span>Documents: {req.documents.join(', ')}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {(req.status === 'pending' || req.status === 'under_review') && (
                      <>
                        <Button size="sm" variant="success" onClick={() => handleAction(req.id, 'approve', 'kyc')}>
                          <CheckCircle2 size={13} /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleAction(req.id, 'reject', 'kyc')}>
                          <XCircle size={13} /> Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Detail Modal */}
      <Modal open={!!detail} onClose={() => setDetail(null)} title={`Review: ${detail?.propertyName}`} size="md">
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-400">Address</p><p className="font-medium">{detail.address}</p></div>
              <div><p className="text-xs text-gray-400">Type</p><p className="font-medium">{detail.type}</p></div>
              <div><p className="text-xs text-gray-400">Est. Value</p><p className="font-medium">{fmt(detail.estimatedValue)}</p></div>
              <div><p className="text-xs text-gray-400">Landlord</p><p className="font-medium">{detail.landlordName}</p></div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Documents</p>
              {detail.documents.map(doc => (
                <div key={doc.name} className={`flex items-center gap-2 py-2 border-b border-gray-50 ${doc.uploaded ? '' : 'opacity-50'}`}>
                  {doc.uploaded ? <CheckCircle2 size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-red-400" />}
                  <span className="text-sm text-gray-700">{doc.name}</span>
                  <Badge variant={doc.uploaded ? 'success' : 'destructive'} className="ml-auto text-xs">{doc.uploaded ? 'Uploaded' : 'Missing'}</Badge>
                </div>
              ))}
            </div>
            {detail.notes && <div className="ds-alert-warning rounded-xl p-3 text-xs">{detail.notes}</div>}
            {(detail.status === 'pending' || detail.status === 'under_review') ? (
              <div className="flex gap-3 pt-2">
                <Button variant="destructive" className="flex-1" onClick={() => handleAction(detail.id, 'reject')}>Reject</Button>
                <Button variant="success" className="flex-1" onClick={() => handleAction(detail.id, 'approve')}>Approve & Proceed</Button>
              </div>
            ) : (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${detail.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {detail.status === 'approved' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                This submission has been <span className="font-bold ml-1">{detail.status}</span>.
              </div>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  )
}
