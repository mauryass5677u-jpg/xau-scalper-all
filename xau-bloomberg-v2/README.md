# XAU/USDT OMNISCIENT SCALPER TERMINAL v12.0

A from-scratch, Bloomberg-style, real-time scalping terminal for **XAU/USDT
(Binance Perpetual Futures)**, default timeframe **15m**.

Fully self-contained: **one file** — `index.html`. No installs, no build,
no API keys. Opens on ANY device (phone, tablet, desktop) that has a browser.

---

## 🔌 How to OPEN it (choose one)

### A. Local — fastest
Double-click `index.html`. It runs fully in the browser (Binance + gold-api +
Yahoo APIs are CORS-open).

### B. Universal public link — open on ANY device, anywhere (RECOMMENDED)
**`start-tunnel.bat`** starts the local server + a free Cloudflare tunnel and
prints a real `https://xxxx.trycloudflare.com` link you can open on ANY device
in the world (phone, tablet, laptop, TV). No account needed.

1. Double-click **`start-tunnel.bat`** (it auto-starts `node serve.js` + `cloudflared`).
2. Wait ~8 seconds. The console shows your universal URL, e.g.:
   `https://residential-earthquake-sensor-remedies.trycloudflare.com`
3. Open that link on any device — the full live terminal loads instantly.
   Keep the window open; close it to stop the link.

> Because the terminal is a single static file with no backend, the tunnel
> simply serves `index.html` over HTTPS to anyone with the link.

### C. Permanent public link (open anywhere, anytime, no PC needed)
Deploy the single `index.html` to free static hosting — you get a permanent
public `https://` link:

1. Go to **https://app.netlify.com/drop**
2. Drag & drop the `xau-bloomberg-v2` folder (or just `index.html`).
3. Netlify gives you a universal link like `https://xyz.netlify.app`.

> Alternative free hosts: **Vercel** (vercel.com), **GitHub Pages**
> (create repo → upload `index.html` → Settings → Pages), **Cloudflare Pages**.
> Any of these produces a permanent universal link.

### D. LAN — any device on the same Wi-Fi
```
node serve.js
```
It prints a **Network URL** like `http://192.168.1.25:8080` — open it on any
device on the same Wi-Fi.

---

## ⚙️ What it does

### Real-time data (all fetched live, no keys)
- Binance Futures: 1m/3m/5m/15m/1h/4h/1d klines, 24h ticker, mark/index price,
  funding rate, open interest (+history), order book depth, global L/S ratio,
  top-trader L/S ratio, taker buy/sell ratio, aggregate trades.
- WebSocket: live price ticker + depth + trades (100ms).
- gold-api.com spot gold (futures-vs-spot premium).
- Yahoo Finance: DXY (USD index), US10Y (TNX).

### Indicator engine (mathematical, from raw OHLCV)
RSI, MACD, EMA 8/21/50/200, ADX/DMI, ATR, Bollinger, Keltner, Stochastic,
CCI, Williams %R, ROC, VWAP, Supertrend, Donchian, Ichimoku, OBV, MFI,
Parabolic SAR, daily pivots, swings/BOS, FVG.

### 50-Agent Scalper Council
50 independent strategy agents (Trend, Momentum, Mean-Reversion, Order Flow,
Sentiment, Macro, ML-ensemble) each **vote** LONG/SHORT/NEUTRAL **and** propose
their own ENTRY / STOP LOSS / TAKE PROFIT.

Consensus engine then produces:
- **Direction** = weighted majority vote
- **Entry** = robust median of winning agents
- **Stop loss** = clamped against ATR + swing structure (never stops hit by noise)
- **Take profit** = median target with minimum 1.5R guaranteed
- Confidence %, R:R, P(Win), Expected Value, position size, leverage

### Bloomberg-style interface
- Live candlestick canvas with EMA/VWAP/entry/SL/TP overlay
- Live order book depth (bid/ask walls)
- Indicator dashboard, derivatives & macro panels
- 50-agent voting grid + live log tape
- Responsive (works on phones too)

---

## ⚠️ RISK DISCLAIMER
Live mathematical analysis of public market data. **Not financial advice.**
Gold futures trading involves substantial risk. Leverage amplifies losses.
Every signal can be wrong — always use proper risk management and never risk
more than you can afford to lose.

Default assumptions: equity $10,000, risk 1% per trade, max leverage 20×.
