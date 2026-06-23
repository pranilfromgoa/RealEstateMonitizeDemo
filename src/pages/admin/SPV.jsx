import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { useAuth } from '@/context/AuthContext'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { regions, platformUsers } from '@/data/mockData'
import { useData } from '@/context/DataContext'
import {
  Building2, Plus, ArrowLeft, ArrowRight, AlertTriangle, CheckCircle2, XCircle,
  FileText, Globe, Landmark, BarChart3, Users,
  ChevronDown, MapPin, Save, Send, Info, BookOpen,
  LayoutGrid, LayoutList,
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

const LEGAL_FORMS    = ['AG', 'GmbH', 'LLC']
const PROPERTY_TYPES = ['Residential', 'Commercial', 'Multi-Family', 'Industrial', 'Hospitality', 'Mixed-Use']
const SPV_MANAGERS   = platformUsers.filter(u => u.role === 'SPV Manager' && u.status === 'active')

const fmtCHF = n =>
  new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }).format(n || 0)

const regionColors = {
  'US':             'bg-slate-50 text-slate-600 border border-slate-200',
  'Switzerland':    'bg-gray-100 text-gray-600 border border-gray-300',
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
    sponsorEquityPct:     spv.sponsorEquityPct       ? String(spv.sponsorEquityPct) : '0',
    liquidityPoolPct:     spv.liquidityPoolPct       ? String(spv.liquidityPoolPct) : '2.5',
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

function Label({ children, required, info }) {
  return (
    <label className="flex items-center gap-1 text-xs font-semibold text-gray-600 mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
      {info && (
        <span className="relative group inline-flex items-center ml-0.5 cursor-help">
          <Info size={11} className="text-gray-400 group-hover:text-sky-500 transition-colors" />
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-60 bg-gray-900 text-white text-[11px] leading-relaxed rounded-xl px-3 py-2.5 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-xl pointer-events-none">
            {info}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
          </span>
        </span>
      )}
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

function ToggleGroup({ options, value, onChange, colorMap = {}, tooltips = {} }) {
  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(opt => (
        <span key={opt} className="relative group">
          <button
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
          {tooltips[opt] && (
            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-gray-900 text-white text-[11px] leading-relaxed rounded-xl px-3 py-2.5 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity z-30 shadow-xl pointer-events-none text-left">
              {tooltips[opt]}
              <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
            </span>
          )}
        </span>
      ))}
    </div>
  )
}

function DocUpload({ label, uploaded, onToggle }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${uploaded ? 'bg-sky-50 border-sky-200' : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex items-center gap-2">
        {uploaded
          ? <CheckCircle2 size={15} className="text-sky-500 flex-shrink-0" />
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
  violet: { header: 'bg-sky-50',    icon: 'text-sky-600',    label: 'text-sky-800'    },
  green:  { header: 'bg-sky-50',    icon: 'text-sky-600',    label: 'text-sky-800'    },
  amber:  { header: 'bg-gray-50',   icon: 'text-gray-600',   label: 'text-gray-800'   },
  gray:   { header: 'bg-gray-50',   icon: 'text-gray-600',   label: 'text-gray-800'   },
}

function CollapsibleSection({ icon: Icon, title, subtitle, color = 'sky', completion, expanded, onToggle, readOnly = false, children }) {
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
              <CheckCircle2 size={14} className="text-sky-500" />
            ) : partial ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-sky-400 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
              </div>
            ) : (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-gray-300" />
            )}
            <span className={`text-xs font-semibold tabular-nums ${done ? 'text-sky-600' : partial ? 'text-sky-400' : 'text-gray-400'}`}>
              {completion.filled}/{completion.total}
            </span>
          </div>
          <ChevronDown
            size={15}
            className={`text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
          />
        </div>
      </button>
      {expanded && (
        <div className="p-5">
          {readOnly
            ? <fieldset disabled className="border-0 p-0 m-0 min-w-0 w-full opacity-60">{children}</fieldset>
            : children
          }
        </div>
      )}
    </div>
  )
}

// ── SPV Card (list) ───────────────────────────────────────────────────────────

function SpvCard({ spv, onView, viewOnly = false, onAssignManager = null }) {
  const docCount = Object.values(spv.documents || {}).filter(Boolean).length
  const assignedMgr = onAssignManager ? SPV_MANAGERS.find(m => m.id === spv.assignedManagerId) : null
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
            <Badge variant={spv.status === 'live' ? 'success' : spv.status === 'draft' ? 'secondary' : spv.status === 'rejected' ? 'destructive' : spv.status === 'approved' ? 'default' : 'warning'} className="text-xs">{spv.status === 'live' ? 'Live' : spv.status === 'draft' ? 'Draft' : spv.status === 'rejected' ? 'Rejected' : spv.status === 'approved' ? 'Approved' : 'Pending'}</Badge>
          </div>
        </div>
      ) : (
        <div className="h-14 bg-gradient-to-r from-sky-50 to-indigo-50 flex items-end px-4 pb-2">
          <div className="flex gap-1.5">
            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${regionColors[spv.region]}`}>{spv.region}</span>
            <Badge variant={spv.status === 'live' ? 'success' : spv.status === 'draft' ? 'secondary' : spv.status === 'rejected' ? 'destructive' : spv.status === 'approved' ? 'default' : 'warning'} className="text-xs">{spv.status === 'live' ? 'Live' : spv.status === 'draft' ? 'Draft' : spv.status === 'rejected' ? 'Rejected' : spv.status === 'approved' ? 'Approved' : 'Pending'}</Badge>
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
            <span className="font-semibold text-sky-600">{pct}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-sky-500"
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
          <div className="bg-sky-50 rounded-lg p-2 text-center">
            <p className="text-[10px] text-gray-400">APY</p>
            <p className="text-xs font-bold text-sky-700 mt-0.5">{spv.targetAPY ? `${spv.targetAPY}%` : '—'}</p>
          </div>
        </div>

        {docCount < 3 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 mb-3">
            <AlertTriangle size={11} className="text-amber-400" />
            {docCount}/3 documents uploaded
          </div>
        )}

        <button
          onClick={() => onView(spv)}
          className="w-full text-sm font-medium text-sky-600 border border-sky-200 py-2 rounded-xl hover:bg-sky-50 transition-colors"
        >
          {viewOnly ? 'View' : 'View & Edit'}
        </button>
        {onAssignManager && (
          <button
            onClick={() => onAssignManager(spv)}
            className="w-full mt-2 text-xs font-medium text-gray-600 border border-gray-200 py-1.5 rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-1.5"
          >
            <Users size={12} />
            {assignedMgr ? assignedMgr.name : 'Assign Manager'}
          </button>
        )}
      </div>
    </div>
  )
}

// ── SPV Row (compact list) ────────────────────────────────────────────────────

function SpvRow({ spv, onView, viewOnly = false, onAssignManager = null, showManagerCol = false }) {
  const assignedMgr = showManagerCol ? SPV_MANAGERS.find(m => m.id === spv.assignedManagerId) : null
  const ss = {
    live:     { dot: 'bg-green-500', label: 'Live'     },
    approved: { dot: 'bg-sky-500',   label: 'Approved' },
    pending:  { dot: 'bg-amber-400', label: 'Pending'  },
    draft:    { dot: 'bg-gray-400',  label: 'Draft'    },
    rejected: { dot: 'bg-red-400',   label: 'Rejected' },
  }
  const s = ss[spv.status] || ss.draft
  return (
    <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
      {spv.coverImage
        ? <img src={spv.coverImage} alt="" className="w-12 h-9 rounded-lg object-cover flex-shrink-0" />
        : <div className="w-12 h-9 rounded-lg bg-sky-50 flex items-center justify-center flex-shrink-0"><Building2 size={15} className="text-sky-400" /></div>
      }
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate">{spv.propertyDisplayName || spv.legalName}</p>
        <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
          {spv.propertyAddress
            ? <><MapPin size={10} /><span className="truncate">{spv.propertyAddress}</span></>
            : <span>{spv.region} · {spv.propertyType}</span>
          }
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
        <div className="w-28 bg-gray-50 rounded-lg px-2.5 py-1.5 text-center">
          <p className="text-[9px] text-gray-400">Valuation</p>
          <p className="text-xs font-bold text-gray-800 tabular-nums truncate">{spv.totalValuation > 0 ? fmtCHF(spv.totalValuation) : '—'}</p>
        </div>
        <div className="w-14 bg-sky-50 rounded-lg px-2.5 py-1.5 text-center">
          <p className="text-[9px] text-gray-400">APY</p>
          <p className="text-xs font-bold text-sky-700">{spv.targetAPY ? `${spv.targetAPY}%` : '—'}</p>
        </div>
        <span className="inline-flex items-center justify-center gap-1.5 w-[88px] text-xs font-medium py-1 rounded-full bg-white border border-gray-200 text-gray-600 flex-shrink-0">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />{s.label}
        </span>
      </div>
      <div className="flex sm:hidden flex-shrink-0">
        <span className="inline-flex items-center justify-center gap-1.5 w-[88px] text-xs font-medium py-1 rounded-full bg-white border border-gray-200 text-gray-600">
          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />{s.label}
        </span>
      </div>
      {showManagerCol && (
        onAssignManager ? (
          <button
            onClick={() => onAssignManager(spv)}
            className="hidden sm:flex items-center justify-center gap-1.5 w-[140px] text-xs font-medium text-gray-600 border border-gray-200 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors flex-shrink-0"
          >
            <Users size={11} />
            <span className="truncate">{assignedMgr ? assignedMgr.name : 'Assign Manager'}</span>
          </button>
        ) : (
          <div className="hidden sm:block w-[140px] flex-shrink-0" />
        )
      )}
      <button
        onClick={() => onView(spv)}
        className="hidden sm:flex items-center justify-center gap-1.5 w-[108px] text-xs font-medium text-sky-600 border border-sky-200 px-3 py-1.5 rounded-xl hover:bg-sky-50 transition-colors flex-shrink-0"
      >
        {viewOnly ? 'View' : 'View & Edit'} <ArrowRight size={11} />
      </button>
    </div>
  )
}

// ── Legal defaults generator ──────────────────────────────────────────────────

const LEGAL_ADDRESSES = {
  'US': [
    '100 Market Street, San Francisco, CA 94105',
    '350 Fifth Avenue, New York, NY 10118',
    '233 S Wacker Dr, Chicago, IL 60606',
    '400 Broad St, Seattle, WA 98109',
    '1 Financial Center, Boston, MA 02111',
    '2200 Ross Ave, Dallas, TX 75201',
    '200 S Orange Ave, Orlando, FL 32801',
    '9600 Wilshire Blvd, Beverly Hills, CA 90210',
  ],
  'Switzerland': [
    '44 Bahnhofstrasse, 8001 Zürich, Switzerland',
    '12 Rue du Rhône, 1204 Geneva, Switzerland',
    '3 Aeschenplatz, 4052 Basel, Switzerland',
    '18 Bundesgasse, 3011 Bern, Switzerland',
    '7 Kapellgasse, 6000 Lucerne, Switzerland',
    '25 Marktgasse, 8400 Winterthur, Switzerland',
  ],
  'Rest of Europe': [
    '14 Friedrichstrasse, 10117 Berlin, Germany',
    '22 Neue Mainzer Str., 60311 Frankfurt, Germany',
    '5 Herengracht, 1015 Amsterdam, Netherlands',
    '38 Rue de Rivoli, 75001 Paris, France',
    '11 Ringstraße, 1010 Vienna, Austria',
    '42 Passeig de Gràcia, 08007 Barcelona, Spain',
    '18 Corso Italia, 20122 Milan, Italy',
  ],
}

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function rpad(n, len) { return String(n).padStart(len, '0') }

function generateLegalDefaults(region) {
  const incorporationDate = `${randInt(2018, 2023)}-${rpad(randInt(1, 12), 2)}-${rpad(randInt(1, 28), 2)}`
  const registeredAddress = pickRandom(LEGAL_ADDRESSES[region] || LEGAL_ADDRESSES['Rest of Europe'])

  let companyUID, bankIBAN
  if (region === 'US') {
    companyUID = `EIN-${rpad(randInt(10, 99), 2)}-${rpad(randInt(1000000, 9999999), 7)}`
    bankIBAN   = `US00-${pickRandom(['BOFA', 'JPM', 'WFC', 'CITI', 'USB', 'HUNT'])}-${rpad(randInt(1000000000, 9999999999), 10)}`
  } else if (region === 'Switzerland') {
    companyUID = `CHE-${rpad(randInt(100, 999), 3)}.${rpad(randInt(100, 999), 3)}.${rpad(randInt(100, 999), 3)}`
    bankIBAN   = `CH${rpad(randInt(10, 99), 2)} ${rpad(randInt(1000, 9999), 4)} ${rpad(randInt(1000, 9999), 4)} ${rpad(randInt(1000, 9999), 4)} ${rpad(randInt(1000, 9999), 4)} ${randInt(0, 9)}`
  } else {
    companyUID = `HRB-${rpad(randInt(100000, 999999), 6)}`
    bankIBAN   = `DE${rpad(randInt(10, 99), 2)} ${rpad(randInt(1000, 9999), 4)} ${rpad(randInt(1000, 9999), 4)} ${rpad(randInt(1000000, 9999999), 7)} ${rpad(randInt(100, 999), 3)}`
  }
  return { companyUID, incorporationDate, bankIBAN, registeredAddress }
}

// ── Main Component ────────────────────────────────────────────────────────────

const REGION_DEFAULT_LEGAL = { 'US': 'LLC', 'Switzerland': 'AG', 'Rest of Europe': 'GmbH' }
const QC_EMPTY = { region: 'Switzerland', legalForm: 'AG', legalName: '', propertyDisplayName: '', propertyType: 'Residential' }

export function AdminSPV() {
  const { user } = useAuth()
  const { spvs: spvList, addSpv, updateSpv } = useData()
  const location = useLocation()
  const isSpvManager = user?.role === 'spv_manager'
  const [view,             setView]            = useState('list')
  const [listMode,         setListMode]        = useState('cards')
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
  const [activeTab,         setActiveTab]       = useState('A')
  const [saveSuccess,       setSaveSuccess]     = useState(false)
  const [apyModal,          setApyModal]        = useState(false)
  const [rejectModal,       setRejectModal]     = useState(false)
  const [rejectComment,     setRejectComment]   = useState('')
  const [rejectError,       setRejectError]     = useState('')
  const [assignModal,       setAssignModal]     = useState(null)

  const filtered = spvList.filter(s => {
    const matchRegion = regionFilter === 'All' || s.region === regionFilter
    const matchStatus = statusFilter === 'all' ||
      (statusFilter === 'live'     && s.status === 'live') ||
      (statusFilter === 'approved' && s.status === 'approved') ||
      (statusFilter === 'review'   && s.status === 'pending') ||
      (statusFilter === 'draft'    && s.status === 'draft') ||
      (statusFilter === 'rejected' && s.status === 'rejected')
    return matchRegion && matchStatus
  })

  const countFor = (region, status) => spvList.filter(s => {
    const mr = region === 'All' || s.region === region
    const ms = status === 'all' ||
      (status === 'live'     && s.status === 'live') ||
      (status === 'approved' && s.status === 'approved') ||
      (status === 'review'   && s.status === 'pending') ||
      (status === 'draft'    && s.status === 'draft') ||
      (status === 'rejected' && s.status === 'rejected')
    return mr && ms
  }).length

  // ── Auto-open SPV from navigation state (e.g. from My Properties page) ──────

  useEffect(() => {
    const id = location.state?.openSpvId
    if (id) {
      const spv = spvList.find(s => s.id === id)
      if (spv) {
        setCurrentSpv(spv)
        setEditForm(spvToForm(spv))
        setExpanded(new Set())
        setActiveTab('A')
        setView('detail')
      }
    }
  }, [location.state?.openSpvId, spvList])

  // ── Handlers ───────────────────────────────────────────────────────────────

  const openDetail = (spv, defaultExpanded = new Set()) => {
    setCurrentSpv(spv)
    setEditForm(spvToForm(spv))
    setExpanded(defaultExpanded)
    setActiveTab('A')
    setView('detail')
  }

  const handleQuickCreate = () => {
    const e = {}
    if (!qcForm.legalName.trim())           e.legalName = 'Required'
    if (!qcForm.propertyDisplayName.trim()) e.propertyDisplayName = 'Required'
    if (Object.keys(e).length) { setQcErrors(e); return }

    const legalDefaults = generateLegalDefaults(qcForm.region)
    const draft = {
      id:                  `spv-${Date.now()}`,
      status:              'draft',
      createdDate:          new Date().toISOString().split('T')[0],
      region:               qcForm.region,
      legalName:            qcForm.legalName.trim(),
      legalForm:            qcForm.legalForm,
      ...legalDefaults,
      propertyDisplayName:  qcForm.propertyDisplayName.trim(),
      propertyType:         qcForm.propertyType,
      propertyAddress:      legalDefaults.registeredAddress,
      yearBuilt: null, yearRenovated: null, totalArea: 0, numberOfUnits: 0,
      totalValuation: 0, outstandingDebt: 0, totalBricks: 0, pricePerBrick: 0,
      targetAPY: 0, platformFee: 1.5, managementFee: 8.0, liquidityPoolPct: 2.5,
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
      if (['totalValuation', 'outstandingDebt', 'totalBricks'].includes(field) && next.totalValuation && next.totalBricks) {
        const netEquity = parseFloat(next.totalValuation) - (parseFloat(next.outstandingDebt) || 0)
        next.pricePerBrick = (netEquity / parseFloat(next.totalBricks)).toFixed(2)
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
    targetAPY:        parseFloat(f.targetAPY)         || 0,
    sponsorEquityPct: parseFloat(f.sponsorEquityPct) || 0,
    liquidityPoolPct: parseFloat(f.liquidityPoolPct) || 0,
    platformFee:      parseFloat(f.platformFee)      || 0,
    managementFee:   parseFloat(f.managementFee)    || 0,
    coverImage: f.coverImage,
    documents: { foundation: f.docFoundation, deed: f.docDeed, appraisal: f.docAppraisal },
    assignedManagerId: f.assignedManagerId,
    ...extra,
  })

  const handleSave = () => {
    const updated = buildUpdated(editForm)
    updateSpv(updated.id, updated)
    if (currentSpv.status === 'draft') {
      setCurrentSpv(updated)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 2500)
    } else {
      setView('list')
    }
  }

  const handleSubmitForReview = () => {
    const updated = buildUpdated(editForm, { status: 'pending' })
    updateSpv(updated.id, updated)
    setStatusFilter('review')
    setView('list')
  }

  const handleApprove = () => {
    updateSpv(currentSpv.id, { status: 'approved' })
    setCurrentSpv(prev => ({ ...prev, status: 'approved' }))
    setStatusFilter('approved')
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
    const isReadOnly = !isSpvManager || currentSpv.status !== 'draft'
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
              <Badge variant={currentSpv.status === 'live' ? 'success' : currentSpv.status === 'draft' ? 'secondary' : currentSpv.status === 'rejected' ? 'destructive' : currentSpv.status === 'approved' ? 'default' : 'warning'}>{currentSpv.status === 'live' ? 'Live' : currentSpv.status === 'draft' ? 'Draft' : currentSpv.status === 'rejected' ? 'Rejected' : currentSpv.status === 'approved' ? 'Approved' : 'Pending'}</Badge>
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
            <div className="bg-gray-50 border border-gray-200 border-l-4 border-l-red-400 rounded-r-xl px-4 py-3 flex gap-3">
              <XCircle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-gray-800">Rejection Reason</p>
                <p className="text-sm text-gray-600 mt-0.5">{currentSpv.rejectionComment}</p>
              </div>
            </div>
          )}

          {/* Completion tracker — only shown in non-draft collapsible view */}
          {currentSpv.status !== 'draft' && <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-700">Profile Completion</p>
              <p className="text-sm font-bold text-sky-600">{pct}%</p>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-3">
              <div
                className="h-full rounded-full transition-all duration-500 bg-sky-500"
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
                      done ? 'bg-sky-100 text-sky-700' : part ? 'bg-sky-50 text-sky-500' : 'bg-gray-100 text-gray-400'
                    }`}>{s}</div>
                    <span className="text-[10px] text-gray-400">{c.filled}/{c.total}</span>
                  </button>
                )
              })}
            </div>
          </div>}

          {lexKoller && (
            <div className="flex items-start gap-3 bg-gray-50 border border-gray-200 border-l-4 border-l-amber-400 rounded-r-xl px-4 py-3">
              <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-700">
                <span className="font-bold">Lex Koller Active</span> — Residential property. Non-Swiss holders will be automatically blocked from purchasing Bricks.
              </p>
            </div>
          )}

          {currentSpv.status === 'draft' ? (
            /* ── TAB VIEW (Draft editing) ────────────────────────────── */
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              {/* Tab bar */}
              <div className="flex border-b border-gray-100">
                {[
                  { id: 'A', label: 'Legal'      },
                  { id: 'B', label: 'Property'   },
                  { id: 'C', label: 'Financial'  },
                  { id: 'D', label: 'Documents'  },
                  { id: 'E', label: 'Management' },
                ].map((tab, i) => {
                  const c = comp[tab.id]
                  const done    = c.filled === c.total
                  const partial = c.filled > 0 && !done
                  const active  = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 border-b-2 text-xs font-semibold transition-colors ${
                        active ? 'border-sky-600 text-sky-700 bg-sky-50' : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                      } ${i > 0 ? 'border-l border-l-gray-100' : ''}`}
                    >
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        done ? 'bg-sky-100 text-sky-700' : partial ? 'bg-sky-50 text-sky-500' : active ? 'bg-sky-100 text-sky-700' : 'bg-gray-100 text-gray-400'
                      }`}>{tab.id}</div>
                      <span className="hidden sm:block">{tab.label}</span>
                      <span className={`text-[10px] font-normal tabular-nums ${done ? 'text-sky-600' : partial ? 'text-sky-400' : 'text-gray-400'}`}>
                        {done ? '✓ done' : `${c.filled}/${c.total}`}
                      </span>
                    </button>
                  )
                })}
              </div>

              {/* Tab content */}
              <div className="p-6">

                {activeTab === 'A' && (
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
                      <ToggleGroup
                      options={LEGAL_FORMS}
                      value={editForm.legalForm}
                      onChange={setField('legalForm')}
                      tooltips={{
                        AG:   'Aktiengesellschaft — Joint-stock company. Min. share capital CHF 100,000. Standard for larger SPVs; shares transfer freely between investors.',
                        GmbH: 'Gesellschaft mit beschränkter Haftung — Limited liability company. Min. share capital CHF 20,000. Lower capital requirement but ownership stakes are less liquid.',
                        LLC:  'Limited Liability Company — US-domiciled entity. Flexible structure with pass-through taxation; commonly used for US real estate SPVs.',
                      }}
                    />
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
                )}

                {activeTab === 'B' && (
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
                          'Residential':  'border-sky-500 bg-sky-50 text-sky-700',
                          'Commercial':   'border-blue-600 bg-blue-50 text-blue-700',
                          'Multi-Family': 'border-sky-600 bg-sky-100 text-sky-800',
                          'Industrial':   'border-slate-500 bg-slate-50 text-slate-700',
                          'Hospitality':  'border-amber-500 bg-amber-50 text-amber-700',
                          'Mixed-Use':    'border-indigo-500 bg-indigo-50 text-indigo-700',
                        }}
                      />
                    </div>
                    {lexKoller && (
                      <div className="sm:col-span-2 flex items-center gap-2 bg-gray-50 border border-gray-200 border-l-4 border-l-amber-400 rounded-r-lg px-3 py-2 text-xs text-gray-600">
                        <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
                        Lex Koller: Swiss-only sale restriction will apply to this property.
                      </div>
                    )}
                    <div>
                      <Label>Year Built</Label>
                      <Input type="text" value={editForm.yearBuilt} onChange={setField('yearBuilt')} placeholder="e.g. 1998" />
                    </div>
                    <div>
                      <Label>Year Renovated</Label>
                      <Input type="text" value={editForm.yearRenovated} onChange={setField('yearRenovated')} placeholder="e.g. 2021" />
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
                )}

                {activeTab === 'C' && (() => {
                  const sponsorPct     = Math.min(100, Math.max(0, parseFloat(editForm.sponsorEquityPct) || 0))
                  const liquidityPct   = Math.min(100 - sponsorPct, Math.max(0, parseFloat(editForm.liquidityPoolPct) || 0))
                  const publicPct      = 100 - sponsorPct - liquidityPct
                  const totalBricks    = parseInt(editForm.totalBricks) || 0
                  const retainedBricks = Math.round(totalBricks * sponsorPct / 100)
                  const publicBricks   = totalBricks - retainedBricks
                  const pricePB        = parseFloat(editForm.pricePerBrick) || 0
                  const totalMintValue = totalBricks * pricePB
                  const publicRaise    = publicBricks * pricePB
                  return (
                    <div className="space-y-4">
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
                          <Input type="number" value={editForm.pricePerBrick} onChange={setField('pricePerBrick')} placeholder="(Valuation − Debt) ÷ Bricks" disabled={!!(editForm.totalValuation && editForm.totalBricks)} />
                        </div>
                        <div>
                          <Label>Sponsor Retained Equity (%)</Label>
                          <Input type="number" value={editForm.sponsorEquityPct} onChange={setField('sponsorEquityPct')} placeholder="e.g. 30" />
                        </div>
                        <div>
                          <Label info="A small percentage (e.g., 2% - 5%) minted and instantly locked into a smart contract to act as the automated market maker (AMM) for future peer-to-peer trading.">Liquidity Pool (%)</Label>
                          <Input type="number" value={editForm.liquidityPoolPct} onChange={setField('liquidityPoolPct')} placeholder="e.g. 3" />
                        </div>
                        <div>
                          <Label>Available for Public (%)</Label>
                          <Input type="number" value={publicPct.toFixed(1)} onChange={() => {}} disabled />
                        </div>
                        {totalBricks > 0 && (
                          <div className="sm:col-span-2 flex gap-3">
                            <div className="flex-1 bg-sky-50 border border-sky-100 rounded-lg px-3 py-2 flex items-center justify-between">
                              <span className="text-xs text-sky-400 font-semibold uppercase tracking-wider">Retained Bricks</span>
                              <div className="text-right">
                                <span className="text-sm font-bold text-sky-700">{retainedBricks.toLocaleString()}</span>
                                <span className="text-[10px] text-sky-400 ml-1.5"> Units @ {sponsorPct}%</span>
                              </div>
                            </div>
                            <div className="flex-1 bg-sky-50 border border-sky-100 rounded-lg px-3 py-2 flex items-center justify-between">
                              <span className="text-xs text-sky-400 font-semibold uppercase tracking-wider">Offered Bricks</span>
                              <div className="text-right">
                                <span className="text-sm font-bold text-sky-700">{publicBricks.toLocaleString()}</span>
                                <span className="text-[10px] text-sky-400 ml-1.5"> Units @ {publicPct.toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>
                        )}
                        <div>
                          <Label info="Charged on Total Net Equity (Asset Value − Outstanding Debt). This is the platform's annual fee for tokenizing and managing the SPV.">Platform Fee (%)</Label>
                          <Input type="number" value={editForm.platformFee} onChange={setField('platformFee')} placeholder="1.5" />
                          <p className="text-[10px] text-gray-400 mt-1">Default: 1.5% · basis: Net Equity</p>
                        </div>
                        <div>
                          <Label info="Charged on monthly Rental Income collected from tenants. Covers day-to-day property operations, maintenance, and tenant management.">Property Management Fee (%)</Label>
                          <Input type="number" value={editForm.managementFee} onChange={setField('managementFee')} placeholder="8.0" />
                          <p className="text-[10px] text-gray-400 mt-1">Default: 8.0% · basis: Rental Income</p>
                        </div>
                        <div className="sm:col-span-2">
                          <Label info="Annual Percentage Yield — the projected yearly return to Brick holders from rental income, expressed as a percentage of the Brick purchase price.">Target APY (%)</Label>
                          <div className="flex items-center gap-3">
                            <div className="w-36 flex-shrink-0">
                              <Input type="number" value={editForm.targetAPY} onChange={setField('targetAPY')} placeholder="e.g. 4.2" />
                            </div>
                            <button type="button" onClick={() => setApyModal(true)} className="flex items-center gap-1 text-[10px] text-sky-700 bg-sky-50 border border-sky-200 rounded-full px-2 py-0.5 hover:bg-sky-100 transition-colors whitespace-nowrap">
                              <BookOpen size={10} /> Underwriting Report
                            </button>
                          </div>
                        </div>
                      </div>
                      {editForm.totalValuation && editForm.totalBricks && (
                        <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                          <div><p className="text-[10px] text-gray-400">Net Equity</p><p className="font-bold text-sky-700">{fmtCHF(parseFloat(editForm.totalValuation) - (parseFloat(editForm.outstandingDebt) || 0))}</p></div>
                          <div><p className="text-[10px] text-gray-400">Price / Brick</p><p className="font-bold text-sky-700">{fmtCHF(pricePB)}</p></div>
                          <div><p className="text-[10px] text-gray-400">Total Mint Value</p><p className="font-bold text-sky-700">{fmtCHF(totalMintValue)}</p></div>
                          <div><p className="text-[10px] text-gray-400">Public Raise</p><p className="font-bold text-sky-700">{fmtCHF(publicRaise)}</p></div>
                        </div>
                      )}
                    </div>
                  )
                })()}

                {activeTab === 'D' && (
                  <div className="space-y-4">
                    <div>
                      <Label>Cover Image URL</Label>
                      <Input value={editForm.coverImage} onChange={setField('coverImage')} placeholder="https://..." />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Legal Documents</p>
                      <DocUpload label="SPV Foundation Document" uploaded={editForm.docFoundation} onToggle={() => setField('docFoundation')(!editForm.docFoundation)} />
                      <DocUpload label="Property Deed"           uploaded={editForm.docDeed}       onToggle={() => setField('docDeed')(!editForm.docDeed)} />
                      <DocUpload label="Appraisal Report"        uploaded={editForm.docAppraisal}  onToggle={() => setField('docAppraisal')(!editForm.docAppraisal)} />
                    </div>
                  </div>
                )}

                {activeTab === 'E' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {SPV_MANAGERS.map(mgr => (
                      <button
                        key={mgr.id}
                        type="button"
                        onClick={() => setField('assignedManagerId')(mgr.id)}
                        className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
                          editForm.assignedManagerId === mgr.id ? 'border-sky-500 bg-sky-50' : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-600 flex-shrink-0">
                          {mgr.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 text-sm truncate">{mgr.name}</p>
                          <p className="text-xs text-gray-400 truncate">{mgr.region}</p>
                        </div>
                        {editForm.assignedManagerId === mgr.id && <CheckCircle2 size={15} className="text-sky-500 ml-auto flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}

              </div>
            </div>
          ) : (
            /* ── COLLAPSIBLE VIEW (Pending / Active / Rejected) ──────── */
            <>
              {isReadOnly && currentSpv.status !== 'pending' && (
                <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-500">
                  <Info size={13} className="text-gray-400 flex-shrink-0" />
                  {isSpvManager
                    ? 'View only — contact Admin to modify a submitted SPV'
                    : 'View only — SPV content is managed by the assigned SPV Manager'}
                </div>
              )}
              <CollapsibleSection icon={Landmark} color="sky" title="SPV Legal Details" subtitle="Company registration, UID, IBAN and address" completion={comp.A} expanded={expandedSections.has('A')} onToggle={() => toggleSection('A')} readOnly={isReadOnly}>
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
                    <ToggleGroup
                      options={LEGAL_FORMS}
                      value={editForm.legalForm}
                      onChange={setField('legalForm')}
                      tooltips={{
                        AG:   'Aktiengesellschaft — Joint-stock company. Min. share capital CHF 100,000. Standard for larger SPVs; shares transfer freely between investors.',
                        GmbH: 'Gesellschaft mit beschränkter Haftung — Limited liability company. Min. share capital CHF 20,000. Lower capital requirement but ownership stakes are less liquid.',
                        LLC:  'Limited Liability Company — US-domiciled entity. Flexible structure with pass-through taxation; commonly used for US real estate SPVs.',
                      }}
                    />
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

              <CollapsibleSection icon={Building2} color="violet" title="Property Details" subtitle="Physical asset type, dimensions and address" completion={comp.B} expanded={expandedSections.has('B')} onToggle={() => toggleSection('B')} readOnly={isReadOnly}>
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
                    <ToggleGroup options={PROPERTY_TYPES} value={editForm.propertyType} onChange={setField('propertyType')} colorMap={{ 'Residential': 'border-sky-500 bg-sky-50 text-sky-700', 'Commercial': 'border-blue-600 bg-blue-50 text-blue-700', 'Multi-Family': 'border-sky-600 bg-sky-100 text-sky-800', 'Industrial': 'border-slate-500 bg-slate-50 text-slate-700', 'Hospitality': 'border-amber-500 bg-amber-50 text-amber-700', 'Mixed-Use': 'border-indigo-500 bg-indigo-50 text-indigo-700' }} />
                  </div>
                  {lexKoller && (
                    <div className="sm:col-span-2 flex items-center gap-2 bg-gray-50 border border-gray-200 border-l-4 border-l-amber-400 rounded-r-lg px-3 py-2 text-xs text-gray-600">
                      <AlertTriangle size={12} className="text-amber-500 flex-shrink-0" />
                      Lex Koller: Swiss-only sale restriction will apply to this property.
                    </div>
                  )}
                  <div><Label>Year Built</Label><Input type="text" value={editForm.yearBuilt} onChange={setField('yearBuilt')} placeholder="e.g. 1998" /></div>
                  <div><Label>Year Renovated</Label><Input type="text" value={editForm.yearRenovated} onChange={setField('yearRenovated')} placeholder="e.g. 2021" /></div>
                  <div><Label>Total Area (sqm)</Label><Input type="number" value={editForm.totalArea} onChange={setField('totalArea')} placeholder="e.g. 1250" /></div>
                  <div><Label>Number of Units</Label><Input type="number" value={editForm.numberOfUnits} onChange={setField('numberOfUnits')} placeholder="e.g. 12" /></div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection icon={BarChart3} color="green" title="Financial &amp; Tokenization" subtitle="Valuation, Brick structure and yield" completion={comp.C} expanded={expandedSections.has('C')} onToggle={() => toggleSection('C')} readOnly={isReadOnly}>
                {(() => {
                  const sponsorPct = Math.min(100, Math.max(0, parseFloat(editForm.sponsorEquityPct) || 0))
                  const liquidityPct = Math.min(100 - sponsorPct, Math.max(0, parseFloat(editForm.liquidityPoolPct) || 0))
                  const publicPct = 100 - sponsorPct - liquidityPct
                  const totalBricks = parseInt(editForm.totalBricks) || 0
                  const retainedBricks = Math.round(totalBricks * sponsorPct / 100)
                  const publicBricks = totalBricks - retainedBricks
                  const pricePB = parseFloat(editForm.pricePerBrick) || 0
                  return (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div><Label required>Total Valuation (CHF)</Label><Input type="number" value={editForm.totalValuation} onChange={setField('totalValuation')} placeholder="e.g. 8500000" /></div>
                        <div><Label>Outstanding Debt (CHF)</Label><Input type="number" value={editForm.outstandingDebt} onChange={setField('outstandingDebt')} placeholder="e.g. 2100000" /></div>
                        <div><Label required>Total Bricks to Mint</Label><Input type="number" value={editForm.totalBricks} onChange={setField('totalBricks')} placeholder="e.g. 10000" /></div>
                        <div><Label>Price per Brick (CHF)</Label><Input type="number" value={editForm.pricePerBrick} onChange={setField('pricePerBrick')} placeholder="(Valuation − Debt) ÷ Bricks" disabled={!!(editForm.totalValuation && editForm.totalBricks)} /></div>
                        <div><Label>Sponsor Retained Equity (%)</Label><Input type="number" value={editForm.sponsorEquityPct} onChange={setField('sponsorEquityPct')} placeholder="e.g. 30" /></div>
                        <div><Label info="A small percentage (e.g., 2% - 5%) minted and instantly locked into a smart contract to act as the automated market maker (AMM) for future peer-to-peer trading.">Liquidity Pool (%)</Label><Input type="number" value={editForm.liquidityPoolPct} onChange={setField('liquidityPoolPct')} placeholder="e.g. 3" /></div>
                        <div><Label>Available for Public (%)</Label><Input type="number" value={publicPct.toFixed(1)} onChange={() => {}} disabled /></div>
                        <div><Label info="Charged on Total Net Equity (Asset Value − Outstanding Debt).">Platform Fee (%)</Label><Input type="number" value={editForm.platformFee} onChange={setField('platformFee')} placeholder="1.5" /></div>
                        <div><Label info="Charged on monthly Rental Income collected from tenants.">Property Management Fee (%)</Label><Input type="number" value={editForm.managementFee} onChange={setField('managementFee')} placeholder="8.0" /></div>
                        <div>
                          <Label info="Annual Percentage Yield — the projected yearly return to Brick holders from rental income, expressed as a percentage of the Brick purchase price.">Target APY (%)</Label>
                          <div className="flex items-center gap-3">
                            <div className="w-36 flex-shrink-0">
                              <Input type="number" value={editForm.targetAPY} onChange={setField('targetAPY')} placeholder="e.g. 4.2" />
                            </div>
                            <button type="button" onClick={() => setApyModal(true)} className="flex items-center gap-1 text-[10px] text-sky-700 bg-sky-50 border border-sky-200 rounded-full px-2 py-0.5 hover:bg-sky-100 transition-colors whitespace-nowrap">
                              <BookOpen size={10} /> Underwriting Report
                            </button>
                          </div>
                        </div>
                      </div>
                      {editForm.totalValuation && editForm.totalBricks && (
                        <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                          <div><p className="text-[10px] text-gray-400">Net Equity</p><p className="font-bold text-sky-700">{fmtCHF(parseFloat(editForm.totalValuation) - (parseFloat(editForm.outstandingDebt) || 0))}</p></div>
                          <div><p className="text-[10px] text-gray-400">Price / Brick</p><p className="font-bold text-sky-700">{fmtCHF(pricePB)}</p></div>
                          <div><p className="text-[10px] text-gray-400">Total Mint Value</p><p className="font-bold text-sky-700">{fmtCHF(totalBricks * pricePB)}</p></div>
                          <div><p className="text-[10px] text-gray-400">Public Raise</p><p className="font-bold text-sky-700">{fmtCHF(publicBricks * pricePB)}</p></div>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </CollapsibleSection>

              <CollapsibleSection icon={FileText} color="amber" title="Media &amp; Documents" subtitle="Cover image and three required legal PDFs" completion={comp.D} expanded={expandedSections.has('D')} onToggle={() => toggleSection('D')} readOnly={isReadOnly}>
                <div className="space-y-4">
                  <div><Label>Cover Image URL</Label><Input value={editForm.coverImage} onChange={setField('coverImage')} placeholder="https://..." /></div>
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Legal Documents</p>
                    <DocUpload label="SPV Foundation Document" uploaded={editForm.docFoundation} onToggle={() => setField('docFoundation')(!editForm.docFoundation)} />
                    <DocUpload label="Property Deed"           uploaded={editForm.docDeed}       onToggle={() => setField('docDeed')(!editForm.docDeed)} />
                    <DocUpload label="Appraisal Report"        uploaded={editForm.docAppraisal}  onToggle={() => setField('docAppraisal')(!editForm.docAppraisal)} />
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection icon={Users} color="gray" title="Management" subtitle="Assign an SPV Manager who will operate this property" completion={comp.E} expanded={expandedSections.has('E')} onToggle={() => toggleSection('E')} readOnly={isReadOnly}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SPV_MANAGERS.map(mgr => (
                    <button key={mgr.id} type="button" onClick={() => setField('assignedManagerId')(mgr.id)}
                      className={`flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${editForm.assignedManagerId === mgr.id ? 'border-sky-500 bg-sky-50' : 'border-gray-200 hover:border-gray-300'}`}>
                      <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-600 flex-shrink-0">
                        {mgr.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm truncate">{mgr.name}</p>
                        <p className="text-xs text-gray-400 truncate">{mgr.region}</p>
                      </div>
                      {editForm.assignedManagerId === mgr.id && <CheckCircle2 size={15} className="text-sky-500 ml-auto flex-shrink-0" />}
                    </button>
                  ))}
                </div>
              </CollapsibleSection>
            </>
          )}

          {/* Action bar */}
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setView('list')}>Back to List</Button>

            {/* Draft: Save + Submit for Review — SPV Manager only */}
            {currentSpv.status === 'draft' && isSpvManager && <>
              <Button
                onClick={handleSave}
                className={`flex items-center gap-2 transition-colors ${saveSuccess ? 'bg-sky-700 hover:bg-sky-800' : ''}`}
              >
                {saveSuccess ? <><CheckCircle2 size={15} /> Saved!</> : <><Save size={15} /> Save Changes</>}
              </Button>
              <Button onClick={handleSubmitForReview} className="flex-1 flex items-center justify-center gap-2">
                <Send size={15} /> Submit for Review
              </Button>
            </>}

            {/* Pending: Reject + Approve — Admin only */}
            {currentSpv.status === 'pending' && !isSpvManager && <>
              <Button
                onClick={() => { setRejectComment(''); setRejectError(''); setRejectModal(true) }}
                variant="destructive"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <XCircle size={15} /> Reject
              </Button>
              <Button
                onClick={handleApprove}
                className="flex-1 flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={15} /> Approve
              </Button>
            </>}
            {currentSpv.status === 'pending' && isSpvManager && (
              <p className="flex-1 text-center text-xs text-gray-500 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-200">
                Submitted for review — awaiting Admin approval
              </p>
            )}

            {/* Live: Save only (Admin) */}
            {currentSpv.status === 'live' && !isReadOnly && (
              <Button onClick={handleSave} className="flex-1 flex items-center justify-center gap-2">
                <Save size={15} /> Save Changes
              </Button>
            )}

            {/* Rejected: Return to Draft — SPV Manager only */}
            {currentSpv.status === 'rejected' && isSpvManager && (
              <Button onClick={handleReturnToDraft} className="flex-1 flex items-center justify-center gap-2">
                <ArrowLeft size={15} /> Return to Draft
              </Button>
            )}
          </div>

          {/* APY Underwriting Report Modal */}
          <Modal open={apyModal} onClose={() => setApyModal(false)} title="APY Underwriting Report">
            {(() => {
              const tv  = parseFloat(editForm?.totalValuation)  || 0
              const od  = parseFloat(editForm?.outstandingDebt) || 0
              const pf  = parseFloat(editForm?.platformFee)     || 1.5
              const mf  = parseFloat(editForm?.managementFee)   || 8
              const apy = parseFloat(editForm?.targetAPY)       || 0
              const netEquity        = tv - od
              const platformFeeAmt   = netEquity * (pf / 100)
              const targetNetIncome  = netEquity * (apy / 100)
              const hasValuation    = tv > 0
              const hasAPY          = apy > 0
              const vacancyRate     = 5    // % vacancy allowance
              const opExPct         = 3    // % operating expenses & taxes
              const assumedDebtRate = 3.5  // % p.a. on outstanding debt
              const debtInterest    = od * (assumedDebtRate / 100)
              const grossDenom      = 1 - (vacancyRate / 100) - (opExPct / 100) - (mf / 100)
              const grossAnnualRent = hasAPY && grossDenom > 0
                ? (targetNetIncome + platformFeeAmt + debtInterest) / grossDenom
                : 0
              const vacancyAmt      = grossAnnualRent * (vacancyRate / 100)
              const opExAmt         = grossAnnualRent * (opExPct / 100)
              const mgmtFeeAmt      = grossAnnualRent * (mf / 100)
              const netRentalIncome = grossAnnualRent - vacancyAmt - opExAmt - debtInterest - mgmtFeeAmt - platformFeeAmt

              const BM = { 'Residential':{min:4,max:7}, 'Multi-Family':{min:5,max:8}, 'Commercial':{min:6,max:9}, 'Industrial':{min:8,max:12}, 'Hospitality':{min:7,max:10}, 'Mixed-Use':{min:5,max:9} }
              const bm = BM[editForm?.propertyType] || { min: 5, max: 9 }
              const scaleMin = Math.max(0, bm.min - 2)
              const scaleMax = bm.max + 2
              const toPos = v => Math.min(100, Math.max(0, ((v - scaleMin) / (scaleMax - scaleMin)) * 100))
              const apyPos = apy > 0 ? toPos(apy) : null
              const apyStatus = apy <= 0 ? null : apy < bm.min ? { label: 'Below Market', color: '#3b82f6' } : apy > bm.max ? { label: 'Above Market', color: '#ef4444' } : { label: 'Market Rate', color: '#16a34a' }
              const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

              return (
                <div className="text-sm space-y-4">

                  {/* Report header */}
                  <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">SPV</p>
                      <p className="font-semibold text-gray-800">{editForm?.propertyDisplayName || currentSpv?.legalName || '—'}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{editForm?.propertyType} · {editForm?.region}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider">Generated</p>
                      <p className="text-xs text-gray-600">{today}</p>
                      <p className="text-[10px] text-sky-500 font-semibold mt-0.5 uppercase tracking-wider">Internal Reference</p>
                    </div>
                  </div>

                  {/* 1 · Formula */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">1 · Core Formula</p>
                    <div className="bg-sky-50 border border-sky-100 rounded-xl px-4 py-3">
                      <p className="font-mono text-sm text-sky-800 font-semibold">APY = Net Rental Income ÷ Net Equity × 100</p>
                      <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
                        <span className="font-medium text-gray-700">Net Rental Income</span> = Gross Rent − Vacancy Buffer − Op. Expenses − Debt Interest − Mgmt Fee − Platform Fee<br />
                        <span className="font-medium text-gray-700">Net Equity</span> = Total Valuation − Outstanding Debt / Mortgage
                      </p>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* 2 · Market Benchmarks + position indicator */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">2 · Market Benchmarks</p>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-3">
                      {[['Residential','4–7%'],['Multi-Family','5–8%'],['Commercial','6–9%'],['Industrial','8–12%'],['Hospitality','7–10%'],['Mixed-Use','5–9%']].map(([type, range]) => {
                        const active = type === editForm?.propertyType
                        return (
                          <div key={type} className={`flex justify-between text-xs py-1.5 border-b border-gray-100 ${active ? 'font-semibold' : ''}`}>
                            <span className={active ? 'text-sky-700' : 'text-gray-500'}>{type}{active ? ' ←' : ''}</span>
                            <span className={active ? 'text-sky-700' : 'text-gray-600'}>{range}</span>
                          </div>
                        )
                      })}
                    </div>
                    {apyPos !== null && (
                      <div className="mt-2">
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                          <span>{scaleMin}%</span>
                          <span style={{ color: apyStatus.color }} className="font-semibold">{apy}% — {apyStatus.label}</span>
                          <span>{scaleMax}%</span>
                        </div>
                        <div className="relative h-3 bg-gray-100 rounded-full">
                          <div className="absolute h-full bg-sky-200 rounded-full" style={{ left: `${toPos(bm.min)}%`, width: `${toPos(bm.max) - toPos(bm.min)}%` }} />
                          <div className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full border-2 border-white shadow -translate-x-1/2" style={{ left: `${apyPos}%`, backgroundColor: apyStatus.color }} />
                        </div>
                        <p className="text-[10px] text-sky-600 text-right mt-0.5">▓ Market range ({bm.min}–{bm.max}%)</p>
                      </div>
                    )}
                  </div>

                  <hr className="border-gray-100" />

                  {/* 3 · Fee Deductions */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">3 · Fee Deductions</p>
                    <div className="divide-y divide-gray-100">
                      <div className="flex justify-between items-center py-2">
                        <div><p className="text-xs font-medium text-gray-700">Platform Fee</p><p className="text-[10px] text-gray-400">Basis: Net Equity · charged annually</p></div>
                        <span className="text-sm font-bold text-gray-800">{pf}%</span>
                      </div>
                      <div className="flex justify-between items-center py-2">
                        <div><p className="text-xs font-medium text-gray-700">Property Management Fee</p><p className="text-[10px] text-gray-400">Basis: Gross Rental Income</p></div>
                        <span className="text-sm font-bold text-gray-800">{mf}%</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-100" />

                  {/* 4 · Worked Calculation */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">4 · Worked Calculation — This SPV</p>
                    {hasValuation ? (
                      <div className="border border-gray-100 rounded-xl overflow-hidden">
                        <table className="w-full text-xs">
                          <tbody className="divide-y divide-gray-100">
                            <tr className="bg-sky-50/70"><td colSpan={2} className="px-3 py-1.5 text-[10px] font-bold text-sky-600 uppercase tracking-wider">Equity Basis</td></tr>
                            <tr className="bg-gray-50"><td className="px-3 py-2 text-gray-500">Total Valuation</td><td className="px-3 py-2 text-right font-mono text-gray-800">{fmtCHF(tv)}</td></tr>
                            <tr className="bg-gray-50"><td className="px-3 py-2 text-gray-500">Less Outstanding Debt / Mortgage</td><td className="px-3 py-2 text-right font-mono text-red-500">− {fmtCHF(od)}</td></tr>
                            <tr className="bg-white font-semibold"><td className="px-3 py-2 text-gray-700">= Net Equity (APY Base)</td><td className="px-3 py-2 text-right font-mono text-sky-700">{fmtCHF(netEquity)}</td></tr>
                            <tr className="bg-sky-50/70"><td colSpan={2} className="px-3 py-1.5 text-[10px] font-bold text-sky-600 uppercase tracking-wider">Rent Waterfall</td></tr>
                            {hasAPY ? (
                              <>
                                <tr className="bg-gray-50"><td className="px-3 py-2 text-gray-700 font-medium">Gross Annual Rent</td><td className="px-3 py-2 text-right font-mono font-semibold text-gray-800">{fmtCHF(grossAnnualRent)}</td></tr>
                                <tr className="bg-gray-50">
                                  <td className="px-3 py-2">
                                    <span className="relative group inline-flex items-center gap-1 text-gray-500 cursor-help">
                                      Less Vacancy Buffer ({vacancyRate}%)
                                      <Info size={10} className="text-gray-400 group-hover:text-sky-500 transition-colors flex-shrink-0" />
                                      <span className="absolute bottom-full left-0 mb-2 w-64 bg-gray-900 text-white text-[11px] leading-relaxed rounded-xl px-3 py-2.5 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity z-50 shadow-xl pointer-events-none normal-case tracking-normal font-normal not-italic">
                                        Vacancy Buffer takes into account shortfall of Rent pa considering Property may not be always full as Tenant has left.
                                        <span className="absolute top-full left-4 border-4 border-transparent border-t-gray-900" />
                                      </span>
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-right font-mono text-red-500">− {fmtCHF(vacancyAmt)}</td>
                                </tr>
                                <tr className="bg-gray-50"><td className="px-3 py-2 text-gray-500">Less Operating Expenses &amp; Taxes ({opExPct}%)</td><td className="px-3 py-2 text-right font-mono text-red-500">− {fmtCHF(opExAmt)}</td></tr>
                                {od > 0 && (
                                  <tr className="bg-gray-50"><td className="px-3 py-2 text-gray-500">Less Debt Interest ({assumedDebtRate}% on {fmtCHF(od)} loan)</td><td className="px-3 py-2 text-right font-mono text-red-500">− {fmtCHF(debtInterest)}</td></tr>
                                )}
                                <tr className="bg-gray-50"><td className="px-3 py-2 text-gray-500">Less Mgmt Fee ({mf}%)</td><td className="px-3 py-2 text-right font-mono text-red-500">− {fmtCHF(mgmtFeeAmt)}</td></tr>
                                <tr className="bg-gray-50"><td className="px-3 py-2 text-gray-500">Less Platform Fee ({pf}% of Net Equity)</td><td className="px-3 py-2 text-right font-mono text-red-500">− {fmtCHF(platformFeeAmt)}</td></tr>
                                <tr className="bg-white font-semibold"><td className="px-3 py-2 text-gray-700">= Net Rental Income</td><td className="px-3 py-2 text-right font-mono text-gray-900 font-semibold">{fmtCHF(netRentalIncome)}</td></tr>
                                <tr className="bg-sky-50"><td className="px-3 py-2 font-bold text-sky-700">Target APY = {fmtCHF(netRentalIncome)} ÷ {fmtCHF(netEquity)} × 100</td><td className="px-3 py-2 text-right font-bold text-sky-700">{apy}%</td></tr>
                              </>
                            ) : (
                              <tr className="bg-gray-50"><td colSpan={2} className="px-3 py-2.5 text-gray-500 text-center italic text-[11px]">Enter Target APY in Section C to complete the rent projection</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic bg-gray-50 rounded-xl px-4 py-3">Enter Total Valuation and Outstanding Debt in Section C to see the equity calculation.</p>
                    )}
                  </div>

                  <hr className="border-gray-100" />

                  {/* 5 · Validation */}
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">5 · Validation Checklist</p>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3">
                      <ul className="text-xs text-gray-600 space-y-1.5">
                        {['Cross-reference local comparable cap rates', 'Apply realistic vacancy rate (typically 5–10%)', 'Verify gross rent estimate against appraisal report', 'Confirm management fee % with property manager', 'Stress-test at 80% occupancy for downside scenario'].map(item => (
                          <li key={item} className="flex items-start gap-2"><span className="text-sky-500 flex-shrink-0 mt-0.5">▸</span>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Disclaimer + Close */}
                  <p className="text-[10px] text-gray-400 leading-relaxed border-t border-gray-100 pt-3">
                    <span className="font-semibold">Disclaimer:</span> Projections are indicative only. Actual yield may vary based on occupancy rates, market conditions, interest rate changes, and applicable regulations. This report does not constitute investment advice.
                  </p>
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setApyModal(false)}>Close</Button>
                  </div>

                </div>
              )
            })()}
          </Modal>

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
                  { key: 'all',      label: 'All',      count: spvList.length,                                                    activeCls: 'bg-sky-600 text-white' },
                  { key: 'live',     label: 'Live',     count: spvList.filter(s => s.status === 'live').length,              activeCls: 'bg-sky-600 text-white' },
                  { key: 'approved', label: 'Approved', count: spvList.filter(s => s.status === 'approved').length,           activeCls: 'bg-sky-600 text-white' },
                  { key: 'review',   label: 'Pending',  count: spvList.filter(s => s.status === 'pending').length,             activeCls: 'bg-sky-600 text-white' },
                  { key: 'draft',    label: 'Draft',    count: spvList.filter(s => s.status === 'draft').length,               activeCls: 'bg-sky-600 text-white' },
                  { key: 'rejected', label: 'Rejected', count: spvList.filter(s => s.status === 'rejected').length,            activeCls: 'bg-sky-600 text-white' },
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
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="flex items-center gap-0.5 bg-gray-100 rounded-lg p-0.5">
              <button
                onClick={() => setListMode('cards')}
                title="Card view"
                className={`p-1.5 rounded-md transition-colors ${listMode === 'cards' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutGrid size={14} />
              </button>
              <button
                onClick={() => setListMode('list')}
                title="List view"
                className={`p-1.5 rounded-md transition-colors ${listMode === 'list' ? 'bg-white shadow-sm text-gray-700' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <LayoutList size={14} />
              </button>
            </div>
            <Button onClick={() => { setQcForm(QC_EMPTY); setQcErrors({}); setQcOpen(true) }} className="flex items-center gap-2">
              <Plus size={14} /> Create SPV
            </Button>
          </div>
        </div>

        {/* SPV list — cards or compact rows */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Building2 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No SPVs match this filter combination.</p>
          </div>
        ) : listMode === 'cards' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map(spv => (
              <SpvCard
                key={spv.id}
                spv={spv}
                onView={openDetail}
                viewOnly={!isSpvManager || spv.status !== 'draft'}
                onAssignManager={!isSpvManager && spv.status === 'live' ? () => setAssignModal(spv) : null}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {filtered.map(spv => (
              <SpvRow
                key={spv.id}
                spv={spv}
                onView={openDetail}
                viewOnly={!isSpvManager || spv.status !== 'draft'}
                showManagerCol={!isSpvManager}
                onAssignManager={!isSpvManager && spv.status === 'live' ? () => setAssignModal(spv) : null}
              />
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
              onChange={v => setQcForm(f => ({ ...f, region: v, legalForm: REGION_DEFAULT_LEGAL[v] || 'AG' }))}
              colorMap={{
                'US':             'border-slate-400 bg-slate-50 text-slate-700',
                'Switzerland':    'border-sky-500 bg-sky-50 text-sky-700',
                'Rest of Europe': 'border-blue-400 bg-blue-50 text-blue-700',
              }}
            />
          </div>
          <div>
            <Label required>Legal Form</Label>
            <ToggleGroup
              options={LEGAL_FORMS}
              value={qcForm.legalForm}
              onChange={v => setQcForm(f => ({ ...f, legalForm: v }))}
              tooltips={{
                AG:   'Aktiengesellschaft — Joint-stock company. Min. share capital CHF 100,000. Standard for larger SPVs; shares transfer freely between investors.',
                GmbH: 'Gesellschaft mit beschränkter Haftung — Limited liability company. Min. share capital CHF 20,000. Lower capital requirement but ownership stakes are less liquid.',
                LLC:  'Limited Liability Company — US-domiciled entity. Flexible structure with pass-through taxation; commonly used for US real estate SPVs.',
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
                'Residential':  'border-sky-500 bg-sky-50 text-sky-700',
                'Commercial':   'border-blue-600 bg-blue-50 text-blue-700',
                'Multi-Family': 'border-sky-600 bg-sky-100 text-sky-800',
                'Industrial':   'border-slate-500 bg-slate-50 text-slate-700',
                'Hospitality':  'border-amber-500 bg-amber-50 text-amber-700',
                'Mixed-Use':    'border-indigo-500 bg-indigo-50 text-indigo-700',
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

      {/* ── Assign Manager Modal ── */}
      <Modal open={!!assignModal} onClose={() => setAssignModal(null)} title="Assign SPV Manager" size="sm">
        {assignModal && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500">
              Assigning a manager to <span className="font-semibold text-gray-700">{assignModal.propertyDisplayName}</span>
            </p>
            <div className="space-y-2">
              {SPV_MANAGERS.map(mgr => (
                <button
                  key={mgr.id}
                  type="button"
                  onClick={() => {
                    updateSpv(assignModal.id, { assignedManagerId: mgr.id })
                    setAssignModal(null)
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-colors ${
                    assignModal.assignedManagerId === mgr.id
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="w-9 h-9 rounded-full bg-sky-100 flex items-center justify-center text-xs font-bold text-sky-600 flex-shrink-0">
                    {mgr.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{mgr.name}</p>
                    <p className="text-xs text-gray-400">{mgr.region}</p>
                  </div>
                  {assignModal.assignedManagerId === mgr.id && (
                    <CheckCircle2 size={15} className="text-sky-500 ml-auto flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
            {assignModal.assignedManagerId && (
              <button
                type="button"
                onClick={() => {
                  updateSpv(assignModal.id, { assignedManagerId: null })
                  setAssignModal(null)
                }}
                className="w-full text-xs text-gray-400 hover:text-red-500 transition-colors py-1"
              >
                Remove assignment
              </button>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  )
}
