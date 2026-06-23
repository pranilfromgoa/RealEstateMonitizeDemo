import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { useData } from '@/context/DataContext'
import { CheckCircle2, XCircle, Clock, User, Building2, AlertCircle, ShieldCheck } from 'lucide-react'

export function AdminApprovals() {
  const { kycRequests: kyc, updateKyc, updateInvestor } = useData()
  const [detail, setDetail] = useState(null)
  const [rejectComment, setRejectComment] = useState('')
  const [rejectError,   setRejectError]   = useState('')

  const pendingCount  = kyc.filter(k => k.status === 'pending').length
  const approvedCount = kyc.filter(k => k.status === 'approved').length
  const rejectedCount = kyc.filter(k => k.status === 'rejected').length

  const today = new Date().toISOString().split('T')[0]

  const handleApprove = (id) => {
    const req = kyc.find(k => k.id === id)
    updateKyc(id, { status: 'approved' })
    if (req?.applicantId) updateInvestor(req.applicantId, { kycStatus: 'verified', kycDate: today })
    setDetail(null)
  }

  const handleReject = (id) => {
    if (!rejectComment.trim()) {
      setRejectError('Rejection reason is required.')
      return
    }
    const req = kyc.find(k => k.id === id)
    updateKyc(id, { status: 'rejected', rejectionReason: rejectComment.trim() })
    if (req?.applicantId) updateInvestor(req.applicantId, { kycStatus: 'rejected' })
    setRejectComment('')
    setRejectError('')
    setDetail(null)
  }

  const openDetail = (req) => {
    setRejectComment('')
    setRejectError('')
    setDetail(req)
  }

  return (
    <Layout>
      <Header title="KYC Verification" subtitle="Review and approve investor identity verification requests" />
      <div className="ds-page">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
            <p className="text-sm text-muted-foreground mt-0.5">Pending Review</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
            <p className="text-sm text-muted-foreground mt-0.5">Approved</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-2xl font-bold text-red-500">{rejectedCount}</p>
            <p className="text-sm text-muted-foreground mt-0.5">Rejected</p>
          </div>
        </div>

        {/* Queue */}
        <Card>
          <CardHeader><CardTitle>Identity Verification Queue</CardTitle></CardHeader>
          <CardContent className="p-0">
            {kyc.length === 0 && (
              <p className="text-sm text-gray-400 px-6 py-8 text-center">No verification requests.</p>
            )}
            {kyc.map(req => (
              <div key={req.id} className="flex flex-wrap items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0">
                {/* Icon */}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  req.status === 'approved' ? 'bg-green-100' :
                  req.status === 'rejected' ? 'bg-red-100'   : 'bg-amber-100'
                }`}>
                  {req.status === 'approved' ? <CheckCircle2 size={18} className="text-green-600" /> :
                   req.status === 'rejected' ? <XCircle      size={18} className="text-red-600"   /> :
                   req.type === 'KYC'        ? <User         size={18} className="text-amber-600" /> :
                                               <Building2    size={18} className="text-amber-600" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-48">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-gray-900">{req.name}</p>
                    <Badge variant="secondary" className="text-xs">{req.type}</Badge>
                    <Badge variant={
                      req.status === 'approved' ? 'success' :
                      req.status === 'rejected' ? 'destructive' : 'warning'
                    }>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-4 mt-1 text-xs text-gray-500">
                    <span>Submitted: {req.submittedDate}</span>
                    <span>Documents: {req.documents.join(', ')}</span>
                  </div>
                  {req.rejectionReason && (
                    <p className="text-xs text-red-500 mt-1">Reason: {req.rejectionReason}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openDetail(req)}>
                    <ShieldCheck size={13} /> Review
                  </Button>
                  {req.status === 'pending' && (
                    <>
                      <Button size="sm" variant="success" onClick={() => handleApprove(req.id)}>
                        <CheckCircle2 size={13} /> Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => openDetail(req)}>
                        <XCircle size={13} /> Reject
                      </Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Detail / Action Modal */}
      <Modal
        open={!!detail}
        onClose={() => setDetail(null)}
        title={`${detail?.type} Review — ${detail?.name}`}
        size="md"
      >
        {detail && (
          <div className="space-y-4">
            {/* Info */}
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-xs text-gray-400">Type</p><p className="font-medium">{detail.type}</p></div>
              <div><p className="text-xs text-gray-400">Status</p>
                <Badge variant={detail.status === 'approved' ? 'success' : detail.status === 'rejected' ? 'destructive' : 'warning'} className="text-xs">
                  {detail.status.charAt(0).toUpperCase() + detail.status.slice(1)}
                </Badge>
              </div>
              <div><p className="text-xs text-gray-400">Submitted</p><p className="font-medium">{detail.submittedDate}</p></div>
              <div className="col-span-2"><p className="text-xs text-gray-400 mb-1">Documents Submitted</p>
                <div className="flex flex-wrap gap-2">
                  {detail.documents.map(doc => (
                    <span key={doc} className="flex items-center gap-1 bg-sky-50 text-sky-700 text-xs px-2 py-1 rounded-lg">
                      <CheckCircle2 size={11} /> {doc.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Already decided */}
            {detail.status !== 'pending' && (
              <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
                detail.status === 'approved' ? 'bg-sky-50 text-sky-700' : 'bg-gray-50 border-l-4 border-red-400 text-gray-700'
              }`} style={detail.status !== 'approved' ? {borderRadius: '0 0.75rem 0.75rem 0'} : {}}>
                {detail.status === 'approved' ? <CheckCircle2 size={16} /> : <XCircle size={16} className="text-red-400" />}
                This request has been <span className="font-bold ml-1">{detail.status}</span>.
                {detail.rejectionReason && <span className="ml-1 font-normal">— {detail.rejectionReason}</span>}
              </div>
            )}

            {/* Pending: reject reason + actions */}
            {detail.status === 'pending' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                    Rejection Reason <span className="text-red-500">*</span>
                    <span className="text-gray-400 font-normal ml-1">(required only when rejecting)</span>
                  </label>
                  <textarea
                    value={rejectComment}
                    onChange={e => { setRejectComment(e.target.value); if (rejectError) setRejectError('') }}
                    rows={3}
                    placeholder="e.g. Document quality too low — please resubmit a clearer scan of the passport."
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                  />
                  {rejectError && <p className="text-xs text-red-500 mt-1">{rejectError}</p>}
                </div>
                <div className="flex gap-3 pt-1">
                  <Button variant="destructive" className="flex-1" onClick={() => handleReject(detail.id)}>
                    <XCircle size={14} /> Reject
                  </Button>
                  <Button className="flex-1" onClick={() => handleApprove(detail.id)}>
                    <CheckCircle2 size={14} /> Approve
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  )
}
