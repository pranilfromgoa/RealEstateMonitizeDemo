import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Upload, CheckCircle2, FileText, AlertCircle, Building2, Info, Layers } from 'lucide-react'
import { useData } from '@/context/DataContext'
import { useAuth } from '@/context/AuthContext'

const docRequirements = [
  { id: 'deed', label: 'Property Deed', required: true, desc: 'Official ownership document' },
  { id: 'llc', label: 'LLC Certificate', required: true, desc: 'Articles of incorporation / certificate of formation' },
  { id: 'appraisal', label: 'Appraisal Report', required: true, desc: 'Licensed third-party appraisal (within 12 months)' },
  { id: 'insurance', label: 'Insurance Policy', required: true, desc: 'Current property insurance certificate' },
  { id: 'tax', label: 'Property Tax Records', required: false, desc: 'Last 2 years of tax bills' },
  { id: 'rent_roll', label: 'Rent Roll', required: false, desc: 'Current tenant & lease summary' },
]

const PRICE_OPTIONS = [50, 100, 250, 500]
const EQUITY_OPTIONS = [25, 50, 75, 100]

const fmt = (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)

const emptyForm = {
  name: '', address: '', city: '', state: '',
  type: 'Multi-Family', estimatedValue: '', description: '',
  monthlyRent: '',
  tokenizePercent: '100', pricePerBrick: '100', landlordNotes: '',
}

export function LandlordPropertyUpload() {
  const { addSubmission } = useData()
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState(emptyForm)
  const [uploaded, setUploaded] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [refId] = useState(() => Math.random().toString(36).slice(2, 8).toUpperCase())

  const handleFileSimulate = (docId) => {
    setUploaded(u => ({ ...u, [docId]: true }))
  }

  const requiredUploaded = docRequirements.filter(d => d.required).every(d => uploaded[d.id])

  const estValue = parseFloat(form.estimatedValue) || 0
  const pct = parseFloat(form.tokenizePercent) || 0
  const ppb = parseFloat(form.pricePerBrick) || 0
  const tokenizableValue = estValue * (pct / 100)
  const estimatedBricks = ppb > 0 ? Math.round(tokenizableValue / ppb) : 0
  const desiredRaise = estimatedBricks * ppb

  const handleSubmit = () => {
    addSubmission({
      id: `sub-${Date.now()}`,
      propertyName: form.name,
      address: `${form.address}, ${form.city}, ${form.state}`,
      city: form.city,
      type: form.type,
      estimatedValue: parseFloat(form.estimatedValue) || 0,
      landlordId: user?.id || 'landlord-001',
      landlordName: user?.name || 'Landlord',
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'pending',
      documents: docRequirements.map(d => ({ name: d.label, uploaded: !!uploaded[d.id] })),
      proposal: {
        tokenizePercent: parseInt(form.tokenizePercent),
        suggestedPricePerBrick: parseInt(form.pricePerBrick),
        suggestedBrickCount: estimatedBricks,
        desiredRaise: desiredRaise,
        monthlyRent: parseFloat(form.monthlyRent) || 0,
        notes: form.landlordNotes,
      },
      notes: form.landlordNotes,
      llcName: '',
    })
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <Layout>
        <Header title="List a Property" subtitle="Submit your property for tokenization review" />
        <div className="p-6 max-w-xl">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={36} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Submission Received!</h2>
            <p className="text-gray-500 mt-3 text-sm leading-relaxed">
              Your property <strong>{form.name}</strong> has been submitted for review. Our team will contact you within 2-3 business days. You can track the status in your dashboard.
            </p>
            <div className="mt-6 bg-gray-50 rounded-xl p-4 text-left space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Property:</span><span className="font-medium">{form.name}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Equity to Tokenize:</span><span className="font-medium">{form.tokenizePercent}%</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Proposed Price/Brick:</span><span className="font-medium">${form.pricePerBrick}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Expected Rent:</span><span className="font-medium">{form.monthlyRent ? `$${parseInt(form.monthlyRent).toLocaleString()}/mo` : '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Est. Bricks:</span><span className="font-medium">{estimatedBricks.toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Documents:</span><span className="font-medium">{Object.keys(uploaded).length} uploaded</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Status:</span><Badge variant="warning">Pending Review</Badge></div>
              <div className="flex justify-between"><span className="text-gray-500">Ref. ID:</span><span className="font-mono text-xs text-gray-600">SUB-{refId}</span></div>
            </div>
            <Button className="mt-6 w-full" variant="outline" onClick={() => { setSubmitted(false); setStep(1); setForm(emptyForm); setUploaded({}) }}>
              Submit Another Property
            </Button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <Header title="List a Property" subtitle="Submit your property for tokenization review" />
      <div className="p-6 max-w-2xl space-y-5">
        {/* Steps indicator */}
        <div className="flex items-center gap-3">
          {[1, 2, 3].map((s, i) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= s ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-400'}`}>
                {step > s ? '✓' : s}
              </div>
              <span className={`text-sm ${step >= s ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
                {s === 1 ? 'Property Info' : s === 2 ? 'Documents' : 'Review & Submit'}
              </span>
              {i < 2 && <div className={`flex-1 h-px ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} style={{ width: '2rem' }} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <Card>
            <CardContent className="py-5 space-y-4">
              <h3 className="ds-section-title">Property Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="ds-label">Property Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="ds-input"
                    placeholder="e.g. Sunset Heights Apartments" />
                </div>
                <div className="sm:col-span-2">
                  <label className="ds-label">Street Address *</label>
                  <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    className="ds-input"
                    placeholder="123 Main Street" />
                </div>
                <div>
                  <label className="ds-label">City *</label>
                  <input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                    className="ds-input"
                    placeholder="Miami" />
                </div>
                <div>
                  <label className="ds-label">State *</label>
                  <input value={form.state} onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
                    className="ds-input"
                    placeholder="FL" />
                </div>
                <div>
                  <label className="ds-label">Property Type *</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                    className="ds-input">
                    {['Multi-Family', 'Commercial', 'Residential', 'Retail', 'Industrial', 'Mixed Use', 'Hospitality'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="ds-label">Estimated Value ($) *</label>
                  <input type="number" value={form.estimatedValue} onChange={e => setForm(f => ({ ...f, estimatedValue: e.target.value }))}
                    className="ds-input"
                    placeholder="1,500,000" />
                </div>
                <div>
                  <label className="ds-label">Expected Monthly Rent ($) *</label>
                  <input type="number" value={form.monthlyRent} onChange={e => setForm(f => ({ ...f, monthlyRent: e.target.value }))}
                    className="ds-input"
                    placeholder="8,500" />
                  <p className="text-xs text-gray-400 mt-1">Total rent collected from all tenants per month</p>
                </div>
                <div className="sm:col-span-2">
                  <label className="ds-label">Property Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    className="ds-textarea"
                    placeholder="Describe the property, number of units, tenant situation, etc." />
                </div>
              </div>

              {/* Tokenization Proposal section */}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Layers size={15} className="text-emerald-600" />
                  <h4 className="font-semibold text-gray-900 text-sm">Your Tokenization Proposal</h4>
                  <Badge variant="secondary" className="text-xs">Proposal — Platform may adjust</Badge>
                </div>
                <p className="text-xs text-gray-500 mb-4">Tell us how you'd like to structure the tokenization. The platform team will review your proposal and can adjust values before minting Bricks.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="ds-label">% of equity to tokenize *</label>
                    <div className="grid grid-cols-4 gap-2">
                      {EQUITY_OPTIONS.map(opt => (
                        <button key={opt}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, tokenizePercent: String(opt) }))}
                          className={`py-2 rounded-lg text-sm font-semibold border transition-colors ${form.tokenizePercent === String(opt) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400'}`}>
                          {opt}%
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">How much of your property ownership you want to sell as Bricks</p>
                  </div>

                  <div>
                    <label className="ds-label">Suggested price per Brick *</label>
                    <div className="grid grid-cols-4 gap-2">
                      {PRICE_OPTIONS.map(opt => (
                        <button key={opt}
                          type="button"
                          onClick={() => setForm(f => ({ ...f, pricePerBrick: String(opt) }))}
                          className={`py-2 rounded-lg text-sm font-semibold border transition-colors ${form.pricePerBrick === String(opt) ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-400'}`}>
                          ${opt}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">Platform will confirm the final price — lower price = more investors</p>
                  </div>
                </div>

                {/* Live calculation snapshot */}
                {estValue > 0 && ppb > 0 && (
                  <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-emerald-800 mb-3">Estimated Tokenization Snapshot</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                      <div className="bg-white rounded-lg p-2.5">
                        <p className="text-lg font-bold text-emerald-700">{form.tokenizePercent}%</p>
                        <p className="text-xs text-gray-500 mt-0.5">Equity offered</p>
                      </div>
                      <div className="bg-white rounded-lg p-2.5">
                        <p className="text-lg font-bold text-gray-900">{estimatedBricks.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Est. Bricks</p>
                      </div>
                      <div className="bg-white rounded-lg p-2.5">
                        <p className="text-lg font-bold text-gray-900">${form.pricePerBrick}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Per Brick</p>
                      </div>
                      <div className="bg-white rounded-lg p-2.5">
                        <p className="text-lg font-bold text-blue-700">{fmt(desiredRaise)}</p>
                        <p className="text-xs text-gray-500 mt-0.5">Desired raise</p>
                      </div>
                    </div>
                    <p className="text-xs text-emerald-700 mt-2.5">
                      Formula: {fmt(estValue)} × {form.tokenizePercent}% ÷ ${form.pricePerBrick}/brick = {estimatedBricks.toLocaleString()} bricks
                    </p>
                  </div>
                )}

                <div className="mt-4">
                  <label className="ds-label">Notes for platform team</label>
                  <textarea value={form.landlordNotes} onChange={e => setForm(f => ({ ...f, landlordNotes: e.target.value }))}
                    rows={2}
                    className="ds-textarea"
                    placeholder="e.g. I'd like to retain 25% equity. The property has strong rental demand. Happy to discuss pricing." />
                </div>
              </div>

              <div className="ds-alert-info flex items-start gap-3">
                <Info size={15} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p>Our team reviews every submission and will contact you to finalize the tokenization terms, pricing, and timeline. No fees until your property goes live.</p>
              </div>

              <Button className="w-full" disabled={!form.name || !form.address || !form.city || !form.estimatedValue || !form.monthlyRent}
                onClick={() => setStep(2)}>
                Continue to Documents
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card>
            <CardContent className="py-5 space-y-4">
              <h3 className="ds-section-title">Upload Documents</h3>
              <p className="text-sm text-gray-500">Upload the required documents. Our team handles the rest.</p>

              <div className="space-y-3">
                {docRequirements.map(doc => (
                  <div key={doc.id} className={`flex items-center gap-4 p-4 border rounded-xl transition-colors ${uploaded[doc.id] ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${uploaded[doc.id] ? 'bg-green-100' : 'bg-white border border-gray-200'}`}>
                      {uploaded[doc.id] ? <CheckCircle2 size={18} className="text-green-600" /> : <FileText size={18} className="text-gray-400" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-gray-900">{doc.label}</p>
                        {doc.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                        {!doc.required && <Badge variant="secondary" className="text-xs">Optional</Badge>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{doc.desc}</p>
                    </div>
                    {uploaded[doc.id] ? (
                      <span className="text-xs text-green-600 font-medium">Uploaded ✓</span>
                    ) : (
                      <button onClick={() => handleFileSimulate(doc.id)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:border-blue-300 hover:text-blue-700 transition-colors">
                        <Upload size={12} /> Upload
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {!requiredUploaded && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
                  <AlertCircle size={14} className="text-amber-600" />
                  <p className="text-xs text-amber-700">Please upload all required documents to continue.</p>
                </div>
              )}

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>Back</Button>
                <Button className="flex-1" disabled={!requiredUploaded} onClick={() => setStep(3)}>Continue to Review</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card>
            <CardContent className="py-5 space-y-5">
              <h3 className="ds-section-title">Review & Submit</h3>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3 text-sm">
                <h4 className="font-semibold text-gray-800">Property Information</h4>
                {[
                  { l: 'Name', v: form.name },
                  { l: 'Address', v: `${form.address}, ${form.city}, ${form.state}` },
                  { l: 'Type', v: form.type },
                  { l: 'Estimated Value', v: form.estimatedValue ? `$${parseInt(form.estimatedValue).toLocaleString()}` : '—' },
                  { l: 'Expected Rent', v: form.monthlyRent ? `$${parseInt(form.monthlyRent).toLocaleString()}/mo` : '—' },
                ].map(row => (
                  <div key={row.l} className="flex justify-between">
                    <span className="text-gray-500">{row.l}</span>
                    <span className="font-medium text-gray-900">{row.v}</span>
                  </div>
                ))}
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3 text-sm">
                <h4 className="font-semibold text-emerald-800 flex items-center gap-2">
                  <Layers size={14} /> Tokenization Proposal
                </h4>
                {[
                  { l: 'Equity to Tokenize', v: `${form.tokenizePercent}%` },
                  { l: 'Suggested Price/Brick', v: `$${form.pricePerBrick}` },
                  { l: 'Estimated Brick Count', v: estimatedBricks.toLocaleString() },
                  { l: 'Desired Raise', v: fmt(desiredRaise) },
                ].map(row => (
                  <div key={row.l} className="flex justify-between">
                    <span className="text-emerald-700">{row.l}</span>
                    <span className="font-semibold text-gray-900">{row.v}</span>
                  </div>
                ))}
                {form.landlordNotes && (
                  <div className="border-t border-emerald-200 pt-2">
                    <p className="text-emerald-700 text-xs font-medium mb-1">Notes:</p>
                    <p className="text-gray-700 text-xs italic">"{form.landlordNotes}"</p>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                <h4 className="font-semibold text-gray-800">Documents</h4>
                {docRequirements.filter(d => uploaded[d.id]).map(doc => (
                  <div key={doc.id} className="flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-green-500" />
                    <span className="text-gray-700">{doc.label}</span>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <p className="text-xs text-blue-700 leading-relaxed">
                  By submitting, you confirm that all documents are authentic and you are authorized to list this property. The platform team will review your tokenization proposal and may adjust pricing before minting. You will be notified of any changes before going live.
                </p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                <Button className="flex-1" onClick={handleSubmit}>
                  <Building2 size={16} /> Submit for Review
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  )
}
