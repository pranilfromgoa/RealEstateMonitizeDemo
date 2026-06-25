import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { AlertTriangle } from 'lucide-react'

const SPVS = [
  'Zurich Westpark Office Complex',
  'Geneva Lakefront Residences',
  'Basel Industrial Hub',
]

const QUORUM_OPTIONS = ['51%', '67%', '75%']

const proposals = [
  {
    id: 1,
    spv: 'Zurich Westpark',
    type: 'CapEx',
    title: 'Elevator Modernisation — Tower A',
    amount: 'CHF 320,000',
    deadline: '30 Jul 2025',
    status: 'Active',
    votes: '18 / 34',
  },
  {
    id: 2,
    spv: 'Geneva Lakefront',
    type: 'CapEx',
    title: 'Rooftop Solar Panel Installation',
    amount: 'CHF 195,000',
    deadline: '15 Aug 2025',
    status: 'Draft',
    votes: '—',
  },
  {
    id: 3,
    spv: 'Basel Industrial',
    type: 'Liquidation',
    title: 'Liquidation of Basel Industrial Hub',
    amount: 'CHF 3,200,000',
    deadline: '01 Sep 2025',
    status: 'Active',
    votes: '9 / 12',
  },
  {
    id: 4,
    spv: 'Zurich Westpark',
    type: 'CapEx',
    title: 'HVAC Replacement — Floors 3–6',
    amount: 'CHF 280,000',
    deadline: '12 Mar 2025',
    status: 'Passed',
    votes: '29 / 34',
  },
  {
    id: 5,
    spv: 'Geneva Lakefront',
    type: 'CapEx',
    title: 'Underground Car Park Resurfacing',
    amount: 'CHF 72,000',
    deadline: '20 Jan 2025',
    status: 'Failed',
    votes: '8 / 21',
  },
]

const statusStyles = {
  Draft:   { bg: 'bg-gray-100',   text: 'text-gray-600',   dot: 'bg-gray-400'  },
  Active:  { bg: 'bg-sky-50',     text: 'text-sky-700',    dot: 'bg-sky-500'   },
  Passed:  { bg: 'bg-green-50',   text: 'text-green-700',  dot: 'bg-green-500' },
  Failed:  { bg: 'bg-red-50',     text: 'text-red-600',    dot: 'bg-red-400'   },
}

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-200'
const labelCls = 'text-xs font-semibold text-gray-700 mb-1'

export function SpvManagerGovernanceProposals() {
  return (
    <Layout>
      <Header title="Governance Proposals" subtitle="Draft proposals and liquidation votes for token holder approval" />
      <div className="ds-page space-y-5">

        {/* Two side-by-side form cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Card 1 — Draft CapEx Proposal */}
          <div className="bg-white border border-gray-200 rounded-2xl">
            <div className="px-5 py-4 border-b border-gray-200">
              <p className="font-bold text-gray-900 text-sm">Draft CapEx Proposal</p>
              <p className="text-xs text-gray-600 mt-0.5">Propose a capital expenditure for holder approval</p>
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
                <p className={labelCls}>Proposal Title</p>
                <input type="text" placeholder="e.g. Elevator Modernisation — Tower A" className={inputCls} />
              </div>

              <div>
                <p className={labelCls}>Description</p>
                <textarea
                  rows={3}
                  placeholder="Describe the work, the vendor, and expected outcome…"
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className={labelCls}>CHF Amount Required</p>
                  <input type="number" placeholder="0" className={inputCls} />
                </div>
                <div>
                  <p className={labelCls}>Voting Deadline</p>
                  <input type="date" className={inputCls} />
                </div>
              </div>

              <div>
                <p className={labelCls}>Quorum Required</p>
                <select className={inputCls} defaultValue="51%">
                  {QUORUM_OPTIONS.map(q => <option key={q}>{q}</option>)}
                </select>
              </div>

              <div>
                <button className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-colors">
                  Submit for Review
                </button>
                <p className="text-xs text-gray-600 mt-2">Requires Admin approval before being sent to holders</p>
              </div>
            </div>
          </div>

          {/* Card 2 — Liquidation Proposal */}
          <div className="bg-white border border-gray-200 rounded-2xl">
            <div className="px-5 py-4 border-b border-gray-200">
              <p className="font-bold text-gray-900 text-sm">Propose Asset Liquidation / Sale</p>
              <p className="text-xs text-gray-600 mt-0.5">Initiate a sale vote for an SPV asset</p>
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
                <p className={labelCls}>Proposal Title</p>
                <input type="text" defaultValue="Liquidation of [SPV Name]" className={inputCls} />
              </div>

              <div>
                <p className={labelCls}>Description / Rationale</p>
                <textarea
                  rows={3}
                  placeholder="Explain why the asset is being sold and current market conditions…"
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className={labelCls}>Proposed Sale Price (CHF)</p>
                  <input type="number" placeholder="0" className={inputCls} />
                </div>
                <div>
                  <p className={labelCls}>Minimum Acceptance Price (CHF)</p>
                  <input type="number" placeholder="0" className={inputCls} />
                </div>
              </div>

              <div>
                <p className={labelCls}>Voting Deadline</p>
                <input type="date" className={inputCls} />
              </div>

              {/* Warning banner */}
              <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <AlertTriangle size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <span className="font-semibold">Warning:</span> This will trigger an on-chain notification to all token holders. Cannot be cancelled once published.
                </p>
              </div>

              <div>
                <button className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-xl transition-colors">
                  Submit Liquidation Proposal
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Full-width proposals table card */}
        <div className="bg-white border border-gray-200 rounded-2xl">
          <div className="px-5 py-4 border-b border-gray-200">
            <p className="font-bold text-gray-900 text-sm">Active &amp; Past Proposals</p>
            <p className="text-xs text-gray-600 mt-0.5">All governance proposals across managed SPVs</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-5 py-3 text-gray-600 font-semibold">SPV</th>
                  <th className="text-left px-3 py-3 text-gray-600 font-semibold">Type</th>
                  <th className="text-left px-3 py-3 text-gray-600 font-semibold">Title</th>
                  <th className="text-right px-3 py-3 text-gray-600 font-semibold">Amount</th>
                  <th className="text-left px-3 py-3 text-gray-600 font-semibold">Deadline</th>
                  <th className="text-left px-3 py-3 text-gray-600 font-semibold">Status</th>
                  <th className="text-left px-3 py-3 text-gray-600 font-semibold">Votes</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map(p => {
                  const s = statusStyles[p.status] || statusStyles.Draft
                  return (
                    <tr key={p.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3 font-medium text-gray-800 whitespace-nowrap">{p.spv}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          p.type === 'CapEx'
                            ? 'bg-sky-50 text-sky-700 border border-sky-100'
                            : 'bg-amber-50 text-amber-700 border border-amber-100'
                        }`}>
                          {p.type}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-700 max-w-[200px]">
                        <p className="truncate">{p.title}</p>
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-gray-900 tabular-nums whitespace-nowrap">{p.amount}</td>
                      <td className="px-3 py-3 text-gray-600 whitespace-nowrap">{p.deadline}</td>
                      <td className="px-3 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full font-medium ${s.bg} ${s.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${s.dot}`} />
                          {p.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-gray-600 tabular-nums whitespace-nowrap">{p.votes}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </Layout>
  )
}
