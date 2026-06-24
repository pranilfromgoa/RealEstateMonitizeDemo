const fmtChf = (n) =>
  new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }).format(n)

function apyColor(apy) {
  if (apy >= 8) return '#15803d'
  if (apy >= 6) return '#b45309'
  return '#b91c1c'
}

function apyBadge(apy, isApproved) {
  if (isApproved) return '<span class="badge badge-approved">✓ Approved</span>'
  if (apy >= 8)   return '<span class="badge badge-strong">Strong Deal</span>'
  if (apy >= 6)   return '<span class="badge badge-borderline">Borderline</span>'
  return '<span class="badge badge-below">Below Threshold</span>'
}

function discountLabel(asking, negotiated) {
  const diff = ((asking - negotiated) / asking) * 100
  if (diff > 0) return diff.toFixed(1) + '% discount vs. asking'
  if (diff < 0) return Math.abs(diff).toFixed(1) + '% premium vs. asking'
  return 'At asking price'
}

function buildComparisonRows(rows, bestRow) {
  return rows.map(r => `
    <tr class="${r === bestRow ? 'winner' : ''}">
      <td>
        <div class="prop-name">${r.prospect.name}</div>
        <div class="prop-sub">${r.prospect.city}, ${r.prospect.canton} &middot; ${r.prospect.propertyType} &middot; ${r.prospect.condition || ''}</div>
      </td>
      <td class="r">${fmtChf(r.prospect.askingPrice)}</td>
      <td class="r">${fmtChf(r.soft.negotiatedPrice)}</td>
      <td class="r">${r.soft.vacancyRate}%</td>
      <td class="r">${fmtChf(r.output.noi)}</td>
      <td class="r" style="color:${apyColor(r.output.holderAPY)};font-weight:900;">${r.output.holderAPY.toFixed(1)}%</td>
      <td>${apyBadge(r.output.holderAPY, r.isApproved)}</td>
    </tr>`).join('')
}

function buildHTML({ rows, bestRow, userName, timestamp }) {
  const comparisonSection = rows.length > 1 ? `
  <div class="section">
    <div class="section-head">
      <span class="section-tag">C &mdash; Comparison Matrix (${rows.length} Properties Evaluated)</span>
      <div class="section-rule"></div>
    </div>
    <table class="cmp-table">
      <thead>
        <tr>
          <th>Property</th>
          <th class="r">Asking Price</th>
          <th class="r">Neg. Price</th>
          <th class="r">Vacancy</th>
          <th class="r">NOI / yr</th>
          <th class="r">Holder APY</th>
          <th>Outcome</th>
        </tr>
      </thead>
      <tbody>${buildComparisonRows(rows, bestRow)}</tbody>
    </table>
  </div>` : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Investment Memo &mdash; ${bestRow.prospect.name} &mdash; Brickchain</title>
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
@page { size: A4; margin: 18mm 20mm 24mm 20mm; }
body {
  font-family: -apple-system, 'Helvetica Neue', Arial, sans-serif;
  font-size: 9.5pt;
  color: #1e293b;
  background: white;
  line-height: 1.55;
}
body::before {
  content: 'INTERNAL USE ONLY';
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-42deg);
  font-size: 62pt;
  font-weight: 900;
  color: rgba(3, 105, 161, 0.045);
  white-space: nowrap;
  pointer-events: none;
  z-index: -1;
  letter-spacing: 0.06em;
}

/* Print bar */
.print-bar {
  background: #0369a1;
  color: white;
  padding: 10px 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 36px;
}
.print-brand { font-size: 11pt; font-weight: 900; letter-spacing: 0.22em; }
.print-actions { display: flex; gap: 10px; align-items: center; }
.print-hint { font-size: 8pt; opacity: 0.7; }
.btn-pdf {
  background: white; color: #0369a1; border: none;
  padding: 7px 18px; border-radius: 8px; font-weight: 700;
  cursor: pointer; font-size: 9.5pt;
}
.btn-close {
  background: transparent; color: white;
  border: 1px solid rgba(255,255,255,0.35);
  padding: 7px 14px; border-radius: 8px; font-weight: 600;
  cursor: pointer; font-size: 9.5pt;
}
@media print { .print-bar { display: none; } }

/* Content */
.content { max-width: 700px; margin: 0 auto; padding: 0 28px 40px; }
@media print { .content { max-width: none; padding: 0; } }

/* Doc header */
.doc-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  padding-bottom: 12px; border-bottom: 2.5px solid #0369a1; margin-bottom: 18px;
}
.brand { font-size: 8pt; font-weight: 900; letter-spacing: 0.24em; color: #0369a1; text-transform: uppercase; }
.doc-meta { text-align: right; font-size: 7.5pt; color: #64748b; line-height: 1.7; }
.doc-title { font-size: 17pt; font-weight: 900; color: #0f172a; letter-spacing: -0.02em; margin-bottom: 5px; }
.doc-subtitle { font-size: 8.5pt; color: #64748b; margin-bottom: 22px; line-height: 1.6; }

/* Sections */
.section { margin-bottom: 20px; }
.section-head { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.section-tag { font-size: 7pt; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.18em; white-space: nowrap; }
.section-rule { flex: 1; height: 1px; background: #e2e8f0; }

/* Executive summary */
.exec-box {
  background: #f0f9ff; border: 1px solid #bae6fd;
  border-left: 4px solid #0369a1; border-radius: 8px; padding: 16px 20px;
}
.exec-pill {
  display: inline-block; background: #0369a1; color: white;
  font-size: 7.5pt; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.12em; padding: 3px 12px; border-radius: 99px; margin-bottom: 9px;
}
.exec-name { font-size: 13pt; font-weight: 900; color: #0f172a; margin-bottom: 3px; }
.exec-sub { font-size: 8pt; color: #475569; }
.exec-kpis {
  display: grid; grid-template-columns: repeat(3, 1fr);
  margin-top: 14px; padding-top: 14px; border-top: 1px solid #bae6fd;
}
.exec-kpi { padding-right: 18px; }
.exec-kpi + .exec-kpi { border-left: 1px solid #bae6fd; padding-left: 18px; padding-right: 0; }
.kpi-label { font-size: 7pt; color: #64748b; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 3px; }
.kpi-val { font-size: 14pt; font-weight: 900; color: #0369a1; font-variant-numeric: tabular-nums; line-height: 1.1; }
.kpi-val.sm { font-size: 11pt; }

/* Assumptions */
.assump-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.assump-box { border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; }
.assump-head {
  background: #f8fafc; padding: 7px 12px; font-size: 7.5pt;
  font-weight: 700; color: #475569; text-transform: uppercase;
  letter-spacing: 0.1em; border-bottom: 1px solid #e2e8f0;
}
.assump-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 5px 12px; border-bottom: 1px solid #f1f5f9;
}
.assump-row:last-child { border-bottom: none; }
.al { font-size: 8.5pt; color: #64748b; }
.av { font-size: 8.5pt; font-weight: 700; color: #0f172a; font-variant-numeric: tabular-nums; }
.av.accent { color: #0369a1; }

/* Comparison */
.cmp-table {
  width: 100%; border-collapse: collapse; font-size: 8.5pt;
  border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden;
}
.cmp-table th {
  background: #f8fafc; padding: 7px 10px; text-align: left;
  font-size: 7pt; font-weight: 700; color: #64748b;
  text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 2px solid #e2e8f0;
}
.cmp-table th.r { text-align: right; }
.cmp-table td { padding: 8px 10px; color: #334155; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
.cmp-table td.r { text-align: right; font-variant-numeric: tabular-nums; }
.cmp-table tr:last-child td { border-bottom: none; }
.cmp-table tr.winner td { background: #f0f9ff; }
.prop-name { font-weight: 700; color: #0f172a; }
.prop-sub { font-size: 7pt; color: #94a3b8; margin-top: 1px; }

/* Badges */
.badge { display: inline-block; padding: 2px 8px; border-radius: 99px; font-size: 7pt; font-weight: 700; white-space: nowrap; }
.badge-approved    { background: #dcfce7; color: #15803d; }
.badge-strong      { background: #d1fae5; color: #065f46; }
.badge-borderline  { background: #fef9c3; color: #a16207; }
.badge-below       { background: #fee2e2; color: #b91c1c; }

/* Approval */
.approval-box { border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px; background: #fafafa; }
.approval-note { font-size: 8.5pt; color: #475569; margin-bottom: 18px; line-height: 1.65; }
.sig-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
.sig-line { border-bottom: 1px solid #94a3b8; margin-bottom: 6px; height: 28px; }
.sig-pre { font-size: 8pt; color: #475569; margin-bottom: 2px; }
.sig-label { font-size: 7pt; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; }

/* Footer (every print page) */
.doc-footer {
  position: fixed; bottom: 14mm; left: 20mm; right: 20mm;
  display: flex; justify-content: space-between;
  font-size: 7pt; color: #94a3b8;
  border-top: 1px solid #e2e8f0; padding-top: 5px;
}
@media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
</style>
</head>
<body>

<div class="print-bar">
  <div class="print-brand">BRICKCHAIN</div>
  <div class="print-actions">
    <span class="print-hint">Review the memo, then save as PDF</span>
    <button class="btn-pdf" onclick="window.print()">&#128438; Print / Save as PDF</button>
    <button class="btn-close" onclick="window.close()">Close</button>
  </div>
</div>

<div class="content">

  <div class="doc-header">
    <div class="brand">Brickchain &middot; Real Estate Tokenization Platform</div>
    <div class="doc-meta">
      Prepared by: <strong>${userName}</strong><br>
      Generated: ${timestamp}<br>
      Classification: Internal Use Only
    </div>
  </div>

  <div class="doc-title">Pre-Purchase Simulation &amp; Investment Memo</div>
  <div class="doc-subtitle">
    Stress-tested scenario analysis prepared for Investment Committee review. All figures are simulation
    outputs based on the assumptions documented herein and do not constitute a guarantee of returns.
  </div>

  <!-- A: Executive Summary -->
  <div class="section">
    <div class="section-head">
      <span class="section-tag">A &mdash; Executive Summary</span>
      <div class="section-rule"></div>
    </div>
    <div class="exec-box">
      <div class="exec-pill">${bestRow.isApproved ? '&#10003; Approved for SPV Pipeline' : '&#11088; Highest-Performing Asset'}</div>
      <div class="exec-name">${bestRow.prospect.name}</div>
      <div class="exec-sub">
        ${bestRow.prospect.city}, ${bestRow.prospect.canton} &nbsp;&middot;&nbsp;
        ${bestRow.prospect.propertyType} &nbsp;&middot;&nbsp;
        ${bestRow.prospect.units} units &nbsp;&middot;&nbsp;
        ${bestRow.prospect.sqm} m&sup2; &nbsp;&middot;&nbsp;
        Broker: ${bestRow.prospect.broker}
      </div>
      <div class="exec-kpis">
        <div class="exec-kpi">
          <div class="kpi-label">Simulated Holder APY</div>
          <div class="kpi-val">${bestRow.output.holderAPY.toFixed(1)}%</div>
        </div>
        <div class="exec-kpi">
          <div class="kpi-label">Total Capital to Raise</div>
          <div class="kpi-val sm">${fmtChf(bestRow.output.totalCapital)}</div>
        </div>
        <div class="exec-kpi">
          <div class="kpi-label">Net Operating Income / yr</div>
          <div class="kpi-val sm">${fmtChf(bestRow.output.noi)}</div>
        </div>
      </div>
    </div>
  </div>

  <!-- B: Assumptions -->
  <div class="section">
    <div class="section-head">
      <span class="section-tag">B &mdash; Assumptions &amp; Stress-Test Inputs &mdash; ${bestRow.prospect.name}</span>
      <div class="section-rule"></div>
    </div>
    <div class="assump-grid">
      <div class="assump-box">
        <div class="assump-head">Hard Variables &mdash; Broker Data (Fixed)</div>
        <div class="assump-row"><span class="al">Asking Price</span><span class="av">${fmtChf(bestRow.prospect.askingPrice)}</span></div>
        <div class="assump-row"><span class="al">Est. Capex / Renovations</span><span class="av">${fmtChf(bestRow.prospect.estimatedCapex)}</span></div>
        <div class="assump-row"><span class="al">Current Gross Rent / yr</span><span class="av">${fmtChf(bestRow.prospect.currentGrossRent)}</span></div>
        <div class="assump-row"><span class="al">Fixed Operational Costs / yr</span><span class="av">${fmtChf(bestRow.prospect.fixedOpCosts)}</span></div>
        <div class="assump-row"><span class="al">Property Type</span><span class="av">${bestRow.prospect.propertyType}</span></div>
        <div class="assump-row"><span class="al">Asset Condition</span><span class="av">${bestRow.prospect.condition || '&mdash;'}</span></div>
      </div>
      <div class="assump-box">
        <div class="assump-head">Soft Variables &mdash; Researcher Stress-Test</div>
        <div class="assump-row"><span class="al">Negotiated Purchase Price</span><span class="av accent">${fmtChf(bestRow.soft.negotiatedPrice)}</span></div>
        <div class="assump-row"><span class="al">vs. Asking Price</span><span class="av accent">${discountLabel(bestRow.prospect.askingPrice, bestRow.soft.negotiatedPrice)}</span></div>
        <div class="assump-row"><span class="al">Assumed Vacancy Rate</span><span class="av accent">${bestRow.soft.vacancyRate}%</span></div>
        <div class="assump-row"><span class="al">SPV Management Fee</span><span class="av accent">${bestRow.soft.spvMgmtFee}%</span></div>
        <div class="assump-row"><span class="al">Platform Fee</span><span class="av accent">${bestRow.soft.platformFee}%</span></div>
        <div class="assump-row"><span class="al">Capital Buffer</span><span class="av accent">${bestRow.soft.capitalBuffer}%</span></div>
      </div>
    </div>
  </div>

  <!-- C: Comparison Matrix -->
  ${comparisonSection}

  <!-- D: Approval -->
  <div class="section">
    <div class="section-head">
      <span class="section-tag">D &mdash; Approval &amp; Sign-Off</span>
      <div class="section-rule"></div>
    </div>
    <div class="approval-box">
      <div class="approval-note">
        This memo documents the simulation parameters and results as of the timestamp above.
        By signing below, all parties confirm that the assumptions have been reviewed, the investment
        recommendation is understood, and the property is approved for further SPV structuring and
        tokenization on the Brickchain platform.
      </div>
      <div class="sig-grid">
        <div>
          <div class="sig-line"></div>
          <div class="sig-pre">${userName}</div>
          <div class="sig-label">Prepared By &mdash; Research</div>
        </div>
        <div>
          <div class="sig-line"></div>
          <div class="sig-label">Approved By &mdash; Investment Committee</div>
        </div>
        <div>
          <div class="sig-line"></div>
          <div class="sig-label">Date of Approval</div>
        </div>
      </div>
    </div>
  </div>

</div>

<div class="doc-footer">
  <span>Brickchain Platform &middot; Pre-Purchase Simulation &amp; Investment Memo &middot; ${timestamp}</span>
  <span>INTERNAL USE ONLY &mdash; CONFIDENTIAL</span>
</div>

</body>
</html>`
}

export function exportMemoToPDF({ rows, userName, timestamp }) {
  const approvedRows = rows.filter(r => r.isApproved)
  const bestRow = approvedRows.length > 0
    ? [...approvedRows].sort((a, b) => b.output.holderAPY - a.output.holderAPY)[0]
    : [...rows].sort((a, b) => b.output.holderAPY - a.output.holderAPY)[0]

  const html = buildHTML({ rows, bestRow, userName, timestamp })

  const win = window.open('', '_blank', 'width=1050,height=800')
  if (!win) {
    alert('Pop-ups are blocked. Please allow pop-ups for this page to export the PDF.')
    return
  }
  win.document.write(html)
  win.document.close()
  setTimeout(() => { win.focus(); win.print() }, 650)
}
