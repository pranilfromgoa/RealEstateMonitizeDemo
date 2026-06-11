# BrickBloc — Client Demo Walkthrough

A step-by-step script for demonstrating the platform to a client.
Open the app at **http://localhost:5173** before starting.

---

## Part 1 — The Landlord: Listing a Property

*Story: A property owner wants to tokenize their hotel and raise capital from investors.*

1. On the login screen, click the **Landlord** card (middle column — "Sarah Chen").
2. Click **Enter as Landlord**.
3. You land on the **Landlord Dashboard**. Point out the 4 summary cards at the top (properties listed, portfolio value, monthly rent income, bricks sold) and the 2 existing properties already live.

### Submit a New Property
4. In the left sidebar, click **Submit Property** (under Phase 1 MVP).
5. **Step 1 — Property Details:**
   - Type a property name, e.g. *"Pacific Pines Resort"*
   - Fill in an address, city (e.g. *Miami*), state (*FL*), set type to *Hospitality*
   - Enter an estimated value, e.g. *5000000* (five million)
   - Add a short description
   - **Tokenization Proposal section:** Select *80%* equity and *$100* price per Brick
   - Watch the **live snapshot panel** appear — it calculates estimated brick count (~40,000 Bricks) and desired raise ($4M) automatically
   - Add a note in the "Notes for platform team" box, e.g. *"Ready to close by Q3"*
   - Click **Next: Upload Documents**

6. **Step 2 — Document Upload:**
   - Click **Upload** next to each of the 4 required documents (Property Deed, LLC Certificate, Appraisal Report, Insurance Policy) — each turns green with a checkmark
   - Optionally upload the 2 optional docs (Rent Roll, Tax Records)
   - Click **Next: Review & Submit**

7. **Step 3 — Review:**
   - Show the full property summary, the tokenization proposal block (equity %, brick count, price, desired raise), and the uploaded document checklist
   - Click **Submit Property**
   - A confirmation screen appears with a reference ID — *"Your submission is under review"*

### Property Management (Phase 2)
8. In the sidebar, click **My Properties**.
9. Two property tabs appear at the top — click between them.
10. Point out the **Maintenance Log** on the right — existing logged issues with status (completed / in progress / pending). Click **Log Issue**, fill in a description, set priority to *High*, click **Log Issue** — it closes and the modal shows success.
11. Point out the **Tenant Directory** below — 4 tenants with unit numbers, lease dates, and renewal status badges.

---

## Part 2 — The Admin: Reviewing and Tokenizing

*Story: The platform team reviews the landlord's submission, approves it, and mints the Bricks.*

1. Click the **BrickBloc** logo (top-left) or navigate to **http://localhost:5173** to return to login.
2. Click the **Platform Admin** card (right column — "Daniel").
3. Click **Enter as Platform Admin**.
4. You land on the **Admin Dashboard**. Point out:
   - The **amber alert banner** at the top: *"3 property submissions pending review"* — click **Review**
   - The **blue alert banner** below: *"1 rent payout pending"* — click **Process** (come back to this later)

### Reviewing Submissions
5. You are now on the **Approvals** page. The **Properties** tab is active — 3 submissions are listed.
6. Click **Review** on any submission — a detail modal shows address, property type, estimated value, landlord name, and a per-document checklist showing which docs are uploaded vs. missing.
7. Click **Approve & Proceed** — the status badge on that row turns green and shows *"approved"*.
8. Click the **KYC/KYB** tab — shows identity and business verification requests with the same Approve/Reject controls.

### Minting Bricks (Tokenization Engine)
9. In the sidebar, click **Brick Maker**.
10. At the top, the **"Approved & Ready to Tokenize"** queue shows **Harbor Walk Hotel** (the pre-approved submission). Point out the proposal card: 80% equity, $100/brick, 52,000 suggested bricks, $5.2M desired raise, and the landlord's note.
11. Click **Pre-fill Brick Maker** — the form below is instantly populated with all values from the landlord's proposal.
12. Point out the **amber comparison panel**: *"Landlord Proposed → Platform Final"* — the admin can override any value. Change **Brick Count** to *50000* — the field highlights violet to show it was modified.
13. Click **Run Tokenization Engine** — a 6-step progress animation plays:
    - Property Validation
    - LLC Confirmation
    - Valuation Set
    - Brick Count Defined
    - Smart Contract Deployed
    - Bricks Minted ✓
14. A success screen appears showing the mock **contract address**, bricks issued, price per Brick, and total raise.
15. Scroll down the right panel — the newly tokenized property now appears in the **Tokenized Properties** list.

### Processing a Rent Payout
16. In the sidebar, click **Rent Payouts**.
17. The **Pending Payouts** section (amber background) shows *Riverside Industrial Park*. Click **Process Payout**.
18. The modal shows the property name. Enter the rent received, e.g. *34850*.
19. Watch the **live breakdown** calculate: Gross Rent → 5% Platform Fee deducted → Net to Distribute shown in green.
20. Click **Confirm & Distribute** — a processing animation runs for ~2 seconds, then *"Payout Distributed!"* success screen appears.
21. The payout moves from Pending to the **Payout History** table with a generated transaction hash.

### Fee Management (Phase 2)
22. In the sidebar click **Fee Management**.
23. Show the 5 fee rules: Rent Distribution (5%), Primary Market Purchase (0.5%), Secondary Market Trade (1%), Landlord Listing ($250), KYB ($99).
24. Click **Edit** next to *Primary Market Purchase Fee* — change *0.5* to *0.75* — click **Save** — a *"Saved ✓"* badge appears.
25. Scroll down to the **Fee Revenue by Property** table — shows how much each property has earned the platform.

---

## Part 3 — The Investor: Buying and Managing Bricks

*Story: A verified investor browses properties, buys Bricks, and tracks their earnings.*

1. Return to the login screen and click the **Investor** card — *Alex Rivera*.
2. Click **Enter as Investor**.
3. You land on the **Investor Dashboard**. Point out:
   - **$45,000** total invested, **450 Bricks** owned across 3 properties
   - **$3,294** all-time rent earned, **$314/mo** estimated monthly income
   - The **My Portfolio** table listing 3 properties with yields (8.2%, 6.8%, 10.2%)
   - The **Recent Activity** feed — buys, sells, and rent received with color-coded icons
   - The green **KYC Verified** card at the bottom-right

### Browsing and Buying
4. In the sidebar, click **Properties**.
5. 6 property cards are shown. Type *"Sunset"* in the search bar — filters instantly to 1 result. Clear it.
6. Click the type filter buttons (Commercial, Residential, etc.) to show filtering works.
7. Click **Details** on *Oakwood Business Center* — the modal shows description, 6 key stats (total value, price/brick, yield, monthly rent, total bricks, available), property highlights checklist, and verified documents with green badges.
8. Click **Buy Bricks** from the modal (or from the card directly).
9. Use the **+/−** buttons to change the quantity to *25 Bricks*.
10. Point out the live calculation: Price per Brick × Quantity + 0.5% fee = Total, and the estimated monthly income preview.
11. Click **Confirm Purchase** — success screen shows *"Purchase Successful! 25 Bricks in Oakwood Business Center"*.

### Portfolio
12. In the sidebar, click **My Portfolio**.
13. Each holding shows: bricks owned, current value, rent earned, monthly income, ownership %, purchase date, and unrealized gain/loss in a green or red chip.
14. Scroll down to the **Transaction History** table — shows all buys, sells, and rent payments with on-chain tx hashes.

### KYC Verification
15. In the sidebar, click **KYC Verification**.
16. Show the green *"Identity Verified"* banner with the verification date and expiry.
17. Point out the **4-step checklist** (all completed) and the 3 submitted documents (Passport, Utility Bill, Selfie) — all verified.
18. Point to the *"What KYC Unlocks"* panel: buy/sell Bricks, receive rent, secondary market access, voting, tax documents, enhanced limits.

---

## Part 4 — Phase 2 & 3 Features (Future Roadmap)

*Explain these as "what we're building next" — all screens are built and clickable.*

### Secondary Market Trading (Phase 2)
19. In the sidebar, click **Trading Desk** (under Phase 2 Growth).
20. The **Phase 2** badge is shown — explain this is the peer-to-peer resale market.
21. The **Buy Bricks** tab shows 5 active listings with ask prices and premium vs. floor price indicators.
22. Click **Buy** on any listing — the modal shows quantity input, 1% trading fee, and order total.
23. Switch to the **List Bricks for Sale** tab — the investor's 3 holdings are shown. Click **List for Sale** on one — enter quantity (e.g. 20) and ask price (e.g. $103). The modal computes net proceeds after 1% fee.

### Tax Documents (Phase 2)
24. Click **Tax Documents** in the sidebar.
25. Show the 2024 summary tiles: total income, capital gains, platform fees paid.
26. The *Form 1099-DIV 2024* document is listed as **Ready** with a Download button. The 2023 form is *In Progress*.

### Governance / Voting (Phase 3)
27. Click **Voting** in the sidebar (under Phase 3 Upgrade).
28. Two active proposals are shown. Click **For** on the first one, then click **Submit Vote** — a *"Vote submitted — Voted For"* confirmation appears.
29. A closed proposal at the bottom shows the final pass/fail result and participation rate.

### AI Document Reader (Phase 3)
30. Click **AI Doc Reader** in the sidebar.
31. The left panel shows all 6 properties — click *Maple Grove Townhomes* to switch the document context.
32. Click one of the **suggestion chips**, e.g. *"What are the main risks in this property?"* — the AI assistant responds in ~1.5 seconds with a detailed answer.
33. Type a custom question in the input, e.g. *"Is the LLC structure investor-friendly?"* and press Enter — another tailored response appears.
34. Point out the **Documents Loaded** list on the left showing all verified documents the AI has "read."

---

## Quick Reference: Login Personas

| Role | Name | Email | Sidebar Color |
|------|------|-------|--------------|
| Investor | Alex Rivera | alex.rivera@email.com | Blue |
| Landlord | Sarah Chen | sarah.chen@properties.com | Emerald |
| Admin | Daniel | daniel@brickbloc.com | Violet |

## Feature Phase Summary

| Phase | What It Shows |
|-------|--------------|
| **Phase 1 — MVP** | Core tokenization loop: upload → approve → mint Bricks → buy → earn rent |
| **Phase 2 — Growth** | Automation & self-serve: trading desk, tax docs, property management, fee engine |
| **Phase 3 — Upgrade** | Smart features: AI document reader, governance voting |
