import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { X, GripVertical, ImagePlus } from 'lucide-react'

const SPVS = [
  'Zurich Westpark Office Complex',
  'Geneva Lakefront Residences',
  'Basel Industrial Hub',
]

const gradients = [
  'from-sky-100 to-sky-200',
  'from-sky-200 to-sky-300',
  'from-sky-50  to-sky-150',
  'from-indigo-100 to-sky-200',
  'from-sky-100 to-indigo-100',
  'from-teal-100 to-sky-200',
]

const photoLabels = [
  'Lobby Entrance',
  'Open-Plan Office',
  'Rooftop Terrace',
  'Building Exterior',
  'Meeting Room A',
  'Car Park Level 1',
]

export function SpvManagerPropertyGallery() {
  return (
    <Layout>
      <Header title="Property Gallery" subtitle="Manage photos shown to prospective investors on the marketplace" />
      <div className="ds-page space-y-5">

        {/* SPV selector bar */}
        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4 flex-wrap">
          <p className="text-xs font-semibold text-gray-700 flex-shrink-0">Select SPV</p>
          <div className="flex gap-2 flex-wrap">
            {SPVS.map((s, i) => (
              <button
                key={s}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${i === 0 ? 'bg-sky-600 text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
              >
                {s.split(' ').slice(0, 2).join(' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Gallery grid card */}
        <div className="bg-white border border-gray-200 rounded-2xl">
          <div className="px-5 py-4 border-b border-gray-200">
            <p className="font-bold text-gray-900 text-sm">Zurich Westpark Office Complex — Gallery</p>
            <p className="text-xs text-gray-400 mt-0.5">6 of 12 photos uploaded</p>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photoLabels.map((label, idx) => (
                <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden group">
                  {/* Photo placeholder */}
                  <div className={`relative h-36 bg-gradient-to-br ${gradients[idx]} flex items-end justify-start p-2`}>
                    {idx === 0 && (
                      <span className="absolute top-2 left-2 bg-sky-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Primary
                      </span>
                    )}
                  </div>
                  {/* Bottom bar */}
                  <div className="flex items-center justify-between px-3 py-2 bg-white">
                    <p className="text-[11px] text-gray-600 font-medium truncate flex-1 mr-2">
                      Photo {idx + 1} of 6 — {label}
                    </p>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button aria-label="Remove image" className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                        <X size={13} aria-hidden="true" />
                      </button>
                      <button aria-label="Reorder image" className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 cursor-grab transition-colors">
                        <GripVertical size={13} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">
              Drag to rearrange · First photo is shown as the cover image
            </p>
          </div>
        </div>

        {/* Upload card */}
        <div className="bg-white border border-gray-200 rounded-2xl">
          <div className="px-5 py-4 border-b border-gray-200">
            <p className="font-bold text-gray-900 text-sm">Add New Photos</p>
          </div>
          <div className="p-5">
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-10 text-center hover:border-sky-300 hover:bg-sky-50/50 transition-colors cursor-pointer">
              <ImagePlus size={28} className="mx-auto mb-3 text-gray-400" />
              <p className="text-sm font-semibold text-gray-600">Add New Photos</p>
              <p className="text-xs text-gray-400 mt-1">JPG, PNG up to 20MB each · Max 12 photos per SPV</p>
              <button className="mt-4 px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-xl transition-colors">
                Upload Photos
              </button>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  )
}
