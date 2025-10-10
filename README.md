## GenLayer Daily Check-in

Daily on-chain check-ins and streaks on GenLayer StudioNet.


- **Repo**: https://github.com/<org>/<repo>
- **Demo**: https://<your-demo-url>

## Versions
| Tool | Version |
|-----------------|---------|
| genlayer-js | 0.18.2 |
| Next.js | 15.5.4 |
| wagmi | 2.17.5 |
| RainbowKit | 2.2.8 |
| Node.js | 18/20 LTS |
| ethers | 6.15.0 |

## Table of Contents
- [Overview](#overview)
- [Inspiration & Vision](#inspiration--vision)
- [Architecture at a Glance](#architecture-at-a-glance)
- [About GenLayer / StudioNet](#about-genlayer--studionet)
- [Packages Used (Why & How)](#packages-used-why--how)
- [Quick Start](#quick-start)
- [Environment Variables](#environment-variables)
- [GenLayer Client Setup (StudioNet)](#genlayer-client-setup-studionet)
- [Contract Interaction Examples](#contract-interaction-examples)
- [Business Logic & Workflow](#business-logic--workflow)
- [UI/UX Notes](#uiux-notes)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Security & Limitations](#security--limitations)
- [Roadmap](#roadmap)
- [FAQ](#faq)
- [License & Credits](#license--credits)

## Overview
- **What**: Daily on-chain check-ins with streak tracking and a simple 7‑day view.
- **Why**: Build a habit around GenLayer, teach Accepted vs Finalized, and keep StudioNet lively.
- **How it works**:
  - Connect wallet, view today’s status and streak.
  - Click “Check In” once per UTC day.
  - App waits for Finalized, then refetches your stats.


## Inspiration & Vision
- **Current context**: GenLayer currently offers limited public testnet interactions; most community activity is social. Users want a simple, reliable way to touch the network daily.
- **Why GenDaily**: A daily, meaningful on-chain loop—check-ins, streaks, and lightweight rewards—creates a small, repeatable action that increases “time with protocol.”
- **Why now**: With genlayer-js maturing and StudioNet stabilizing, a daily actions dApp can bridge the gap between social engagement and real on-chain usage.
- **Outcomes**:
  - Habit formation around GenLayer (daily check-ins)
  - Teachable moments about finality & receipts
  - Foundation for quests, badges, raffles, referral trees, and progressive rewards

I believe GenDaily can be a small but steady heartbeat that helps the GenLayer community grow stronger every day.

## Architecture at a Glance
Short stack summary:
- Contract: `DailyCheckinPyUTC` (genlayer‑py), tracks per‑address daily check-ins in UTC.
- Client: Next.js (App Router) + TypeScript using `genlayer-js` to read/write, wagmi/RainbowKit for wallets, React Query for state.

```text
[Browser UI (Next.js + MUI)]
        │
        ▼
[wagmi + RainbowKit] — Wallet (MetaMask)
        │
        ▼
     genlayer-js
        │
        ▼
   GenLayer StudioNet
 (Accepted → Finalized)
```

## About GenLayer / StudioNet
- **ChainId**: 61999
- **RPC**: https://studio.genlayer.com/api
- **Finality model**:
  - Transactions are first “Accepted” then become “FINALIZED.”
  - UX waits for **FINALIZED** before updating streaks/stats to avoid confusion.
  - Docs: > TODO: Link to official GenLayer docs for Accepted vs FINALIZED and `appealTransaction`.
- **Appeal**: Developer‑friendly mental model for receipts and finality; a practical environment to build user intuition around on-chain confirmations.

## Packages Used (Why & How)
- **genlayer-js**: Core client to read/write the contract on StudioNet; exposes `createClient`, `readContract`, `writeContract`, `waitForTransactionReceipt`.
- **wagmi**: React hooks for wallet connections, accounts, and network state.
- **@rainbow-me/rainbowkit**: Wallet modal and connectors, optimized UX for MetaMask and others.
- **@mui/material**: UI primitives and theming to build a consistent, accessible interface.
- **@tanstack/react-query**: Server state, caching, refetching after writes; orchestrates the Accepted→Finalized polling cycle.
- **ethers**: Utilities for addresses, BigInt conversions, and ABI interactions where applicable.

## Quick Start
- **Prereqs**:
  - Node.js LTS
  - MetaMask installed

- **Install & Run**
```bash
npm i
npm run dev
```

- **.env**
```bash
NEXT_PUBLIC_GENLAYER_NETWORK=studionet
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYOUR_CONTRACT
NEXT_PUBLIC_APP_NAME=GenLayer Daily Check-in
```

## Environment Variables
| Key | Example | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_GENLAYER_NETWORK` | `studionet` | Target GenLayer network. |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0xYOUR_CONTRACT` | `DailyCheckinPyUTC` contract on StudioNet. |
| `NEXT_PUBLIC_APP_NAME` | `GenLayer Daily Check-in` | App name for wallet/signing context. |
| Visibility | Public | All variables are prefixed with `NEXT_PUBLIC_` and are safe to expose. |

## GenLayer Client Setup (StudioNet)
Use `genlayer-js` with StudioNet and an EOA from MetaMask. Initialize the consensus smart contract before reads/writes.

```ts
import { createClient } from 'genlayer-js';
import { studionet } from 'genlayer-js/chains';

export const client = createClient({
  chain: studionet,
  account: '0xYOUR_ADDRESS', // MetaMask signs
});

await client.initializeConsensusSmartContract();
```

- Recommendation: Initialize once on app boot or after wallet connect, before contract calls.

## Contract Interaction Examples
- **Contract**: `DailyCheckinPyUTC`
- **Address (StudioNet)**: > TODO: Set `address_studionet`
- **Methods**:
  - Write
    - `check_in`: Check-in for the current UTC day
  - View
    - `get_my_stats`: Return `{last_day, streak, total}`
    - `is_checked_today`: Return `bool`
    - `current_day_index`: Return day index since 1970‑01‑01 UTC
    - `get_day_range_counts(start_day, end_day)`: Return array of counts per day
    - `next_reset_time`: UTC timestamp for next reset

### Read: `get_my_stats`
```ts
const stats = await client.readContract({
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
  functionName: 'get_my_stats',
  args: [],
});
// -> { last_day, streak, total }
```

### Write + wait FINALIZED: `check_in`
```ts
const hash = await client.writeContract({
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
  functionName: 'check_in',
  args: [],
});

const receipt = await client.waitForTransactionReceipt({
  hash,
  status: 'FINALIZED',
  retries: 100,
  interval: 3000,
});
```

### 7-day range
```ts
const today = await client.readContract({
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
  functionName: 'current_day_index',
  args: [],
});

const counts = await client.readContract({
  address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
  functionName: 'get_day_range_counts',
  args: [Number(today) - 6, Number(today)],
});
```

### OPTIONAL: Appeal if still not FINALIZED after N polls
```ts
// OPTIONAL: appeal if still not finalized after N polls
const appealHash = await client.appealTransaction({ txId: hash });
await client.waitForTransactionReceipt({ hash: appealHash, status: 'FINALIZED' });
```

## API Reference (DailyCheckinPyUTC)

| Method | Type | Params | Returns | Notes |
|---|---|---|---|---|
| `check_in()` | write | – | `txHash` | One check per UTC day. UI waits for FINALIZED. |
| `get_my_stats()` | view | – | `{ last_day: int, streak: int, total: int }` | `last_day` = UTC day index since 1970-01-01 |
| `is_checked_today()` | view | – | `bool` | True if already checked in for current UTC day |
| `current_day_index()` | view | – | `int` | `floor(unix_utc / 86400)` |
| `get_day_range_counts(start, end)` | view | `int`, `int` | `int[]` | Inclusive range of day indices |
| `next_reset_time()` | view | – | `int (unix)` | UTC timestamp of next daily reset |

## Business Logic & Workflow
- **Time source**: UTC (`datetime.now(timezone.utc)` in contract).
- **Day definition**: 00:00:00 UTC boundaries; day index since 1970‑01‑01 UTC.
- **Streak semantics**: Increment when checking in on consecutive UTC days; break on a missed day.
- **TX flow**:
  1. Connect wallet (wagmi/RainbowKit).
  2. Read today’s status and streak.
  3. Write `check_in`.
  4. Status: Accepted → FINALIZED (poll every 3–5s).
  5. Refetch stats on FINALIZED to update UI.

## Local Dev & StudioNet Playbook

1. **Wallet & Network**
   - Add StudioNet (ChainId 61999) in MetaMask.
   - RPC: https://studio.genlayer.com/api
   - If on wrong chain, the UI shows a banner prompting to switch.

2. **Client bootstrap**
   - On first mount / after connect:
     ```ts
     await client.initializeConsensusSmartContract();
     ```
   - Poll interval recommendation after writes: 3000–5000 ms until FINALIZED.

3. **Finality model**
   - Accepted → FINALIZED. The UI only updates streak after FINALIZED to avoid confusion.

4. **Troubleshooting quickies**
   - “User rejected”: re-open wallet modal, no auto-retry.
   - Long pending: keep showing Accepted toast; optional guide to appeal (if enabled).
   - Rate limit: back off with exponential delays, reduce polling, show hint.

## UI/UX Notes
- **Theme**: Dark/Light via CSS variables; consistent MUI theme surface, text, and accent colors.
- **7-day view**: Circles for each day, neon checkmarks for completed; highlight “today.”
- **Feedback**: Toasts for submit/success/finalized; skeletons during loading and refetch.
- **Error states**: Clear messaging for wrong chain, user rejected, or RPC/backoff.
 - **Accessibility**: High contrast colors, visible focus rings, keyboard navigation, descriptive alt text for screenshots and icons.

## Deployment
- **Build & Start**
```bash
npm run build
npm run start
```
- **Hosting**: Any Node-friendly host (Vercel, Render, etc.).
- **CORS**: > TODO: Document any RPC/REST CORS constraints for StudioNet endpoint(s).
 - **Env mode**: Ensure `NODE_ENV=production` for production servers.
 - **Public env**: All `NEXT_PUBLIC_*` variables are public—do not put secrets here.

## Troubleshooting
- **Wrong chain**: Switch to StudioNet (ChainId 61999) in MetaMask.
- **User rejected**: Surface a friendly retry CTA; do not auto‑retry.
- **RPC rate limit**: Back off and show a helpful hint; reduce polling frequency.
- **Finalize delays**: Communicate Accepted state and keep polling; consider a help link explaining finality. > TODO: Link to GenLayer docs if available.
- **Env missing**: Ensure `.env` has `NEXT_PUBLIC_CONTRACT_ADDRESS` and `NEXT_PUBLIC_GENLAYER_NETWORK=studionet`.

## Error Mapping

| Source | Example | UI Message | Suggested Action |
|---|---|---|---|
| Wallet | user rejected request | Transaction cancelled | Let user retry |
| Network | wrong chain (≠61999) | Switch to StudioNet | Show switch banner |
| RPC | InternalRpcError | Something went wrong | Retry after a few seconds |
| SDK | rate limited | Too many requests | Slow down; wait 10–30s |
| Finality | pending too long | Still confirming… | Keep polling or offer help link |

## Security & Limitations
- No secrets in frontend; all vars are `NEXT_PUBLIC_*`.
- One‑check‑per‑day assumption enforced by contract. > TODO: Confirm exact enforcement and edge cases in `DailyCheckinPyUTC`.
- Avoid trusting “Accepted” for user‑visible streak updates; always wait for “Finalized.”
 - Avoid trusting “Accepted” for user‑visible streak updates; always wait for **FINALIZED**.
 
### MetaMask Network Snippet (StudioNet)
```json
{
  "chainId": "0xF23CF", // 61999
  "chainName": "GenLayer StudioNet",
  "nativeCurrency": { "name": "GenLayer", "symbol": "GEN", "decimals": 18 },
  "rpcUrls": ["https://studio.genlayer.com/api"],
  "blockExplorerUrls": []
}
```
 - Edge cases: double clicking the button should be idempotent or safely rejected; UI should debounce and disable during in-flight tx.
 - Replay protection: rely on contract-side validation by day index; UI should not attempt to resend the same tx hash.
 - Rate limiting (UI): gate rapid retries and add exponential backoff after errors.


## FAQ
- **Why Finalized vs Accepted?** Finalized is the stable state; waiting avoids showing streaks that might revert from the Accepted state.
- **How is the day computed?** UTC day index based on 00:00:00 UTC boundaries since 1970‑01‑01 UTC.
- **Can I check in twice a day?** The intention is one check per UTC day. > TODO: Confirm duplicate‑in‑day behavior in contract.
- **Does changing timezones affect streaks?** No; streak calculation is UTC‑based in the contract.

## Testing

- **Unit**: day-index & streak math (UTC boundaries).
- **Integration**: mock `genlayer-js` client to assert:
  1) `check_in` → Accepted → Finalized flow,
  2) refetches `get_my_stats` after finalize,
  3) disables button if `is_checked_today` is true.
- **Visual**: Storybook/Chromatic (optional) for UI states: light/dark, loading, accepted, finalized, error banner.

## Contributing

1. Fork → feature branch → PR.
2. Commit style: Conventional Commits (`feat:`, `fix:`, `docs:` …).
3. CI: lint, typecheck, build.

## Release

- Versioning: SemVer (MAJOR.MINOR.PATCH).
- CHANGELOG: generated from commits.
- Tag + GitHub Release notes (include screenshots & demo URL).

## License & Credits
- **License**: MIT. See [LICENSE](./LICENSE).
- **Credits**:
  - Contract: `DailyCheckinPyUTC` on StudioNet. > TODO: Add deployed address
  - Stack: Next.js + TypeScript, MUI, wagmi, RainbowKit, React Query, ethers, genlayer‑js
- **Project**: GenLayer Daily Check-in — Daily on-chain check-ins and streaks on GenLayer StudioNet.
