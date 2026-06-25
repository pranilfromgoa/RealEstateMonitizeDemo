import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Upload, FileText } from 'lucide-react'

const SPVS = [
  'Zurich Westpark Office Complex',
  'Geneva Lakefront Residences',
  'Basel Industrial Hub',
]

const appraisalHistory = [
  { id: 1, spv: 'Zurich Westpark Office Complex', date: '15 Mar 2025', appraiser: 'Wüest & Partner AG', prev: 'CHF 4,200,000', next: 'CHF 4,420,000', change: '+5.2%', positive: true },
  { id: 2, spv: 'Geneva Lakefront Residences',    date: '20 Mar 2025', appraiser: 'CBRE Switzerland',   prev: 'CHF 6,800,000', next: 'CHF 7,072,000', change: '+4.0%', positive: true },
  { id: 3, spv: 'Basel Industrial Hub',           date: '01 Apr 2025', appraiser: 'JLL Schweiz AG',    prev: 'CHF 3,100,000', next: 'CHF 3,038,000', change: '−2.0%', positive: false },
  { id: 4, spv: 'Zurich Westpark Office Complex', date: '10 Apr 2024', appraiser: 'Wüest & Partner AG', prev: 'CHF 4,000,000', next: 'CHF 4,200,000', change: '+5.0%', positive: true },
]

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-200'
const labelCls = 'text-xs font-semibold text-gray-700 mb-1'

export function SpvManagerAppraisalReport() {
  return (
    <Layout>
      <Header title="Property Appraisal" subtitle="Submit annual valuations and update assessed property values" />
      <div className="ds-page space-y-5">

        {/* Form card — full width */}
        <div className="bg-white border border-gray-200 rounded-2xl">
          <div className="px-5 py-4 border-b border-gray-200">
            <p className="font-bold text-gray-900 text-sm">Submit Appraisal</p>
            <p className="text-xs text-gray-600 mt-0.5">Enter the latest valuation for this property</p>
          </div>
          <div className="p-5 space-y-5">

            {/* 3-column top row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className={labelCls}>Select SPV</p>
                <select className={inputCls} defaultValue="">
                  <option value="" disabled>Select an SPV…</option>
                  {SPVS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <p className={labelCls}>Appraisal Date</p>
                <input type="date" className={inputCls} />
              </div>
              <div>
                <p className={labelCls}>Appraiser / Firm Name</p>
                <input type="text" placeholder="e.g. Wüest & Partner AG" className={inputCls} />
              </div>
            </div>

            {/* New value + computed displays */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <p className={labelCls}>New Assessed Value (CHF)</p>
                <div className="flex">
                  <span className="inline-flex items-center px-3 py-2.5 text-xs font-semibold text-gray-600 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl">CHF</span>
                  <input
                    type="number"
                    placeholder="0"
                    className="flex-1 border border-gray-200 rounded-r-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-200"
                  />
                </div>
              </div>
              <div>
                <p className={labelCls}>Previous Assessed Value</p>
                <div className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 text-sm font-semibold text-gray-600">
                  CHF 4,200,000
                </div>
              </div>
              <div>
                <p className={labelCls}>Value Change %</p>
                <div className="w-full border border-gray-200 rounded-xl px-3 py-2.5 bg-green-50 text-sm font-bold text-green-600">
                  +5.2%
                </div>
              </div>
            </div>

            {/* Upload */}
            <div>
              <p className={labelCls}>Upload PDF Appraisal Report</p>
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-sky-300 hover:bg-sky-50/50 transition-colors cursor-pointer">
                <Upload size={24} className="mx-auto mb-2 text-gray-400" />
                <p className="text-sm font-medium text-gray-600">Click to upload appraisal report</p>
                <p className="text-xs text-gray-600 mt-0.5">PDF, max 20MB</p>
              </div>
            </div>

            {/* Submit row */}
            <div className="flex items-center gap-4 pt-1">
              <button className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-colors">
                Submit Appraisal Report
              </button>
              <p className="text-xs text-gray-600">This will update the property valuation across the platform</p>
            </div>
          </div>
        </div>

        {/* History table card */}
        <div className="bg-white border border-gray-200 rounded-2xl">
          <div className="px-5 py-4 border-b border-gray-200">
            <p className="font-bold text-gray-900 text-sm">Appraisal History</p>
            <p className="text-xs text-gray-600 mt-0.5">Past valuations submitted for all properties</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-gray-600 font-semibold">SPV</th>
                  <th className="text-right px-3 py-3 text-gray-600 font-semibold">Date</th>
                  <th className="text-left px-3 py-3 text-gray-600 font-semibold">Appraiser</th>
                  <th className="text-right px-3 py-3 text-gray-600 font-semibold">Previous Value</th>
                  <th className="text-right px-3 py-3 text-gray-600 font-semibold">New Value</th>
                  <th className="text-right px-3 py-3 text-gray-600 font-semibold">Change</th>
                  <th className="text-left px-3 py-3 text-gray-600 font-semibold">Report</th>
                </tr>
              </thead>
              <tbody>
                {appraisalHistory.map(a => (
                  <tr key={a.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-5 py-3 font-medium text-gray-800 max-w-[160px]">
                      <p className="truncate">{a.spv}</p>
                    </td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap text-right">{a.date}</td>
                    <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{a.appraiser}</td>
                    <td className="px-3 py-3 text-right text-gray-600 tabular-nums whitespace-nowrap">{a.prev}</td>
                    <td className="px-3 py-3 text-right font-semibold text-gray-900 tabular-nums whitespace-nowrap">{a.next}</td>
                    <td className="px-3 py-3 text-right">
                      <span className={`font-semibold tabular-nums ${a.positive ? 'text-green-600' : 'text-red-500'}`}>{a.change}</span>
                    </td>
                    <td className="px-3 py-3">
                      <button className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 font-medium">
                        <FileText size={11} /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  )
}
