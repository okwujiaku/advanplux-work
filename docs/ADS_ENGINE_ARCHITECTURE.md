# Ads Engine – Structure & Flow

This doc explains how the “Ads Engine” works on Advanplux so the product and code stay aligned and less confusing.

---

## What “Ads Engine” means

- **Ads Engine** = Your daily allowance to watch ads and earn. It is “activated” when you buy a **package** and the payment is approved.
- You don’t “have” an engine until you complete: **choose package → pay (deposit) → admin approves**.

---

## User journey (step by step)

```
1. DEPOSIT (add to balance)
   User goes to "Deposit"
   → Enters any amount in USD (or quick-select $20, $50, …)
   → Selects country, payment account, submits
   → Admin approves → amount is added to user’s balance only (no pack yet)

2. ACTIVATE ADS ENGINE (use balance)
   User goes to "Get Ads Engine"
   → Sees current balance at top
   → Chooses a package ($20, $50, $100, …) they can afford (balance >= pack price)
   → Clicks "Activate" → balance is deducted, package is activated (userPack set)

3. USE IT (WATCH & EARN)
   User goes to "Watch & Earn"
   → Sees YouTube ad, clicks play → 30s timer runs → reward added, next ad loads
   → Repeats until daily limit (from activated package) is reached
```

So there are **two main screens**:

| Step | Screen | Route | Purpose |
|------|--------|--------|--------|
| Add funds | Deposit any amount | `/dashboard/deposit` | Top up balance (admin approves → balance only) |
| Get access | Activate package from balance | `/dashboard/purchase` | Pick a plan you can afford, activate (deducts balance) |
| Use it | Watch ads and earn | `/dashboard/watch` | Watch videos, timer, earn $0.40/ad |

---

## Why it felt confusing

- **“Purchase Ads Engine”** and **“Get Ads Engine”** both point at the same flow: choose package → deposit. That’s correct.
- **“My Ads Engine”** and **“Watch Ads and get paid”** both point at the **same** page (`/dashboard/watch`). So one action had two names, which makes it unclear if they’re the same or different.
- “My Ads Engine” sounds like a **dashboard/settings** for your engine, but it’s actually the **Watch & Earn** screen. So the name didn’t match the action.

---

## Clearer structure (recommended)

- **One name for “watch ads”:** Use **“Watch & Earn”** everywhere (quick link, nav, page title). Remove or avoid **“My Ads Engine”** as the label for that screen.
- **One name for “buy access”:** Use either **“Get Ads Engine”** or **“Purchase Ads Engine”** for the package + deposit flow, and keep a single quick link to `/dashboard/purchase`.
- **Flow in one sentence:**  
  **Get Ads Engine** (choose package, pay) → after approval → **Watch & Earn** (watch ads, earn).

---

## In the codebase

| What | Where |
|------|--------|
| Package definitions (e.g. $20 = 2 ads/day) | `AppContext.jsx` → `PACKS_USD` |
| Deposit (any amount → balance only) | `Deposit.jsx` → route `/dashboard/deposit` |
| Admin approves deposit → adds to balance | `api/admin/deposits.js` (no pack; balance only) |
| Activate pack from balance | `AdGenerator.jsx` + `activatePack()` → `PATCH /api/user/wallet` (activatePackUsd) |
| User’s active pack stored | `user_wallet.active_pack_usd` (Supabase) |
| Watch ads, timer, earn | `WatchEarn.jsx` → route `/dashboard/watch` |
| Ad video list (YouTube URLs) | Fetched from API `GET /api/ad-videos`; admin saves in Video Manager |

---

## Suggested UI labels (to avoid glitches and confusion)

- **Quick link 1:** **“Get Ads Engine”** or **“Purchase Ads Engine”** → `/dashboard/purchase`  
  Optional subtitle: “Choose a package and pay to unlock daily ads.”

- **Quick link 2:** **“Watch & Earn”** → `/dashboard/watch`  
  Optional subtitle: “Watch ads and earn $0.40 per ad.”

- **Bottom nav:** Keep **“Watch Ads and get paid”** or change to **“Watch & Earn”** so it matches the quick link and the page title.

That way, the structure is: **one place to get the engine (purchase flow), one place to use it (Watch & Earn)**, with one consistent name for each.
