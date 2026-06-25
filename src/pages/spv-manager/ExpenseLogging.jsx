import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Upload, Paperclip } from 'lucide-react'

const SPVS = [
  'Zurich Westpark Office Complex',
  'Geneva Lakefront Residences',
  'Basel Industrial Hub',
]

const CATEGORIES = [
  'Maintenance & Repairs',
  'Property Insurance',
  'Legal & Compliance',
  'Utilities',
  'Property Management Fee',
  'Capital Improvements',
  'Other',
]

const expenses = [
  { id: 1, spv: 'Zurich Westpark',    vendor: 'Helvetia Facility Mgmt', category: 'Property Management Fee', amount: 'CHF 2,840', date: '01 Jun 2025' },
  { id: 2, spv: 'Geneva Lakefront',   vendor: 'Suisse Electricité SA',  category: 'Utilities',               amount: 'CHF 640',   date: '04 Jun 2025' },
  { id: 3, spv: 'Basel Industrial',   vendor: 'Baloise Versicherung',   category: 'Property Insurance',      amount: 'CHF 3,100', date: '05 Jun 2025' },
  { id: 4, spv: 'Zurich Westpark',    vendor: 'Meier Handwerk GmbH',    category: 'Maintenance & Repairs',   amount: 'CHF 1,275', date: '10 Jun 2025' },
  { id: 5, spv: 'Geneva Lakefront',   vendor: 'BDO Schweiz AG',         category: 'Legal & Compliance',      amount: 'CHF 5,500', date: '12 Jun 2025' },
]

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-200'
const labelCls = 'text-xs font-semibold text-gray-700 mb-1'

export function SpvManagerExpenseLogging() {
  return (
    <Layout>
      <Header title="Operational Expenses" subtitle="Track and categorize property running costs" />
      <div className="ds-page space-y-5">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Form card */}
          <div className="bg-white border border-gray-200 rounded-2xl">
            <div className="px-5 py-4 border-b border-gray-200">
              <p className="font-bold text-gray-900 text-sm">Log Expense</p>
              <p className="text-xs text-gray-600 mt-0.5">Record a new operational expense with invoice</p>
            </div>
            <div className="p-5 space-y-4">

              <div>
                <p className={labelCls}>Select SPV</p>
                <select className={inputCls} defaultValue="">
                  <option value="" disabled>Select an SPV…</option>
                  {SPVS.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>

              <div>
                <p className={labelCls}>Expense Date</p>
                <input type="date" className={inputCls} />
              </div>

              <div>
                <p className={labelCls}>Vendor / Supplier Name</p>
                <input type="text" placeholder="e.g. Meier Handwerk GmbH" className={inputCls} />
              </div>

              <div>
                <p className={labelCls}>Category</p>
                <select className={inputCls} defaultValue="">
                  <option value="" disabled>Select category…</option>
                  {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <p className={labelCls}>CHF Amount</p>
                <input type="number" placeholder="0.00" className={inputCls} />
              </div>

              <div>
                <p className={labelCls}>Description / Notes</p>
                <textarea
                  rows={3}
                  placeholder="Describe the expense and any relevant details…"
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div>
                <p className={labelCls}>Upload PDF Invoice</p>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-sky-300 hover:bg-sky-50/50 transition-colors cursor-pointer">
                  <Upload size={20} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-xs font-medium text-gray-600">Click to upload invoice</p>
                  <p className="text-xs text-gray-600 mt-0.5">PDF, max 10MB</p>
                </div>
              </div>

              <button className="w-full px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-colors">
                Log Expense
              </button>
            </div>
          </div>

          {/* History table card */}
          <div className="bg-white border border-gray-200 rounded-2xl">
            <div className="px-5 py-4 border-b border-gray-200">
              <p className="font-bold text-gray-900 text-sm">Recent Expenses</p>
              <p className="text-xs text-gray-600 mt-0.5">Last 5 logged expenses across all SPVs</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left px-5 py-3 text-gray-600 font-semibold">SPV</th>
                    <th className="text-left px-3 py-3 text-gray-600 font-semibold">Vendor</th>
                    <th className="text-left px-3 py-3 text-gray-600 font-semibold">Category</th>
                    <th className="text-right px-3 py-3 text-gray-600 font-semibold">Amount</th>
                    <th className="text-left px-3 py-3 text-gray-600 font-semibold">Date</th>
                    <th className="text-left px-3 py-3 text-gray-600 font-semibold">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(e => (
                    <tr key={e.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800 whitespace-nowrap">{e.spv}</td>
                      <td className="px-3 py-3 text-gray-600 max-w-[120px]">
                        <p className="truncate">{e.vendor}</p>
                      </td>
                      <td className="px-3 py-3 text-gray-600 max-w-[120px]">
                        <p className="truncate">{e.category}</p>
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-gray-900 tabular-nums whitespace-nowrap">{e.amount}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{e.date}</td>
                      <td className="px-3 py-3">
                        <button className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-700 font-medium">
                          <Paperclip size={11} /> View
                        </button>
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
