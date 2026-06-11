import { useState, useRef, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { properties } from '@/data/mockData'
import { Bot, Send, FileText, ChevronDown, Sparkles, User } from 'lucide-react'

const mockAnswers = {
  default: [
    "Based on the property documents, this is a well-maintained asset with strong fundamentals. The appraisal was conducted by a licensed firm and values the property at market rate.",
    "The property deed confirms clear title ownership with no encumbrances. The LLC structure provides liability protection for investors.",
    "According to the insurance policy, the property is fully covered for replacement cost value, including liability coverage up to $5 million.",
    "The lease agreements show long-term tenants with renewal options. Rental income has been consistent for the past 3 years with a 3% annual escalation clause.",
  ],
  tenant: "The current tenants have maintained strong payment histories per the rent rolls. Lease terms range from 12-36 months with renewal options. Average tenant tenure is 2.4 years.",
  risk: "Key risks identified in the documents: (1) Market rent is 8% above current lease rates — potential upside on renewal. (2) HVAC system is 12 years old and may require replacement within 5 years. (3) Property taxes increased 4.2% last year — slightly above the 3% annual cap.",
  yield: "The property generates a gross yield of 8.2% based on the current purchase price. After management fees (8%), insurance, and property taxes, the net yield is approximately 6.9%.",
  llc: "The LLC is a single-purpose entity created specifically for this property. Articles of incorporation were filed in 2021. The operating agreement provides investor protections including pro-rata distribution rights and approval requirements for major decisions.",
  zoning: "The property is zoned R-3 (Multi-family residential) with a certificate of occupancy for 12 units. No pending zoning changes or variances were found in the municipal records.",
}

function getAnswer(q) {
  const lower = q.toLowerCase()
  if (lower.includes('tenant') || lower.includes('lease') || lower.includes('renter')) return mockAnswers.tenant
  if (lower.includes('risk') || lower.includes('concern') || lower.includes('problem')) return mockAnswers.risk
  if (lower.includes('yield') || lower.includes('return') || lower.includes('income') || lower.includes('profit')) return mockAnswers.yield
  if (lower.includes('llc') || lower.includes('company') || lower.includes('entity') || lower.includes('ownership')) return mockAnswers.llc
  if (lower.includes('zon') || lower.includes('permit') || lower.includes('occupation')) return mockAnswers.zoning
  return mockAnswers.default[Math.floor(Math.random() * mockAnswers.default.length)]
}

const suggestions = [
  'What are the main risks in this property?',
  'Who are the current tenants and when do leases expire?',
  'What is the net yield after all expenses?',
  'Is the LLC structure investor-friendly?',
  'Are there any zoning or permit issues?',
]

export function InvestorAIReader() {
  const [selectedProp, setSelectedProp] = useState(properties[0])
  const [messages, setMessages] = useState([
    { role: 'assistant', text: `Hi! I've analyzed all documents for **${properties[0].name}**. Ask me anything about the property deed, LLC structure, lease agreements, financials, or any other document. I can answer questions from the full document set in seconds.` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const handleSend = (text) => {
    const q = text || input
    if (!q.trim()) return
    setMessages(m => [...m, { role: 'user', text: q }])
    setInput('')
    setLoading(true)
    setTimeout(() => {
      setMessages(m => [...m, { role: 'assistant', text: getAnswer(q) }])
      setLoading(false)
    }, 1200 + Math.random() * 800)
  }

  const handlePropChange = (prop) => {
    setSelectedProp(prop)
    setMessages([{ role: 'assistant', text: `Documents for **${prop.name}** loaded. I've read all ${prop.documents.length} documents. What would you like to know?` }])
  }

  return (
    <Layout>
      <Header title="AI Document Reader" subtitle="Phase 3 — Smart Q&A for property documents" />
      <div className="p-6 flex gap-6" style={{ height: 'calc(100vh - 80px)' }}>
        {/* Left: property selector + docs */}
        <div className="w-72 flex-shrink-0 space-y-4">
          <div className="ds-alert-warning flex items-center gap-2">
            <Badge className="bg-amber-600 text-white text-xs">Phase 3</Badge>
            <p className="text-xs">AI-powered doc analysis</p>
          </div>

          <Card>
            <CardHeader className="py-3"><CardTitle className="text-sm">Select Property</CardTitle></CardHeader>
            <CardContent className="p-2 space-y-1">
              {properties.map(p => (
                <button
                  key={p.id}
                  onClick={() => handlePropChange(p)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors text-sm ${selectedProp.id === p.id ? 'bg-blue-50 text-blue-700' : 'hover:bg-gray-50 text-gray-700'}`}
                >
                  <img src={p.image} alt="" className="w-10 h-8 rounded-lg object-cover flex-shrink-0" />
                  <span className="leading-tight">{p.name}</span>
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="py-3"><CardTitle className="text-sm">Documents Loaded</CardTitle></CardHeader>
            <CardContent className="p-3 space-y-2">
              {selectedProp.documents.map(doc => (
                <div key={doc.name} className="flex items-center gap-2">
                  <FileText size={13} className="text-green-600" />
                  <span className="text-xs text-gray-600">{doc.name}</span>
                  <Badge variant="success" className="ml-auto text-xs py-0">✓</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-purple-50">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Sparkles size={16} className="text-white" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm">BrickBloc AI Assistant</p>
              <p className="text-xs text-muted-foreground">Analyzing: {selectedProp.name} — {selectedProp.documents.length} documents loaded</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'assistant' ? 'bg-gradient-to-br from-blue-500 to-purple-600' : 'bg-gray-200'}`}>
                  {msg.role === 'assistant' ? <Bot size={14} className="text-white" /> : <User size={14} className="text-gray-600" />}
                </div>
                <div className={`max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'assistant' ? 'bg-gray-50 text-gray-800' : 'bg-blue-600 text-white ml-auto'}`}>
                  {msg.text.split('**').map((part, j) => j % 2 === 1 ? <strong key={j}>{part}</strong> : part)}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot size={14} className="text-white" />
                </div>
                <div className="bg-gray-50 rounded-2xl px-4 py-3 flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map(i => (
                      <div key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                  <span className="text-xs text-gray-400">Analyzing documents…</span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Suggestions */}
          <div className="px-5 py-2 border-t border-gray-100 flex gap-2 overflow-x-auto">
            {suggestions.map(s => (
              <button key={s} onClick={() => handleSend(s)} className="flex-shrink-0 text-xs px-3 py-1.5 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 rounded-full text-gray-600 transition-colors">
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-5 py-4 border-t border-gray-100">
            <div className="flex gap-3">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder="Ask about the property documents..."
                className="ds-input flex-1"
              />
              <Button onClick={() => handleSend()} disabled={!input.trim() || loading}>
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
