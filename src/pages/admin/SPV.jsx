import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { regions, platformUsers } from '@/data/mockData'
import { useData } from '@/context/DataContext'
import {
  Building2, Plus, ArrowLeft, AlertTriangle, CheckCircle2, XCircle,
  FileText, Globe, Landmark, BarChart3, Users,
  ChevronDown, MapPin, Save, Send,
} from 'lucide-react'

const COVER_IMAGES = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&q=80',
  'https://images.unsplash.com/photo-1572120360610-d971b9d7767c?w=800&q=80',
  'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80',
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
  'https://images.unsplash.com/photo-1553413077-190dd305871c?w=800&q=80',
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&q=80',
  'https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?w=800&q=80',
  'https://images.unsplash.com/photo-1512918728672-1a9ca02ab71a?w=800&q=80',
  'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&q=80',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80',
  'https://images.unsplash.com/photo-1571939228382-b2f2b585ce15?w=800&q=80',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
  'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=800&q=80',
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
  'https://images.unsplash.com/photo-1523217582562-09d0def993a6?w=800&q=80',
  'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
  'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&q=80',
]

const LEGAL_FORMS    = ['AG', 'GmbH']
const PROPERTY_TYPES = ['Residential', 'Commercial', 'Mixed-Use']
const SPV_MANAGERS   = platformUsers.filter(u => u.role === 'SPV Manager' && u.status === 'active')

const fmtCHF = n =>
  new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }).format(n || 0)

const regionColors = {
  'US':             'bg-amber-50 text-amber-700 border border-amber-200',
  'Switzerland':    'bg-red-50 text-red-700 border border-red-200',
  'Rest of Europe': 'bg-blue-50 text-blue-700 border border-blue-200',
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function spvToForm(spv) {
  return {
    region:               spv.region               || 'Switzerland',
    legalName:            spv.legalName             || '',
    companyUID:           spv.companyUID            || '',
    legalForm:            spv.legalForm             || 'AG',
    incorporationDate:    spv.incorporationDate      || '',
    registeredAddress:    spv.registeredAddress      || '',
    bankIBAN:             spv.bankIBAN              || '',
    propertyDisplayName:  spv.propertyDisplayName    || '',
    propertyAddress:      spv.propertyAddress        || '',
    propertyType:         spv.propertyType           || 'Residential',
    yearBuilt:            spv.yearBuilt              ? String(spv.yearBuilt)     : '',
    yearRenovated:        spv.yearRenovated          ? String(spv.yearRenovated) : '',
    totalArea:            spv.totalArea              ? String(spv.totalArea)     : '',
    numberOfUnits:        spv.numberOfUnits          ? String(spv.numberOfUnits) : '',
    totalValuation:       spv.totalValuation         ? String(spv.totalValuation)  : '',
    outstandingDebt:      spv.outstandingDebt        ? String(spv.outstandingDebt) : '',
    totalBricks:          spv.totalBricks            ? String(spv.totalBricks)     : '',
    pricePerBrick:        spv.pricePerBrick          ? String(spv.pricePerBrick)   : '',
    targetAPY:            spv.targetAPY              ? String(spv.targetAPY)       : '',
    platformFee:          spv.platformFee            ? String(spv.platformFee)     : '1.5',
    managementFee:        spv.managementFee          ? String(spv.managementFee)   : '8.0',
    coverImage:           spv.coverImage             || '',
    docFoundation:        spv.documents?.foundation  || false,
    docDeed:              spv.documents?.deed        || false,
    docAppraisal:         spv.documents?.appraisal   || false,
    assignedManagerId:    spv.assignedManagerId      || '',
  }
}

function getCompletion(f) {
  return {
    A: { filled: [f.legalName, f.companyUID, f.incorporationDate, f.registeredAddress, f.bankIBAN].filter(Boolean).length, total: 5 },
    B: { filled: [f.propertyDisplayName, f.propertyAddress, f.yearBuilt, f.totalArea, f.numberOfUnits].filter(Boolean).length, total: 5 },
    C: { filled: [f.totalValuation, f.totalBricks, f.targetAPY].filter(Boolean).length, total: 3 },
    D: { filled: [f.docFoundation, f.docDeed, f.docAppraisal].filter(Boolean).length, total: 3 },
    E: { filled: f.assignedManagerId ? 1 : 0, total: 1 },
  }
}

// ── Primitive UI ──────────────────────────────────────────────────────────────

function Label({ children, required }) {
  return (
    <label className="block text-xs font-semibold text-gray-600 mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  )
}

function Input({ value, onChange, placeholder, type = 'text', disabled }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent placeholder:text-gray-300 disabled:bg-gray-50 disabled:text-gray-400"
    />
  )
}

function TextArea({ value, onChange, placeholder, rows = 2 }) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent placeholder:text-gray-300 resize-none"
    />
  )
}

function ToggleGroup({ options, value, onChange, colorMap = {} }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(opt => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
            value === opt
              ? colorMap[opt] || 'border-sky-500 bg-sky-50 text-sky-700'
              : 'border-gray-200 text-gray-500 hover:border-gray-300'
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  )
}

function DocUpload({ label, uploaded, onToggle }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${uploaded ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center gap-2">
        {uploaded
          ? <CheckCircle2 size={15} className="text-green-500 flex-shrink-0" />
          : <FileText size={15} className="text-gray-400 flex-shrink-0" />
        }
        <div>
          <p className="text-sm font-medium text-gray-800">{label}</p>
          <p className="text-xs text-gray-400">{uploaded ? 'Uploaded' : 'PDF required'}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors ${
          uploaded ? 'border-red-200 text-red-500 hover:bg-red-50' : 'border-sky-300 text-sky-600 hover:bg-sky-50'
        }`}
      >
        {uploaded ? 'Remove' : 'Upload PDF'}
      </button>
    </div>
  )
}

// ── Collapsible Section ───────────────────────────────────────────────────────

const sectionTheme = {
  sky:    { header: 'bg-sky-50',    icon: 'text-sky-600',    label: 'text-sky-800'    },
  violet: { header: 'bg-violet-50', icon: 'text-violet-600', label: 'text-violet-800' },
  green:  { header: 'bg-green-50',  icon: 'text-green-600',  label: 'text-green-800'  },
  amber:  { header: 'bg-amber-50',  icon: 'text-amber-600',  label: 'text-amber-800'  },
  gray:   { header: 'bg-gray-50',   icon: 'text-gray-600',   label: 'text-gray-800'   },
}

function CollapsibleSection({ icon: Icon, title, subtitle, color = 'sky', completion, expanded, onToggle, children }) {
  const th = sectionTheme[color]
  const done    = completion.filled === completion.total
  const partial = completion.filled > 0 && !done
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className={`w-full flex items-center justify-between px-5 py-4 transition-colors ${
          expanded ? `${th.header} border-b border-gray-200` : 'bg-white hover:bg-gray-50'
        }`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <Icon size={17} className={expanded ? th.icon : 'text-gray-400'} />
          <div className="text-left">
            <p className={`font-bold text-sm ${expanded ? th.label : 'text-gray-800'}`}>{title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
          <div className="flex items-center gap-1.5">
            {done ? (
              <CheckCircle2 size={14} className="text-green-500" />
            ) : partial ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              </div>
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />
            )}
            <span className={`text-xs font-semibold tabular-nums ${done ? 'text-green-600' : partial ? 'text-amber-500' : 'text-gray-400'}`}>
              {completion.filled}/{completion.total}
            </span>
          </div>
          <ChevronDown
            size={15}
            className={`text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>
      {expanded && <div className="p-5">{children}</div>}
    </div>
  )
}

// ── SPV Card (list) ───────────────────────────────────────────────────────────

function SpvCard({ spv, onView }) {
  const docCount = Object.values(spv.documents || {}).filter(Boolean).length
  const formData = spvToForm(spv)
  const comp     = getCompletion(formData)
  const totalFilled = Object.values(comp).reduce((s, c) => s + c.filled, 0)
  const totalFields = Object.values(comp).reduce((s, c) => s + c.total, 0)
  const pct = Math.round((totalFilled / totalFields) * 100)

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {spv.coverImage ? (
        <div className="h-36 relative overflow-hidden">
          <img src={spv.coverImage} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-3 left-3 flex gap-1.5">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${regionColors[spv.region]}`}>{spv.region}</span>
            <Badge variant={spv.status === 'active' ? 'success' : spv.status === 'draft' ? 'secondary' : spv.status === 'rejected' ? 'destructive' : 'warning'} className="text-xs">{spv.status === 'active' ? 'Live' : spv.status === 'draft' ? 'Draft' : spv.status === 'rejected' ? 'Rejected' : 'Pending'}</Badge>
          </div>
        </div>
      ) : (
        <div className="h-14 bg-gradient-to-r from-sky-50 to-indigo-50 flex items-end px-4 pb-2">
          <div className="flex gap-1.5">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${regionColors[spv.region]}`}>{spv.region}</span>
            <Badge variant={spv.status === 'active' ? 'success' : spv.status === 'draft' ? 'secondary' : spv.status === 'rejected' ? 'destructive' : 'warning'} className="text-xs">{spv.status === 'active' ? 'Live' : spv.status === 'draft' ? 'Draft' : spv.status === 'rejected' ? 'Rejected' : 'Pending'}</Badge>
          </div>
        </div>
      )}
      <div className="p-4">
        <p className="font-bold text-gray-900 text-sm leading-tight">{spv.propertyDisplayName}</p>
        <p className="text-xs text-gray-400 mt-0.5">{spv.legalName}</p>
        {spv.propertyAddress && (
          <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
            <MapPin size={11} />
            <span className="truncate">{spv.propertyAddress}</span>
          </div>
        )}

        {/* Completion bar */}
        <div className="mt-3 mb-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">Profile completion</span>
            <span className={`font-semibold ${pct === 100 ? 'text-green-600' : 'text-sky-600'}`}>{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${pct === 100 ? 'bg-green-500' : 'bg-sky-500'}`}
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-400">Valuation</p>
            <p className="text-xs font-bold text-gray-900 mt-0.5 truncate">{spv.totalValuation ? fmtCHF(spv.totalValuation) : '—'}</p>
          </div>
          <div className="bg-sky-50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-400">Bricks</p>
            <p className="text-xs font-bold text-sky-700 mt-0.5">{spv.totalBricks ? spv.totalBricks.toLocaleString() : '—'}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-400">APY</p>
            <p className="text-xs font-bold text-green-700 mt-0.5">{spv.targetAPY ? `${spv.targetAPY}%` : '—'}</p>
          </div>
        </div>

        {docCount < 3 && (
          <div className="flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-2.5 py-1.5 mb-3">
            <AlertTriangle size={11} />
            {docCount}/3 documents uploaded
          </div>
        )}

        <button
          onClick={() => onView(spv)}
          className="w-full text-sm font-medium text-sky-600 border border-sky-200 py-2 rounded-xl hover:bg-sky-50 transition-colors"
        >
          View &amp; Edit
        </button>
      </div>
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

const QC_EMPTY = { region: 'Switzerland', legalName: '', propertyDisplayName: '', propertyType: 'Residential' }

export function AdminSPV() {
  const { spvs: spvList, addSpv, updateSpv } = useData()
  const [view,             setView]            = useState('list')
  const [currentSpv,       setCurrentSpv]      = useState(null)
  const [regionFilter,     setFilter]          = useState('All')
  const [statusFilter,     setStatusFilter]    = useState('all')

  // Quick Create modal
  const [qcOpen,  setQcOpen]  = useState(false)
  const [qcForm,  setQcForm]  = useState(QC_EMPTY)
  const [qcErrors,setQcErrors]= useState({})

  // Detail/edit state
  const [editForm,          setEditForm]        = useState(null)
  const [expandedSections,  setExpanded]        = useState(new Set())
  const [rejectModal,       setRejectModal]     = useState(false)
  const [rejectComment,     setRejectComment]   = useState('')
  const [rejectError,       setRejectError]     = useState('')

  const filtered = spvList.filter(s => {
    const matchRegion = regionFilter === 'All' || s.region === regionFilter
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'active'   && s.status === 'active') ||
      (statusFilter === 'review'   && s.status === 'pending') ||
      (statusFilter === 'draft'    && s.status === 'draft') ||
      (statusFilter === 'rejected' && s.status === 'rejected')
    return matchRegion && matchStatus
  })

  const countFor = (region, status) => spvList.filter(s => {
    const mr = region === 'All' || s.region === region
    const ms = status === 'all' ||
      (status === 'active'   && s.status === 'active') ||
      (status === 'review'   && s.status === 'pending') ||
      (status === 'draft'    && s.status === 'draft') ||
      (status === 'rejected' && s.status === 'rejected')
    return mr && ms
  }).length

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openDetail = (spv, defaultExpanded = new Set()) => {
    setCurrentSpv(spv)
    setEditForm(spvToForm(spv))
    setExpanded(defaultExpanded)
    setView('detail')
  }

  const handleQuickCreate = () => {
    const e = {}
    if (!qcForm.legalName.trim())           e.legalName = 'Required'
    if (!qcForm.propertyDisplayName.trim()) e.propertyDisplayName = 'Required'
    if (Object.keys(e).length) { setQcErrors(e); return }

    const draft = {
      id:                  `spv-${Date.now()}`,
      status:              'draft',
      createdDate:          new Date().toISOString().split('T')[0],
      region:               qcForm.region,
      legalName:            qcForm.legalName.trim(),
      legalForm:            'AG',
      companyUID:           '', incorporationDate: '', registeredAddress: '', bankIBAN: '',
      propertyDisplayName:  qcForm.propertyDisplayName.trim(),
      propertyType:         qcForm.propertyType,
      propertyAddress:      '',
      yearBuilt: null, yearRenovated: null, totalArea: 0, numberOfUnits: 0,
      totalValuation: 0, outstandingDebt: 0, totalBricks: 0, pricePerBrick: 0,
      targetAPY: 0, platformFee: 1.5, managementFee: 8.0,
      coverImage: COVER_IMAGES[Math.floor(Math.random() * COVER_IMAGES.length)],
      documents: { foundation: false, deed: false, appraisal: false },
      assignedManagerId: '',
    }
    addSpv(draft)
    setQcOpen(false)
    setQcForm(QC_EMPTY)
    setQcErrors({})
    openDetail(draft, new Set(['A']))
  }

  const setField = field => val =>
    setEditForm(f => {
      const next = { ...f, [field]: val }
      if (['totalValuation', 'totalBricks'].includes(field) && next.totalValuation && next.totalBricks) {
        next.pricePerBrick = (parseFloat(next.totalValuation) / parseFloat(next.totalBricks)).toFixed(2)
      }
      return next
    })

  const toggleSection = id =>
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const buildUpdated = (f, extra = {}) => ({
    ...currentSpv,
    region: f.region, legalName: f.legalName, companyUID: f.companyUID,
    legalForm: f.legalForm, incorporationDate: f.incorporationDate,
    registeredAddress: f.registeredAddress, bankIBAN: f.bankIBAN,
    propertyDisplayName: f.propertyDisplayName, propertyAddress: f.propertyAddress,
    propertyType: f.propertyType,
    yearBuilt:    parseInt(f.yearBuilt)       || null,
    yearRenovated:parseInt(f.yearRenovated)   || null,
    totalArea:    parseFloat(f.totalArea)      || 0,
    numberOfUnits:parseInt(f.numberOfUnits)   || 0,
    totalValuation:  parseFloat(f.totalValuation)  || 0,
    outstandingDebt: parseFloat(f.outstandingDebt) || 0,
    totalBricks:     parseInt(f.totalBricks)        || 0,
    pricePerBrick:   parseFloat(f.pricePerBrick)    || 0,
    targetAPY:       parseFloat(f.targetAPY)        || 0,
    platformFee:     parseFloat(f.platformFee)      || 0,
    managementFee:   parseFloat(f.managementFee)    || 0,
    coverImage: f.coverImage,
    documents: { foundation: f.docFoundation, deed: f.docDeed, appraisal: f.docAppraisal },
    assignedManagerId: f.assignedManagerId,
    ...extra,
  })

  const handleSave = () => {
    const updated = buildUpdated(editForm)
    updateSpv(updated.id, updated)
    setView('list')
  }

  const handleSubmitForReview = () => {
    const updated = buildUpdated(editForm, { status: 'pending' })
    updateSpv(updated.id, updated)
    setStatusFilter('review')
    setView('list')
  }

  const handleApprove = () => {
    updateSpv(currentSpv.id, { status: 'active' })
    setCurrentSpv(prev => ({ ...prev, status: 'active' }))
    setStatusFilter('active')
    setView('list')
  }

  const handleReject = () => {
    if (!rejectComment.trim()) {
      setRejectError('Rejection reason is required.')
      return
    }
    updateSpv(currentSpv.id, { status: 'rejected', rejectionComment: rejectComment.trim() })
    setCurrentSpv(prev => ({ ...prev, status: 'rejected', rejectionComment: rejectComment.trim() }))
    setRejectModal(false)
    setRejectComment('')
    setRejectError('')
    setStatusFilter('rejected')
    setView('list')
  }

  const handleReturnToDraft = () => {
    updateSpv(currentSpv.id, { status: 'draft', rejectionComment: undefined })
    setCurrentSpv(prev => ({ ...prev, status: 'draft', rejectionComment: undefined }))
  }

  // ── Detail / Edit View ─────────────────────────────────────────────────────

  if (view === 'detail' && currentSpv && editForm) {
    const comp = getCompletion(editForm)
    const totalFilled = Object.values(comp).reduce((s, c) => s + c.filled, 0)
    const totalFields = Object.values(comp).reduce((s, c) => s + c.total, 0)
    const pct = Math.round((totalFilled / totalFields) * 100)
    const lexKoller = editForm.propertyType === 'Residential'

    return (
      <Layout>
        <Header
          title={editForm.propertyDisplayName || currentSpv.legalName}
          subtitle={currentSpv.legalName}
        />
        <div className="ds-page max-w-3xl">

          {/* Top bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <button
              onClick={() => setView('list')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft size={16} /> Back to SPV Registry
            </button>
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${regionColors[editForm.region]}`}>{editForm.region}</span>
              <Badge variant={currentSpv.status === 'active' ? 'success' : currentSpv.status === 'draft' ? 'secondary' : currentSpv.status === 'rejected' ? 'destructive' : 'warning'}>{currentSpv.status === 'active' ? 'Live' : currentSpv.status === 'draft' ? 'Draft' : currentSpv.status === 'rejected' ? 'Rejected' : 'Pending'}</Badge>
            </div>
          </div>

          {/* Cover image */}
          {editForm.coverImage && (
            <div className="h-52 rounded-2xl overflow-hidden relative">
              <img src={editForm.coverImage} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <p className="text-white font-bold text-lg drop-shadow">{editForm.propertyDisplayName || editForm.legalName}</p>
                <p className="text-white/70 text-xs drop-shadow">{editForm.propertyAddress || editForm.region}</p>
              </div>
            </div>
          )}

          {/* Rejection reason banner */}
          {currentSpv.status === 'rejected' && currentSpv.rejectionComment && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 flex gap-3">
              <XCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-red-700">Rejection Reason</p>
                <p className="text-sm text-red-600 mt-0.5">{currentSpv.rejectionComment}</p>
              </div>
            </div>
          )}

          {/* Completion tracker */}
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">Profile Completion</p>
              <p className={`text-sm font-bold ${pct === 100 ? 'text-green-600' : 'text-sky-600'}`}>{pct}%</p>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div
                className={`h-full rounded-full transition-all duration-500 ${pct === 100 ? 'bg-green-500' : 'bg-sky-500'}`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex justify-around">
              {['A','B','C','D','E'].map(s => {
                const c    = comp[s]
                const done = c.filled === c.total
                const part = c.filled > 0 && !done
                return (
                  <button
                    key={s}
                    onClick={() => { setExpanded(prev => { const n = new Set(prev); n.add(s); return n }) }}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors group-hover:ring-2 group-hover:ring-sky-200 ${
                      done ? 'bg-green-100 text-green-600' : part ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'
                    }`}>{s}</div>
                    <span className="text-[10px] text-gray-400">{c.filled}/{c.total}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {lexKoller && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
              <AlertTriangle size={15} className="text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700">
                <span className="font-bold">Lex Koller Active</span> — Residential property. Non-Swiss holders will be automatically blocked from purchasing Bricks.
              </p>
            </div>
          )}

          {/* ── A — Legal ── */}
          <CollapsibleSection
            icon={Landmark} color="sky"
            title="A — SPV Legal Details"
            subtitle="Company registration, UID, IBAN and address"
            completion={comp.A}
            expanded={expandedSections.has('A')}
            onToggle={() => toggleSection('A')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label required>Legal Name</Label>
                <Input value={editForm.legalName} onChange={setField('legalName')} placeholder='"Bahnhofstrasse 1 Immobilien AG"' />
              </div>
              <div>
                <Label>Company UID</Label>
                <Input value={editForm.companyUID} onChange={setField('companyUID')} placeholder="CHE-123.456.789" />
              </div>
              <div>
                <Label>Legal Form</Label>
                <ToggleGroup options={LEGAL_FORMS} value={editForm.legalForm} onChange={setField('legalForm')} />
              </div>
              <div>
                <Label>Incorporation Date</Label>
                <Input type="date" value={editForm.incorporationDate} onChange={setField('incorporationDate')} />
              </div>
              <div>
                <Label>Bank IBAN</Label>
                <Input value={editForm.bankIBAN} onChange={setField('bankIBAN')} placeholder="CH56 0483 5012 3456 7800 9" />
              </div>
              <div className="sm:col-span-2">
                <Label>Registered Address</Label>
                <TextArea value={editForm.registeredAddress} onChange={setField('registeredAddress')} placeholder="Full legal address of the SPV" />
              </div>
            </div>
          </CollapsibleSection>

          {/* ── B — Property ── */}
          <CollapsibleSection
            icon={Building2} color="violet"
            title="B — Property Details"
            subtitle="Physical asset type, dimensions and address"
            completion={comp.B}
            expanded={expandedSections.has('B')}
            onToggle={() => toggleSection('B')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <Label required>Property Display Name</Label>
                <Input value={editForm.propertyDisplayName} onChange={setField('propertyDisplayName')} placeholder='"Luxury Downtown Zurich Apartments"' />
              </div>
              <div className="sm:col-span-2">
                <Label>Property Address</Label>
                <TextArea value={editForm.propertyAddress} onChange={setField('propertyAddress')} placeholder="Full physical address of the building" />
              </div>
              <div className="sm:col-span-2">
                <Label required>Property Type</Label>
                <ToggleGroup
                  options={PROPERTY_TYPES}
                  value={editForm.propertyType}
                  onChange={setField('propertyType')}
                  colorMap={{
                    'Residential': 'border-sky-500 bg-sky-50 text-sky-700',
                    'Commercial':  'border-violet-500 bg-violet-50 text-violet-700',
                    'Mixed-Use':   'border-green-500 bg-green-50 text-green-700',
                  }}
                />
              </div>
              {lexKoller && (
                <div className="sm:col-span-2 flex items-center gap-2 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2 text-xs text-amber-700">
                  <AlertTriangle size={12} className="flex-shrink-0" />
                  Lex Koller: Swiss-only sale restriction will apply to this property.
                </div>
              )}
              <div>
                <Label>Year Built</Label>
                <Input type="number" value={editForm.yearBuilt} onChange={setField('yearBuilt')} placeholder="e.g. 1998" />
              </div>
              <div>
                <Label>Year Renovated</Label>
                <Input type="number" value={editForm.yearRenovated} onChange={setField('yearRenovated')} placeholder="e.g. 2021" />
              </div>
              <div>
                <Label>Total Area (sqm)</Label>
                <Input type="number" value={editForm.totalArea} onChange={setField('totalArea')} placeholder="e.g. 1250" />
              </div>
              <div>
                <Label>Number of Units</Label>
                <Input type="number" value={editForm.numberOfUnits} onChange={setField('numberOfUnits')} placeholder="e.g. 12" />
              </div>
            </div>
          </CollapsibleSection>

          {/* ── C — Financial ── */}
          <CollapsibleSection
            icon={BarChart3} color="green"
            title="C — Financial &amp; Tokenization"
            subtitle="Valuation, Brick structure and yield — platform fee defaults to 1.5%"
            completion={comp.C}
            expanded={expandedSections.has('C')}
            onToggle={() => toggleSection('C')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label required>Total Valuation (CHF)</Label>
                <Input type="number" value={editForm.totalValuation} onChange={setField('totalValuation')} placeholder="e.g. 8500000" />
              </div>
              <div>
                <Label>Outstanding Debt / Mortgage (CHF)</Label>
                <Input type="number" value={editForm.outstandingDebt} onChange={setField('outstandingDebt')} placeholder="e.g. 2100000" />
              </div>
              <div>
                <Label required>Total Bricks to Mint</Label>
                <Input type="number" value={editForm.totalBricks} onChange={setField('totalBricks')} placeholder="e.g. 10000" />
              </div>
              <div>
                <Label>Price per Brick (CHF)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={editForm.pricePerBrick}
                    onChange={setField('pricePerBrick')}
                    placeholder="Auto-calculated"
                    disabled={!!(editForm.totalValuation && editForm.totalBricks)}
                  />
                  {editForm.totalValuation && editForm.totalBricks && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-sky-500 font-bold uppercase tracking-wider">auto</span>
                  )}
                </div>
              </div>
              <div>
                <Label>Target APY (%)</Label>
                <Input type="number" value={editForm.targetAPY} onChange={setField('targetAPY')} placeholder="e.g. 4.2" />
              </div>
              <div />
              <div>
                <Label>Platform Fee (%)</Label>
                <Input type="number" value={editForm.platformFee} onChange={setField('platformFee')} placeholder="1.5" />
                <p className="text-[10px] text-gray-400 mt-1">Default: 1.5%</p>
              </div>
              <div>
                <Label>Property Management Fee (%)</Label>
                <Input type="number" value={editForm.managementFee} onChange={setField('managementFee')} placeholder="8.0" />
                <p className="text-[10px] text-gray-400 mt-1">Default: 8.0%</p>
              </div>
            </div>
            {editForm.totalValuation && editForm.totalBricks && (
              <div className="mt-4 bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                <span><span className="text-xs text-gray-400">Net Equity </span><span className="font-bold text-sky-700">{fmtCHF(parseFloat(editForm.totalValuation) - (parseFloat(editForm.outstandingDebt) || 0))}</span></span>
                <span><span className="text-xs text-gray-400">Price / Brick </span><span className="font-bold text-sky-700">{fmtCHF(parseFloat(editForm.pricePerBrick) || 0)}</span></span>
                <span><span className="text-xs text-gray-400">Total Raise </span><span className="font-bold text-sky-700">{fmtCHF((parseFloat(editForm.pricePerBrick) || 0) * (parseInt(editForm.totalBricks) || 0))}</span></span>
              </div>
            )}
          </CollapsibleSection>

          {/* ── D — Documents ── */}
          <CollapsibleSection
            icon={FileText} color="amber"
            title="D — Media &amp; Documents"
            subtitle="Cover image and three required legal PDFs"
            completion={comp.D}
            expanded={expandedSections.has('D')}
            onToggle={() => toggleSection('D')}
          >
            <div className="space-y-4">
              <div>
                <Label>Cover Image URL</Label>
                <Input value={editForm.coverImage} onChange={setField('coverImage')} placeholder="https://..." />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Legal Documents</p>
                <DocUpload
                  label="SPV Foundation Document"
                  uploaded={editForm.docFoundation}
                  onToggle={() => setField('docFoundation')(!editForm.docFoundation)}
                />
                <DocUpload
                  label="Property Deed"
                  uploaded={editForm.docDeed}
                  onToggle={() => setField('docDeed')(!editForm.docDeed)}
                />
                <DocUpload
                  label="Appraisal Report"
                  uploaded={editForm.docAppraisal}
                  onToggle={() => setField('docAppraisal')(!editForm.docAppraisal)}
                />
              </div>
            </div>
          </CollapsibleSection>

          {/* ── E — Management ── */}
          <CollapsibleSection
            icon={Users} color="gray"
            title="E — Management"
            subtitle="Assign an SPV Manager who will operate this property"
            completion={comp.E}
            expanded={expandedSections.has('E')}
            onToggle={() => toggleSection('E')}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SPV_MANAGERS.map(mgr => (
                <button
                  key={mgr.id}
                  type="button"
                  onClick={() => setField('assignedManagerId')(mgr.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
                    editForm.assignedManagerId === mgr.id
                      ? 'border-violet-500 bg-violet-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-xs font-bold text-violet-600 flex-shrink-0">
                    {mgr.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm truncate">{mgr.name}</p>
                    <p className="text-xs text-gray-400 truncate">{mgr.region}</p>
                  </div>
                  {editForm.assignedManagerId === mgr.id && (
                    <CheckCircle2 size={15} className="text-violet-500 ml-auto flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </CollapsibleSection>

          {/* Action bar */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setView('list')}>Back to List</Button>

            {/* Draft: Save + Submit for Review */}
            {currentSpv.status === 'draft' && <>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save size={15} /> Save Changes
              </Button>
              <Button onClick={handleSubmitForReview} className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white">
                <Send size={15} /> Submit for Review
              </Button>
            </>}

            {/* Pending: Reject + Approve */}
            {currentSpv.status === 'pending' && <>
              <Button
                onClick={() => { setRejectComment(''); setRejectError(''); setRejectModal(true) }}
                variant="destructive"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <XCircle size={15} /> Reject
              </Button>
              <Button
                onClick={handleApprove}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 size={15} /> Approve
              </Button>
            </>}

            {/* Active: Save only */}
            {currentSpv.status === 'active' && (
              <Button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2">
                <Save size={15} /> Save Changes
              </Button>
            )}

            {/* Rejected: Return to Draft */}
            {currentSpv.status === 'rejected' && (
              <Button onClick={handleReturnToDraft} className="flex-1 flex items-center justify-center gap-2">
                <ArrowLeft size={15} /> Return to Draft
              </Button>
            )}
          </div>

          {/* Reject modal */}
          <Modal open={rejectModal} onClose={() => setRejectModal(false)} title="Reject SPV">
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Provide a reason for rejection. This will be recorded on the SPV and visible when it is reopened.</p>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">
                  Rejection Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectComment}
                  onChange={e => { setRejectComment(e.target.value); if (rejectError) setRejectError('') }}
                  rows={4}
                  placeholder="e.g. Missing environmental compliance documents. Appraisal report is outdated."
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                />
                {rejectError && <p className="text-xs text-red-500 mt-1">{rejectError}</p>}
              </div>
              <div className="flex gap-3 pt-1">
                <Button variant="outline" className="flex-1" onClick={() => setRejectModal(false)}>Cancel</Button>
                <Button variant="destructive" className="flex-1" onClick={handleReject}>Confirm Rejection</Button>
              </div>
            </div>
          </Modal>
        </div>
      </Layout>
    )
  }

  // ── List View ──────────────────────────────────────────────────────────────

  return (
    <Layout>
      <Header title="SPV Registry" subtitle="Manage Special Purpose Vehicles and their tokenized real estate assets" />
      <div className="ds-page">

        {/* Status + Region filters */}
        <div className="bg-white rounded-2xl border border-gray-200 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 w-14 flex-shrink-0">Status</span>
              <div className="flex gap-1.5">
                {[
                  { key: 'all',      label: 'All',      count: spvList.length,                                                   activeCls: 'bg-sky-600 text-white'    },
                  { key: 'active',   label: 'Live',     count: spvList.filter(s => s.status === 'active').length,             activeCls: 'bg-green-600 text-white'  },
                  { key: 'review',   label: 'Pending',  count: spvList.filter(s => s.status === 'pending').length,            activeCls: 'bg-amber-500 text-white'  },
                  { key: 'draft',    label: 'Draft',    count: spvList.filter(s => s.status === 'draft').length,              activeCls: 'bg-purple-600 text-white' },
                  { key: 'rejected', label: 'Rejected', count: spvList.filter(s => s.status === 'rejected').length,           activeCls: 'bg-red-600 text-white'    },
                ].map(p => (
                  <button
                    key={p.key}
                    onClick={() => setStatusFilter(p.key)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${statusFilter === p.key ? p.activeCls : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    {p.label} <span className={statusFilter === p.key ? 'opacity-80' : 'text-gray-400'}>{p.count}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-400 w-14 flex-shrink-0">Region</span>
              <div className="flex gap-1.5">
                {['All', ...regions].map(r => (
                  <button
                    key={r}
                    onClick={() => setFilter(r)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${regionFilter === r ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                  >
                    {r} <span className={regionFilter === r ? 'opacity-80' : 'text-gray-400'}>{countFor(r, 'all')}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={() => { setQcForm(QC_EMPTY); setQcErrors({}); setQcOpen(true) }} className="flex items-center gap-2 flex-shrink-0">
            <Plus size={14} /> Create SPV
          </Button>
        </div>

        {/* Cards */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No SPVs match this filter combination.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(spv => (
              <SpvCard key={spv.id} spv={spv} onView={openDetail} />
            ))}
          </div>
        )}
      </div>

      {/* ── Quick Create Modal ── */}
      <Modal open={qcOpen} onClose={() => setQcOpen(false)} title="Create SPV" size="sm">
        <div className="space-y-5">
          <div>
            <Label required>Region</Label>
            <ToggleGroup
              options={regions}
              value={qcForm.region}
              onChange={v => setQcForm(f => ({ ...f, region: v }))}
              colorMap={{
                'US':             'border-amber-400 bg-amber-50 text-amber-700',
                'Switzerland':    'border-red-400 bg-red-50 text-red-700',
                'Rest of Europe': 'border-blue-400 bg-blue-50 text-blue-700',
              }}
            />
          </div>
          <div>
            <Label required>SPV Legal Name</Label>
            <Input
              value={qcForm.legalName}
              onChange={v => setQcForm(f => ({ ...f, legalName: v }))}
              placeholder='"Bahnhofstrasse 1 Immobilien AG"'
            />
            {qcErrors.legalName && <p className="text-xs text-red-500 mt-1">{qcErrors.legalName}</p>}
          </div>
          <div>
            <Label required>Property Display Name</Label>
            <Input
              value={qcForm.propertyDisplayName}
              onChange={v => setQcForm(f => ({ ...f, propertyDisplayName: v }))}
              placeholder='"Luxury Downtown Zurich Apartments"'
            />
            {qcErrors.propertyDisplayName && <p className="text-xs text-red-500 mt-1">{qcErrors.propertyDisplayName}</p>}
          </div>
          <div>
            <Label required>Property Type</Label>
            <ToggleGroup
              options={PROPERTY_TYPES}
              value={qcForm.propertyType}
              onChange={v => setQcForm(f => ({ ...f, propertyType: v }))}
              colorMap={{
                'Residential': 'border-sky-500 bg-sky-50 text-sky-700',
                'Commercial':  'border-violet-500 bg-violet-50 text-violet-700',
                'Mixed-Use':   'border-green-500 bg-green-50 text-green-700',
              }}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <Button variant="outline" className="flex-1" onClick={() => setQcOpen(false)}>Cancel</Button>
            <Button className="flex-1 flex items-center gap-2" onClick={handleQuickCreate}>
              <Plus size={14} /> Create Draft
            </Button>
          </div>
          <p className="text-xs text-center text-gray-400">
            Creates a draft instantly — complete all details in the next screen.
          </p>
        </div>
      </Modal>
    </Layout>
  )
}
