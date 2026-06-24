import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { ImageIcon, X, Users } from 'lucide-react'

const SPVS = [
  'Zurich Westpark Office Complex',
  'Geneva Lakefront Residences',
  'Basel Industrial Hub',
]

const mockThumbnails = [
  { id: 1, label: 'Lobby refurb' },
  { id: 2, label: 'Exterior repaint' },
  { id: 3, label: 'New signage' },
]

const publishedUpdates = [
  {
    id: 1,
    spv: 'Zurich Westpark Office Complex',
    title: 'HVAC System Upgrade Complete',
    date: '12 Jun 2025',
    excerpt: 'The central HVAC system on floors 2–5 has been fully replaced with an energy-efficient Carrier unit. Estimated savings of 18% on utility costs.',
    holders: 34,
  },
  {
    id: 2,
    spv: 'Geneva Lakefront Residences',
    title: 'Q1 2025 Occupancy Report',
    date: '01 Apr 2025',
    excerpt: 'Occupancy for Q1 2025 reached 96%, with two new long-term lease agreements signed in March for units 4B and 7A.',
    holders: 21,
  },
  {
    id: 3,
    spv: 'Basel Industrial Hub',
    title: 'Lease Renewal — Hauptmieter AG',
    date: '15 Mar 2025',
    excerpt: 'Hauptmieter AG has signed a 3-year lease extension, securing rental income through March 2028 at an agreed increase of 3.2% per annum.',
    holders: 12,
  },
]

const inputCls = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-sky-200'
const labelCls = 'text-xs font-semibold text-gray-700 mb-1'

export function SpvManagerInvestorUpdates() {
  return (
    <Layout>
      <Header title="Investor Updates" subtitle="Publish updates to holders of a specific SPV" />
      <div className="ds-page space-y-5">

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Compose card */}
          <div className="bg-white border border-gray-200 rounded-2xl">
            <div className="px-5 py-4 border-b border-gray-200">
              <p className="font-bold text-gray-900 text-sm">Compose Update</p>
              <p className="text-xs text-gray-400 mt-0.5">Write and publish an update to all token holders</p>
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
                <p className={labelCls}>Update Title</p>
                <input type="text" placeholder="e.g. Q2 2025 Occupancy Report" className={inputCls} />
              </div>

              <div>
                <p className={labelCls}>Body / Message</p>
                <textarea
                  rows={5}
                  placeholder="Share maintenance updates, milestones, or announcements with your investors..."
                  className={`${inputCls} resize-none`}
                />
              </div>

              <div>
                <p className={labelCls}>Attach Photos</p>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-sky-300 hover:bg-sky-50/50 transition-colors cursor-pointer">
                  <ImageIcon size={20} className="mx-auto mb-2 text-gray-400" />
                  <p className="text-xs font-medium text-gray-500">Upload photos (JPG/PNG, max 5 files)</p>
                </div>
              </div>

              {/* Mock thumbnails */}
              <div className="flex gap-2">
                {mockThumbnails.map(t => (
                  <div key={t.id} className="relative w-20 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                    <p className="text-[9px] text-gray-400 text-center px-1">{t.label}</p>
                    <button className="absolute top-1 right-1 w-4 h-4 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-red-50 hover:border-red-200 transition-colors">
                      <X size={8} className="text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <button className="w-full px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-colors">
                  Publish Update
                </button>
                <p className="text-xs text-gray-400 mt-2 text-center">This will appear on the dashboard of all Brick holders in this SPV</p>
              </div>
            </div>
          </div>

          {/* Published updates list */}
          <div className="bg-white border border-gray-200 rounded-2xl">
            <div className="px-5 py-4 border-b border-gray-200">
              <p className="font-bold text-gray-900 text-sm">Published Updates</p>
              <p className="text-xs text-gray-400 mt-0.5">Recent updates sent to investors</p>
            </div>
            <div className="p-5 space-y-4">
              {publishedUpdates.map(u => (
                <div key={u.id} className="border border-gray-100 rounded-xl p-4 hover:border-gray-200 transition-colors">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="inline-flex items-center text-[10px] font-semibold text-sky-700 bg-sky-50 border border-sky-100 rounded-full px-2 py-0.5">
                      {u.spv.split(' ')[0]} {u.spv.split(' ')[1]}
                    </span>
                    <span className="text-xs text-gray-400">{u.date}</span>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">{u.title}</p>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{u.excerpt}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                    <Users size={11} />
                    <span>{u.holders} holders notified</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </Layout>
  )
}
