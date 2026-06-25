import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { ShieldCheck, Download, CheckCircle2 } from 'lucide-react'

const SPVS = [
  'Zurich Westpark Office Complex',
  'Geneva Lakefront Residences',
  'Basel Industrial Hub',
]

const DOC_TYPES = [
  'Annual Corporate Tax Return',
  'Municipal Property Tax Receipt',
  'Building Insurance Certificate',
  'External Audit Report',
  'Other Compliance Doc',
]

const TAX_YEARS = ['2020', '2021', '2022', '2023', '2024', '2025']

const vaultDocs = [
  // Zurich Westpark
  { id: 1, spv: 'Zurich Westpark Office Complex', type: 'Annual Corporate Tax Return',    year: '2024', uploaded: '10 Mar 2025', size: '2.4 MB', verified: true },
  { id: 2, spv: 'Zurich Westpark Office Complex', type: 'Municipal Property Tax Receipt', year: '2024', uploaded: '11 Mar 2025', size: '0.8 MB', verified: true },
  { id: 3, spv: 'Zurich Westpark Office Complex', type: 'Building Insurance Certificate', year: '2024', uploaded: '12 Mar 2025', size: '1.1 MB', verified: true },
  { id: 4, spv: 'Zurich Westpark Office Complex', type: 'External Audit Report',          year: '2023', uploaded: '05 Apr 2024', size: '4.7 MB', verified: false },
  // Geneva Lakefront
  { id: 5, spv: 'Geneva Lakefront Residences',    type: 'Annual Corporate Tax Return',    year: '2024', uploaded: '15 Mar 2025', size: '2.1 MB', verified: true },
  { id: 6, spv: 'Geneva Lakefront Residences',    type: 'Building Insurance Certificate', year: '2024', uploaded: '16 Mar 2025', size: '0.9 MB', verified: true },
  { id: 7, spv: 'Geneva Lakefront Residences',    type: 'Municipal Property Tax Receipt', year: '2023', uploaded: '08 Apr 2024', size: '0.7 MB', verified: true },
  { id: 8, spv: 'Geneva Lakefront Residences',    type: 'External Audit Report',          year: '2023', uploaded: '20 Apr 2024', size: '3.9 MB', verified: false },
]

// Group by SPV
const grouped = vaultDocs.reduce((acc, doc) => {
  if (!acc[doc.spv]) acc[doc.spv] = []
  acc[doc.spv].push(doc)
  return acc
}, {})

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-200'
const labelCls = 'text-xs font-semibold text-gray-700 mb-1'

export function SpvManagerComplianceVault() {
  return (
    <Layout>
      <Header title="Compliance Document Vault" subtitle="Secure storage for regulatory and tax documents" />
      <div className="ds-page space-y-5">

        {/* Upload card */}
        <div className="bg-white border border-gray-200 rounded-2xl">
          <div className="px-5 py-4 border-b border-gray-200">
            <p className="font-bold text-gray-900 text-sm">Upload Compliance Document</p>
            <p className="text-xs text-gray-600 mt-0.5">Classify and securely store a new regulatory document</p>
          </div>
          <div className="p-5 space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className={labelCls}>Select SPV</p>
                <select className={inputCls} defaultValue="">
                  <option value="" disabled>Select an SPV…</option>
                  {SPVS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <p className={labelCls}>Document Type</p>
                <select className={inputCls} defaultValue="">
                  <option value="" disabled>Select type…</option>
                  {DOC_TYPES.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <p className={labelCls}>Tax Year</p>
                <select className={inputCls} defaultValue="">
                  <option value="" disabled>Select year…</option>
                  {TAX_YEARS.map(y => <option key={y}>{y}</option>)}
                </select>
              </div>
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-sky-300 hover:bg-sky-50/50 transition-colors cursor-pointer">
              <ShieldCheck size={28} className="mx-auto mb-3 text-gray-400" />
              <p className="text-sm font-semibold text-gray-600">Click to upload compliance document</p>
              <p className="text-xs text-gray-600 mt-1">PDF · max 20MB · stored encrypted</p>
            </div>

            <div className="flex justify-start">
              <button className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-colors">
                Upload to Vault
              </button>
            </div>
          </div>
        </div>

        {/* Vault table card */}
        <div className="bg-white border border-gray-200 rounded-2xl">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">
            <p className="font-bold text-gray-900 text-sm">Document Vault</p>
            <span className="inline-flex items-center justify-center bg-sky-100 text-sky-700 text-xs font-bold rounded-full px-2.5 py-0.5">
              {vaultDocs.length} docs
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-gray-600 font-semibold">Document Type</th>
                  <th className="text-right px-3 py-3 text-gray-600 font-semibold">Tax Year</th>
                  <th className="text-right px-3 py-3 text-gray-600 font-semibold">Uploaded</th>
                  <th className="text-right px-3 py-3 text-gray-600 font-semibold">File Size</th>
                  <th className="text-left px-3 py-3 text-gray-600 font-semibold">Verified</th>
                  <th className="text-left px-3 py-3 text-gray-600 font-semibold">Download</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(grouped).map(([spvName, docs]) => (
                  <>
                    <tr key={`group-${spvName}`} className="border-b border-gray-100 bg-gray-50">
                      <td colSpan={6} className="px-5 py-2.5 font-bold text-gray-700 text-xs">{spvName}</td>
                    </tr>
                    {docs.map(doc => (
                      <tr key={doc.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                        <td className="px-5 py-3 text-gray-800 font-medium max-w-[220px]">
                          <p className="truncate">{doc.type}</p>
                        </td>
                        <td className="px-3 py-3 text-gray-600 whitespace-nowrap text-right">{doc.year}</td>
                        <td className="px-3 py-3 text-gray-600 whitespace-nowrap text-right">{doc.uploaded}</td>
                        <td className="px-3 py-3 text-gray-600 whitespace-nowrap text-right">{doc.size}</td>
                        <td className="px-3 py-3">
                          {doc.verified
                            ? <span className="inline-flex items-center gap-1 text-green-600 font-medium"><CheckCircle2 size={12} /> Verified</span>
                            : <span className="inline-flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /><span className="text-amber-600 font-medium">Pending</span></span>
                          }
                        </td>
                        <td className="px-3 py-3">
                          <button className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 font-medium">
                            <Download size={11} /> Download
                          </button>
                        </td>
                      </tr>
                    ))}
                  </>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  )
}
