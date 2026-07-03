import { useState } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Header } from '@/components/layout/Header'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { StatCard } from '@/components/ui/stat-card'
import {
  ShieldCheck, ShieldAlert, Lock, AlertTriangle, Activity,
  KeyRound, Server, Fingerprint, Zap, Clock, X, Mail, UserX, CheckCircle2,
} from 'lucide-react'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, ReferenceLine,
  BarChart, Bar,
} from 'recharts'

// ─── Mock Data ────────────────────────────────────────────────────────────────

const mfaGroups = [
  { label: 'Super Admins',        total: 3,  withMfa: 3, missing: [] },
  { label: 'SPV Managers',        total: 5,  withMfa: 3, missing: ['schmidt@spv.ch', 'muller@spv.ch'] },
  { label: 'Support Staff',       total: 10, withMfa: 9, missing: ['support.tier1@admin.ch'] },
  { label: 'Compliance Officers', total: 2,  withMfa: 2, missing: [] },
]

const loginRateData = [
  { t: '09:00', rate: 0.8 }, { t: '09:10', rate: 0.9 }, { t: '09:20', rate: 1.1 },
  { t: '09:30', rate: 0.7 }, { t: '09:40', rate: 0.9 }, { t: '09:50', rate: 1.6 }, { t: '10:00', rate: 1.4 },
]

const apiAbuseData = [
  { h: '00h', hits: 0 }, { h: '02h', hits: 1 }, { h: '04h', hits: 0 },
  { h: '06h', hits: 2 }, { h: '08h', hits: 14 }, { h: '10h', hits: 6 }, { h: '12h', hits: 3 },
]

const lexKollerData = [
  { day: 'Mon', n: 1 }, { day: 'Tue', n: 0 }, { day: 'Wed', n: 2 },
  { day: 'Thu', n: 1 }, { day: 'Fri', n: 3 }, { day: 'Sat', n: 0 }, { day: 'Sun', n: 3 },
]

const signatories = [
  { id: 'Key A', address: '0x4f...1aB', lastSeen: '2m ago' },
  { id: 'Key B', address: '0x8c...9Fe', lastSeen: '7m ago' },
  { id: 'Key C', address: '0x2d...3Cc', lastSeen: '1h ago' },
]

const threatEvents = [
  { time: '10:14:02', type: 'BLOCKCHAIN REVERT', severity: 'critical', chain: true,
    msg: 'ERC-3643 blocked wallet 0x71...76F (US Resident) from purchasing Seefeld Townhouses.' },
  { time: '10:11:45', type: 'LOGIN SPIKE', severity: 'warning', chain: false,
    msg: '12 failed attempts on SPV Manager account schmidt@spv.ch from IP 198.51.100.42.' },
  { time: '09:30:11', type: 'MULTISIG', severity: 'success', chain: true,
    msg: 'Proposal #42 (Mint ZUR1 Bricks) signed by 3/3 keys. Status: Executed.' },
  { time: '09:15:33', type: 'PRIVILEGE OVERRIDE', severity: 'warning', chain: false,
    msg: 'KYC bypass by admin.chen@brickchain.io — flagged for dual-signoff review.' },
  { time: '08:47:20', type: 'API ABUSE', severity: 'critical', chain: false,
    msg: '429 rate-limit hit 14× from IP 104.21.8.93 targeting /api/v1/documents/vault.' },
  { time: '08:22:05', type: 'BLACKLIST HIT', severity: 'critical', chain: true,
    msg: 'Sanctioned wallet 0xDEAD...C0DE attempted interaction with ZRH-SEEFELD token contract.' },
  { time: '07:58:41', type: 'MFA ALERT', severity: 'warning', chain: false,
    msg: 'SPV Manager muller@spv.ch MFA setup incomplete. Access window: 12 hrs remaining.' },
  { time: '07:01:00', type: 'MULTISIG', severity: 'success', chain: true,
    msg: 'Proposal #41 (Fee Update) signed by 2/3 keys. Status: Awaiting final signature.' },
]

const alertTriggers = [
  { id: 1, title: 'Impossible Geographical Travel',    category: 'Web2',         status: 'MONITORING', lastTriggered: '3 days ago',      border: 'border-red-400',    pill: 'bg-red-100 text-red-700'       },
  { id: 2, title: 'Multisig Proposal Expiry Alert',    category: 'Web3',         status: 'ACTIVE',     lastTriggered: '2h ago',          border: 'border-violet-400', pill: 'bg-violet-100 text-violet-700' },
  { id: 3, title: 'SPV Bank IBAN Modification Guard',  category: 'Web2 / Web3',  status: 'MONITORING', lastTriggered: 'Never triggered', border: 'border-amber-400',  pill: 'bg-amber-100 text-amber-700'   },
  { id: 4, title: 'Unscheduled Token Supply Deviation', category: 'Web3',        status: 'MONITORING', lastTriggered: '12 days ago',     border: 'border-red-400',    pill: 'bg-red-100 text-red-700'       },
  { id: 5, title: 'Root Override Bypass Watch',        category: 'Web2',         status: 'ACTIVE',     lastTriggered: '6h ago',          border: 'border-orange-400', pill: 'bg-orange-100 text-orange-700' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SeverityDot({ severity }) {
  const map = { critical: 'bg-red-500', warning: 'bg-amber-400', success: 'bg-emerald-500' }
  return <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 mt-0.5 ${map[severity] || 'bg-gray-400'}`} />
}

function SeverityBadge({ severity, type }) {
  const map = { critical: 'destructive', warning: 'warning', success: 'success' }
  return <Badge variant={map[severity] || 'default'}>{type}</Badge>
}

function MfaProgressBar({ group, onAction }) {
  const pct = Math.round((group.withMfa / group.total) * 100)
  const isSecure = pct === 100
  const filled = Math.round(pct / 5)

  return (
    <div
      className={`rounded-xl border p-4 ${isSecure ? 'border-emerald-200 bg-emerald-50/40' : 'border-amber-200 bg-amber-50/40 cursor-pointer hover:bg-amber-50 transition-colors'}`}
      onClick={() => !isSecure && onAction(group)}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-800">{group.label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold ${isSecure ? 'text-emerald-600' : 'text-amber-600'}`}>{pct}%</span>
          <Badge variant={isSecure ? 'success' : 'warning'}>
            {isSecure ? 'Secure' : `${group.missing.length} missing MFA`}
          </Badge>
        </div>
      </div>
      <div className="font-mono text-base text-gray-600 select-none">
        [<span className={isSecure ? 'text-emerald-500' : 'text-amber-500'}>{'█'.repeat(filled)}</span>
        <span className="text-gray-300">{'░'.repeat(20 - filled)}</span>]
      </div>
      <p className="mt-1 text-xs text-gray-500">
        {group.withMfa} / {group.total} accounts with MFA enabled
        {!isSecure && <span className="ml-2 text-amber-600 font-medium">— click to manage</span>}
      </p>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function AdminLinkSecurity() {
  const [mfaModalGroup, setMfaModalGroup] = useState(null)

  const totalMfa = Math.round(mfaGroups.reduce((s, g) => s + g.withMfa, 0) / mfaGroups.reduce((s, g) => s + g.total, 0) * 100)

  return (
    <Layout>
      <Header title="Link Security" subtitle="Platform security posture — Web2, Web3 & real-time alerts" />
      <main className="ds-page space-y-8">

        {/* ── KPI Strip ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="MFA Coverage"      value={`${totalMfa}%`} icon={Fingerprint}  color="green"  trend={2} />
          <StatCard label="Failed Login Rate" value="1.4%"           icon={AlertTriangle} color="amber"  trend={-18} />
          <StatCard label="Blacklist Hits"    value="0"              icon={ShieldCheck}   color="blue"   sub="No hits — all-time clean" />
          <StatCard label="Multisig Health"   value="3/3"            icon={KeyRound}      color="purple" sub="All 3 keys responding" />
        </div>

        {/* ── Web2 Metrics ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Server size={14} className="text-blue-500" />
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Web2 Security Metrics</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">

            {/* MFA Compliance — donut */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Staff MFA Compliance</CardTitle>
                  <Badge variant="warning">Action Needed</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center gap-5">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie dataKey="value" data={[{ value: 90 }, { value: 10 }]}
                        innerRadius="60%" outerRadius="80%" startAngle={90} endAngle={-270} strokeWidth={0}>
                        <Cell fill="#10b981" />
                        <Cell fill="#e5e7eb" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">90%</span>
                  </div>
                </div>
                <div className="space-y-2.5 flex-1">
                  <div className="flex justify-between text-xs"><span className="text-gray-500">MFA Active</span><span className="font-semibold text-gray-800">18 / 20</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-500">Missing MFA</span><span className="font-semibold text-red-600">3 accounts</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-500">Target</span><span className="font-semibold text-gray-800">100%</span></div>
                </div>
              </CardContent>
            </Card>

            {/* Failed Login Rate — area chart */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Failed Login Spike Rate</CardTitle>
                  <Badge variant="success">Within Threshold</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-bold text-gray-900">1.4%</span>
                  <span className="text-xs text-gray-400">rolling 60-min · target &lt;2%</span>
                </div>
                <ResponsiveContainer width="100%" height={80}>
                  <AreaChart data={loginRateData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="loginGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="t" hide />
                    <YAxis hide domain={[0, 3]} />
                    <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v) => [`${v}%`, 'Rate']} />
                    <ReferenceLine y={2} stroke="#ef4444" strokeDasharray="4 2" strokeWidth={1}
                      label={{ value: '2% limit', position: 'insideTopRight', fontSize: 9, fill: '#ef4444' }} />
                    <Area type="monotone" dataKey="rate" stroke="#f59e0b" fill="url(#loginGrad)" strokeWidth={2} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* API Abuse — bar chart */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">API Endpoint Abuse (429s)</CardTitle>
                  <Badge variant="destructive">Alert Active</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-bold text-red-600">14</span>
                  <span className="text-xs text-gray-400">rate-limit hits today · target 0</span>
                </div>
                <ResponsiveContainer width="100%" height={80}>
                  <BarChart data={apiAbuseData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <XAxis dataKey="h" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v) => [v, '429 hits']} />
                    <Bar dataKey="hits" radius={[3, 3, 0, 0]}>
                      {apiAbuseData.map((d, i) => (
                        <Cell key={i} fill={d.hits >= 10 ? '#ef4444' : d.hits > 2 ? '#f59e0b' : '#cbd5e1'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Privileged Action Auditing — donut */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Privileged Action Auditing</CardTitle>
                  <Badge variant="warning">Action Needed</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center gap-5">
                <div className="relative w-28 h-28 flex-shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie dataKey="value" data={[{ value: 94 }, { value: 6 }]}
                        innerRadius="60%" outerRadius="80%" startAngle={90} endAngle={-270} strokeWidth={0}>
                        <Cell fill="#7c3aed" />
                        <Cell fill="#e5e7eb" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900">94%</span>
                  </div>
                </div>
                <div className="space-y-2.5 flex-1">
                  <div className="flex justify-between text-xs"><span className="text-gray-500">With Ticket</span><span className="font-semibold text-gray-800">47 / 50</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-500">Missing Ticket</span><span className="font-semibold text-red-600">3 actions</span></div>
                  <div className="flex justify-between text-xs"><span className="text-gray-500">Target</span><span className="font-semibold text-gray-800">100%</span></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── Web3 Metrics ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Zap size={14} className="text-violet-500" />
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Web3 Security Metrics</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">

            {/* Lex Koller — bar chart */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Lex Koller Reverts</CardTitle>
                  <Badge variant="default">Informational</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-2xl font-bold text-sky-700">3</span>
                  <span className="text-xs text-gray-400">today · ERC-3643 blocks</span>
                </div>
                <ResponsiveContainer width="100%" height={80}>
                  <BarChart data={lexKollerData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                    <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v) => [v, 'Reverts']} />
                    <Bar dataKey="n" fill="#0ea5e9" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Blacklist Hits — full ring */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Blacklist Interactions</CardTitle>
                  <Badge variant="success">Clean</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center py-2">
                <div className="relative w-24 h-24">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie dataKey="value" data={[{ value: 1 }]}
                        innerRadius="60%" outerRadius="80%" startAngle={90} endAngle={-270} strokeWidth={0}>
                        <Cell fill="#10b981" />
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-emerald-600">0</span>
                    <span className="text-xs text-gray-400">hits</span>
                  </div>
                </div>
                <p className="text-xs text-emerald-600 font-semibold mt-2">No sanctioned wallet interactions</p>
              </CardContent>
            </Card>

            {/* Multisig Health — key list */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Multisig Signatory Health</CardTitle>
                  <Badge variant="success">3 / 3 Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-1">
                {signatories.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-semibold text-gray-800">{s.id}</span>
                      <span className="text-xs text-gray-400 font-mono ml-2">{s.address}</span>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{s.lastSeen}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* ── MFA Audit Progress Bars ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Lock size={14} className="text-emerald-500" />
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Staff Access & MFA Audit</h2>
            <span className="text-xs text-gray-400">— click amber bar to manage</span>
          </div>
          <Card>
            <CardContent className="pt-5 space-y-3">
              {mfaGroups.map((g, i) => (
                <MfaProgressBar key={i} group={g} onAction={setMfaModalGroup} />
              ))}
            </CardContent>
          </Card>
        </section>

        {/* ── Threat Vector Timeline ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Activity size={14} className="text-gray-500" />
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Threat Vector Timeline</h2>
            <span className="text-xs text-gray-400">— unified Web2 & Web3 event stream</span>
          </div>
          <Card>
            <CardContent className="pt-4">
              {threatEvents.map((ev, i) => (
                <div key={i} className={`flex items-start gap-3 py-3 border-b last:border-b-0 ${
                  ev.severity === 'critical' ? 'bg-red-50/40' : ev.severity === 'warning' ? 'bg-amber-50/30' : ''
                }`}>
                  <SeverityDot severity={ev.severity} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-xs font-mono text-gray-400">[{ev.time}]</span>
                      <SeverityBadge severity={ev.severity} type={ev.type} />
                      {ev.chain && (
                        <span className="text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded font-semibold">ON-CHAIN</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 leading-snug">{ev.msg}</p>
                  </div>
                  <Clock size={12} className="text-gray-300 flex-shrink-0 mt-1" />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        {/* ── High-Priority Alert Rules ── */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert size={14} className="text-red-500" />
            <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">High-Priority Alert Rules</h2>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {alertTriggers.map(t => (
              <Card key={t.id} className={`border-l-4 ${t.border}`}>
                <CardContent className="py-4 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-gray-500">{t.id}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{t.title}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${t.pill}`}>{t.category}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-0.5">Last triggered: {t.lastTriggered}</p>
                  </div>
                  <Badge variant={t.status === 'ACTIVE' ? 'warning' : 'secondary'}>{t.status}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

      </main>

      {/* ── MFA Action Modal ── */}
      {mfaModalGroup && (
        <Modal isOpen={!!mfaModalGroup} onClose={() => setMfaModalGroup(null)}
          title={`MFA Non-Compliance — ${mfaModalGroup.label}`} size="md">
          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <p className="text-sm text-amber-800 font-medium">
                {mfaModalGroup.missing.length} account(s) have not completed mandatory MFA setup.
              </p>
            </div>
            <div className="space-y-2">
              {mfaModalGroup.missing.map((email, i) => (
                <div key={i} className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center">
                      <Fingerprint size={13} className="text-amber-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">{email}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline"
                      className="gap-1.5 text-amber-700 border-amber-300 hover:bg-amber-50" onClick={() => {}}>
                      <Mail size={12} /> Send 2FA Link
                    </Button>
                    <Button size="sm" variant="outline"
                      className="gap-1.5 text-red-700 border-red-300 hover:bg-red-50" onClick={() => {}}>
                      <UserX size={12} /> Suspend
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setMfaModalGroup(null)}>
                <X size={14} className="mr-1.5" /> Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </Layout>
  )
}
