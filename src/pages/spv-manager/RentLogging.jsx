import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Upload } from 'lucide-react'

const SPVS = [
  'Zurich Westpark Office Complex',
  'Geneva Lakefront Residences',
  'Basel Industrial Hub',
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const YEARS = ['2023', '2024', '2025']

const rentEntries = [
  { id: 1, spv: 'Zurich Westpark Office Complex', monthYear: 'May 2025', amount: 'CHF 28,400', date: '01 Jun 2025', status: 'Logged' },
  { id: 2, spv: 'Geneva Lakefront Residences',    monthYear: 'May 2025', amount: 'CHF 14,750', date: '02 Jun 2025', status: 'Logged' },
  { id: 3, spv: 'Basel Industrial Hub',           monthYear: 'May 2025', amount: 'CHF 9,100',  date: '03 Jun 2025', status: 'Pending Review' },
  { id: 4, spv: 'Zurich Westpark Office Complex', monthYear: 'Apr 2025', amount: 'CHF 28,400', date: '01 May 2025', status: 'Logged' },
  { id: 5, spv: 'Geneva Lakefront Residences',    monthYear: 'Apr 2025', amount: 'CHF 14,750', date: '02 May 2025', status: 'Logged' },
]

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-200'
const labelCls = 'text-xs font-semibold text-gray-700 mb-1'

export function SpvManagerRentLogging() {
  return (
    <Layout>
      <Header title="Rent Income Log" subtitle="Record monthly rent received per property" />
      <div className="ds-page space-y-5">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Form card */}
          <div className="bg-white border border-gray-200 rounded-2xl">
            <div className="px-5 py-4 border-b border-gray-200">
              <p className="font-bold text-gray-900 text-sm">Log Rent Income</p>
              <p className="text-xs text-gray-400 mt-0.5">Fill in the details for this month's rent</p>
            </div>
            <div className="p-5 space-y-4">

              <div>
                <p className={labelCls}>Select SPV</p>
                <select className={inputCls} defaultValue="">
                  <option value="" disabled>Select an SPV…</option>
                  {SPVS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className={labelCls}>Month</p>
                  <select className={inputCls} defaultValue="">
                    <option value="" disabled>Month</option>
                    {MONTHS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <p className={labelCls}>Year</p>
                  <select className={inputCls} defaultValue="">
                    <option value="" disabled>Year</option>
                    {YEARS.map(y => <option key={y}>{y}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <p className={labelCls}>CHF Amount Received</p>
                <input type="number" placeholder="0.00" className={inputCls} />
              </div>

              <div>
                <p className={labelCls}>Date Received</p>
                <input type="date" className={inputCls} />
              </div>

              <div>
                <p className={labelCls}>Bank Reference / Notes <span className="font-normal text-gray-400">(optional)</span></p>
                <input type="text" placeholder="e.g. UBS transfer ref #7823" className={inputCls} />
              </div>

              <div>
                <p className={labelCls}>Upload PDF Bank Receipt</p>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-sky-300 hover:bg-sky-50/50 transition-colors cursor-pointer">
                  <Upload size={20} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-xs font-medium text-gray-500">Click to upload bank receipt</p>
                  <p className="text-xs text-gray-400 mt-0.5">PDF, max 10MB</p>
                </div>
              </div>

              <button className="w-full px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-colors">
                Log Rent Income
              </button>
            </div>
          </div>

          {/* History table card */}
          <div className="bg-white border border-gray-200 rounded-2xl">
            <div className="px-5 py-4 border-b border-gray-200">
              <p className="font-bold text-gray-900 text-sm">Recent Rent Entries</p>
              <p className="text-xs text-gray-400 mt-0.5">Last 5 logged entries across all SPVs</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-5 py-3 text-gray-500 font-semibold">SPV</th>
                    <th className="text-left px-3 py-3 text-gray-500 font-semibold">Month/Year</th>
                    <th className="text-right px-3 py-3 text-gray-500 font-semibold">Amount</th>
                    <th className="text-left px-3 py-3 text-gray-500 font-semibold">Date</th>
                    <th className="text-left px-3 py-3 text-gray-500 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rentEntries.map(r => (
                    <tr key={r.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800 max-w-[140px]">
                        <p className="truncate">{r.spv}</p>
                      </td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{r.monthYear}</td>
                      <td className="px-3 py-3 text-right font-semibold text-gray-900 tabular-nums whitespace-nowrap">{r.amount}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{r.date}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-full ${r.status === 'Logged' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${r.status === 'Logged' ? 'bg-green-500' : 'bg-amber-400'}`} />
                          {r.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}
