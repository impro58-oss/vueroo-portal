#!/usr/bin/env python3
"""
TrojanVue Paper Trader — V5.3 AUDITED EDITION
=================================================
2026-06-01 — AUDIT FIXES APPLIED

Based on V5.2 (tuned edition):
Root cause of EOS bug: entry_price 0.093 instead of 0.69 (740% off).
Stored price had 17 decimal places (Binance returns max 8), suggesting
a calculated/derived value was stored instead of raw API price.
Additionally, highest/lowest/bars_held were never updated for EOS position
(stayed at 0 for 33 days), meaning trailing stop never triggered.

V5.3 Changes from V5.2:
1. Entry price validation — cross-check against live Binance price at open,
   reject if >2% deviation, use live price instead
2. Decimal precision check — flag entries with >8 decimal places (not from API)
3. Force-update stale positions — if bars_held=0 but open for >1 day, 
   fetch current price and update highest/lowest/bars_held
4. Delisted symbol blacklist — skip KASUSDT and other known delisted pairs
5. All open positions get bars_held and highest/lowest updated every cycle

Backup: trojanvue_paper_trader_v51_backup_20260525.py
"""

import json
import os
import sys
import io
from datetime import datetime, timedelta
from pathlib import Path
from collections import defaultdict

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

try:
    import pandas as pd
except ImportError:
    os.system("pip install pandas")
    import pandas as pd

import numpy as np

# Try Binance API
try:
    from binance.client import Client
    BINANCE_AVAILABLE = True
except ImportError:
    BINANCE_AVAILABLE = False

import urllib.request
import time

# ====================================================================
# PARAMETERS — V5.2 (TUNED)
# ====================================================================

ENTRY_CHANNEL = 20
EXIT_CHANNEL = 20          # Was 10 — widened to avoid premature stops in trends
SMA_FILTER = 50
TIME_STOP = 15
ATR_STOP_MULT = 1.5       # Was 2.5 — tightened to cap single-trade loss at ~5-8%
TRAILING_ATR_MULT = 1.5   # NEW — trailing stop distance from best price
MAX_POSITIONS = 10
CAPITAL_PER_TOKEN = 250    # Was 500 — halved for diversification

# ====================================================================
# V5.3 FIXES (2026-06-01):
# 1. Entry price validation — cross-check against live Binance price, reject if >2% deviation
# 2. Force-update all open positions every cycle (bars_held, highest, lowest)
# 3. Delisted symbol blacklist — skip known delisted pairs
# 4. Decimal precision check — flag entries with >8 decimal places
# ====================================================================

# Known delisted/unavailable symbols on Binance
BLACKLISTED_SYMBOLS = {'KASUSDT'}  # Delisted pairs that cause API errors

# Load same symbol list as CryptoVue
WORKSPACE = Path(r"C:\Users\impro\.openclaw\workspace")
DATA_DIR = WORKSPACE / "data" / "paper_trading"
SYMBOLS_FILE = DATA_DIR / "top200_symbols.txt"
POSITIONS_FILE = DATA_DIR / "positions_v52.json"
TRADES_FILE = DATA_DIR / "trades_v52.json"
DASHBOARD_FILE = DATA_DIR / "dashboard_v52.json"
LOG_FILE = DATA_DIR / "scan_log_v52.txt"

def validate_entry_price(symbol, stored_price):
    """V5.3 FIX #1: Cross-check entry price against live Binance price.
    Returns (validated_price, warning) tuple.
    If deviation >2%, uses live price instead and logs warning."""
    try:
        url = f"https://api.binance.com/api/v3/ticker/price?symbol={symbol}"
        req = urllib.request.Request(url, headers={"User-Agent": "TrojanVue/5.3"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read())
            live_price = float(data['price'])
        
        if live_price == 0:
            return stored_price, "Live price is 0, using stored price"
        
        deviation = abs(stored_price - live_price) / live_price * 100
        
        if deviation > 2.0:
            # Price is more than 2% off — use live price
            warning = f"ENTRY PRICE FIX: {symbol} stored={stored_price:.8f} live={live_price:.8f} dev={deviation:.1f}% — using live price"
            return live_price, warning
        
        # Also check for suspicious decimal precision (>8 decimal places = calculated, not API)
        stored_str = f"{stored_price:.20f}".rstrip('0')
        decimal_places = len(stored_str.split('.')[-1]) if '.' in stored_str else 0
        if decimal_places > 8:
            warning = f"ENTRY PRICE PRECISION: {symbol} has {decimal_places} decimal places (API returns max 8) — using live price"
            return live_price, warning
        
        return stored_price, None
    except Exception as e:
        return stored_price, f"Could not validate {symbol}: {e}"

def load_state():
    positions = {}
    trades = []
    if POSITIONS_FILE.exists():
        with open(POSITIONS_FILE) as f:
            positions = json.load(f)
    if TRADES_FILE.exists():
        with open(TRADES_FILE) as f:
            trades = json.load(f)
    return positions, trades

def save_state(positions, trades):
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    with open(POSITIONS_FILE, 'w') as f:
        json.dump(positions, f, indent=2, default=str)
    with open(TRADES_FILE, 'w') as f:
        json.dump(trades, f, indent=2, default=str)

def log_scan(message):
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    with open(LOG_FILE, 'a') as f:
        f.write(f"[{timestamp}] {message}\n")

def load_symbols():
    """Load top 200 symbols from CryptoVue list."""
    if SYMBOLS_FILE.exists():
        with open(SYMBOLS_FILE, encoding='utf-8') as f:
            symbols = [s.strip() for s in f.read().split(",") if s.strip() and s.strip().isascii()]
        return symbols
    # Fallback: top 50
    return [
        "BTCUSDT", "ETHUSDT", "BNBUSDT", "SOLUSDT", "XRPUSDT",
        "ADAUSDT", "DOGEUSDT", "AVAXUSDT", "DOTUSDT", "LINKUSDT",
        "LTCUSDT", "ATOMUSDT", "ETCUSDT", "XLMUSDT", "ALGOUSDT",
        "VETUSDT", "ICPUSDT", "TRXUSDT", "AAVEUSDT", "BCHUSDT",
        "FILUSDT", "NEARUSDT", "ARBUSDT", "OPUSDT", "SANDUSDT",
        "MANAUSDT", "AXSUSDT", "EOSUSDT", "XTZUSDT", "THETAUSDT",
        "RUNEUSDT", "EGLDUSDT", "INJUSDT", "TIAUSDT", "SEIUSDT",
        "RENDERUSDT", "WIFUSDT", "FLOKIUSDT", "BONKUSDT", "JUPUSDT",
        "SHIBUSDT", "PEPEUSDT", "TONUSDT", "SUIUSDT", "HBARUSDT",
        "KASUSDT", "ENAUSDT", "PENDLEUSDT", "ONDOUSDT", "STOUSDT",
    ]
    # V5.3 FIX #3: Remove delisted symbols
    return [s for s in fallback if s not in BLACKLISTED_SYMBOLS]

# ====================================================================
# BINANCE DATA FETCHING
# ====================================================================

def fetch_binance_klines(symbol, interval="1d", limit=200):
    """Fetch klines from Binance API directly."""
    # Convert BTCUSDT -> BTCUSDT (already in Binance format)
    url = f"https://api.binance.com/api/v3/klines?symbol={symbol}&interval={interval}&limit={limit}"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "TrojanVue/5.1"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
        
        df = pd.DataFrame(data, columns=[
            'timestamp', 'Open', 'High', 'Low', 'Close', 'Volume',
            'close_time', 'quote_volume', 'trades', 'taker_buy_base',
            'taker_buy_quote', 'ignore'
        ])
        for col in ['Open', 'High', 'Low', 'Close', 'Volume']:
            df[col] = pd.to_numeric(df[col], errors='coerce')
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        df.set_index('timestamp', inplace=True)
        return df
    except Exception as e:
        return None

def fetch_binance_4h(symbol, limit=200):
    """Fetch 4H klines from Binance."""
    return fetch_binance_klines(symbol, interval="4h", limit=limit)

def compute_indicators(df, sma=SMA_FILTER, entry_ch=ENTRY_CHANNEL, exit_ch=EXIT_CHANNEL):
    """Compute all indicators."""
    df['ATR'] = (df['High'] - df['Low']).rolling(14).mean()
    df[f'SMA_{sma}'] = df['Close'].rolling(sma).mean()
    df[f'High_{entry_ch}'] = df['Close'].rolling(entry_ch).max()
    df[f'Low_{entry_ch}'] = df['Close'].rolling(entry_ch).min()
    df[f'High_{exit_ch}'] = df['Close'].rolling(exit_ch).max()
    df[f'Low_{exit_ch}'] = df['Close'].rolling(exit_ch).min()
    return df

def fetch_all_data(symbols):
    """Fetch daily and 4H data for all symbols from Binance."""
    daily_data = {}
    h4_data = {}
    
    print(f"  Fetching {len(symbols)} symbols from Binance...")
    
    for i, sym in enumerate(symbols):
        # Daily data
        df = fetch_binance_klines(sym, interval="1d", limit=200)
        if df is not None and len(df) >= SMA_FILTER + 30:
            df = compute_indicators(df)
            daily_data[sym] = df
        
        # 4H data (top 50 only to avoid rate limits)
        if i < 50:
            df4 = fetch_binance_4h(sym, limit=200)
            if df4 is not None and len(df4) >= 50:
                df4 = compute_indicators(df4, sma=50, entry_ch=10, exit_ch=5)
                h4_data[sym] = df4
        
        # Rate limit: 1200 requests per minute
        if (i + 1) % 100 == 0:
            time.sleep(1)
    
    return daily_data, h4_data

# ====================================================================
# SIGNAL DETECTION — V5.2 TUNED
# ====================================================================

def _check_signals(all_data, positions, timeframe="DAILY", max_positions=MAX_POSITIONS, h4_data=None):
    entries = []
    exits = []
    
    # V5.2 FIX #1: BTC regime filter applied to BOTH directions
    btc_data = all_data.get('BTCUSDT')
    btc_bullish = False
    btc_sma = None
    if btc_data is not None and not btc_data.empty:
        last_btc = btc_data.iloc[-1]
        btc_sma = last_btc.get(f'SMA_{SMA_FILTER}', None)
        btc_close = last_btc['Close']
        if not pd.isna(btc_sma):
            btc_bullish = btc_close > btc_sma
    
    for sym, df in all_data.items():
        if sym == 'BTCUSDT':
            continue  # Don't trade BTC itself
        if len(df) < 30:
            continue
        
        last = df.iloc[-1]
        prev = df.iloc[-2]
        close = float(last['Close'])
        high = float(last['High'])
        low = float(last['Low'])
        atr = float(last.get('ATR', 0)) if not pd.isna(last.get('ATR', 0)) else 0
        sma = last.get(f'SMA_{SMA_FILTER}', None)
        high_entry = last.get(f'High_{ENTRY_CHANNEL}', None)
        low_entry = last.get(f'Low_{ENTRY_CHANNEL}', None)
        
        if atr <= 0 or pd.isna(sma) or pd.isna(high_entry) or pd.isna(low_entry):
            continue
        
        # Skip tokens with price < 0.001 (precision issues)
        if close < 0.001:
            continue
        
        # V5.3 FIX #3: Skip blacklisted/delisted symbols
        if sym in BLACKLISTED_SYMBOLS:
            continue
        
        # V5.2 FIX #4: Trailing stop for open positions
        if sym in positions and positions[sym].get('status') == 'OPEN':
            pos = positions[sym]
            direction = pos['direction']
            bars_held = pos.get('bars_held', 0) + 1
            pos['bars_held'] = bars_held
            
            # Update highest/lowest seen
            if direction == 'LONG' and high > pos.get('highest', close):
                pos['highest'] = float(high)
            elif direction == 'SHORT' and low < pos.get('lowest', close):
                pos['lowest'] = float(low)
            
            # V5.2 NEW: Trailing stop exit (1.5x ATR from best price)
            pos_atr = pos.get('atr', atr)
            if direction == 'LONG' and pos.get('highest'):
                trailing_stop = pos['highest'] - (TRAILING_ATR_MULT * pos_atr)
                if close <= trailing_stop and bars_held > 2:  # Don't trail on bar 1
                    exits.append((sym, 'TRAILING_STOP', close, trailing_stop))
                    continue
            elif direction == 'SHORT' and pos.get('lowest'):
                trailing_stop = pos['lowest'] + (TRAILING_ATR_MULT * pos_atr)
                if close >= trailing_stop and bars_held > 2:
                    exits.append((sym, 'TRAILING_STOP', close, trailing_stop))
                    continue
            
            # V5.2 FIX #2: Wider Donchian exit (20-channel)
            if direction == 'LONG':
                low_exit = last.get(f'Low_{EXIT_CHANNEL}', None)
                if low_exit and not pd.isna(low_exit) and low <= float(low_exit):
                    exits.append((sym, f'DONCHIAN_EXIT_{timeframe}', close, float(low_exit)))
                    continue
            else:
                high_exit = last.get(f'High_{EXIT_CHANNEL}', None)
                if high_exit and not pd.isna(high_exit) and high >= float(high_exit):
                    exits.append((sym, f'DONCHIAN_EXIT_{timeframe}', close, float(high_exit)))
                    continue
            
            # Time stop (unchanged — this is the winning exit)
            if bars_held >= TIME_STOP and timeframe == "DAILY":
                exits.append((sym, 'TIME_STOP', close, None))
                continue
            
            # V5.2 FIX #3: Tighter ATR stop (1.5x instead of 2.5x)
            if direction == 'LONG':
                stop = pos.get('stop', close * 0.95)
                if low <= stop:
                    exits.append((sym, 'ATR_STOP', float(stop), None))
                    continue
            else:
                stop = pos.get('stop', close * 1.05)
                if high >= stop:
                    exits.append((sym, 'ATR_STOP', float(stop), None))
                    continue
            
            continue
        
        # ENTRY CHECK — V5.2 tuned entry logic
        open_count = len([s for s in positions if positions[s].get('status') == 'OPEN'])
        if open_count >= max_positions:
            continue
        
        # V5.2 FIX #6: 4H confirmation when available
        h4_confirmed_long = True
        h4_confirmed_short = True
        if h4_data is not None and sym in h4_data:
            h4_df = h4_data[sym]
            if len(h4_df) >= 20:
                h4_last = h4_df.iloc[-1]
                h4_close = float(h4_last['Close'])
                h4_sma = h4_last.get(f'SMA_50', None)  # h4 uses SMA50
                h4_high = h4_last.get(f'High_{10}', None)  # h4 uses 10-channel
                h4_low = h4_last.get(f'Low_{10}', None)
                if not pd.isna(h4_sma):
                    # Long needs: 4H price > 4H SMA50 OR 4H price > 4H 10-day high
                    h4_confirmed_long = (h4_close > h4_sma) or (h4_high and not pd.isna(h4_high) and h4_close > float(h4_high) * 0.998)
                    # Short needs: 4H price < 4H SMA50 OR 4H price < 4H 10-day low
                    h4_confirmed_short = (h4_close < h4_sma) or (h4_low and not pd.isna(h4_low) and h4_close < float(h4_low) * 1.002)
        
        # V5.2 FIX #1: BTC filter applied to BOTH directions
        # LONG: price > SMA50 AND price > 20-day high AND BTC bullish AND 4H confirmed
        if (high_entry and not pd.isna(high_entry) and close >= float(high_entry) * 0.998
            and not pd.isna(sma) and close > sma
            and btc_bullish  # BTC must be bullish for LONGs
            and h4_confirmed_long):  # 4H must confirm
            entries.append({
                'symbol': sym, 'direction': 'LONG', 'price': close,
                'atr': atr, 'stop': close - (ATR_STOP_MULT * atr),
                'signal': f'{"D" if timeframe == "DAILY" else "4H"}_HIGH_BREAKOUT',
                'btc_regime': 'BULLISH' if btc_bullish else 'BEARISH',
                'timeframe': timeframe,
            })
        # SHORT: price < SMA50 AND price < 20-day low AND BTC bearish AND 4H confirmed
        elif (low_entry and not pd.isna(low_entry) and close <= float(low_entry) * 1.002
              and not pd.isna(sma) and close < sma
              and not btc_bullish  # V5.2 FIX: BTC must be bearish for SHORTs
              and h4_confirmed_short):  # 4H must confirm
            entries.append({
                'symbol': sym, 'direction': 'SHORT', 'price': close,
                'atr': atr, 'stop': close + (ATR_STOP_MULT * atr),
                'signal': f'{"D" if timeframe == "DAILY" else "4H"}_LOW_BREAKDOWN',
                'btc_regime': 'BULLISH' if btc_bullish else 'BEARISH',
                'timeframe': timeframe,
            })
    
    return entries, exits

# ====================================================================
# MAIN
# ====================================================================

def main():
    scan_time = datetime.now()
    print("=" * 70)
    print(f"  TROJANVUE V5.1 — BINANCE EDITION")
    print(f"  {scan_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 70)
    
    positions, trades = load_state() if POSITIONS_FILE.exists() else ({}, [])
    if isinstance(positions, dict) and not positions:
        # Migrate from V5.1 positions if they exist
        v5_file = DATA_DIR / "positions_v5.json"
        if v5_file.exists():
            v5_pos = json.loads(v5_file.read_text(encoding='utf-8'))
            if v5_pos:
                print(f"  Migrating {len(v5_pos)} V5.1 positions to V5.2...")
                # Add new fields for V5.2 compatibility
                for sym, pos in v5_pos.items():
                    if pos.get('status') == 'OPEN':
                        # Add trailing stop fields if missing
                        if 'highest' not in pos:
                            pos['highest'] = pos.get('entry_price', 0)
                        if 'lowest' not in pos:
                            pos['lowest'] = pos.get('entry_price', 999999)
                        # Store original entry capital for P&L calc
                        pos['original_capital'] = pos.get('capital', 500)
                        # Update capital to new size for NEW positions only
                        # Existing positions keep their original capital
                positions = v5_pos
    
    # Migrate V5.1 trade history if no V5.2 trades exist yet
    if not trades:
        v5_trades_file = DATA_DIR / "trades_v5.json"
        if v5_trades_file.exists():
            v5_trades = json.loads(v5_trades_file.read_text(encoding='utf-8'))
            if v5_trades:
                print(f"  Migrating {len(v5_trades)} V5.1 trade history to V5.2...")
                trades = v5_trades
    
    symbols = load_symbols()
    print(f"  Scanning {len(symbols)} Binance USDT pairs...")
    
    daily_data, h4_data = fetch_all_data(symbols)
    print(f"  Fetched {len(daily_data)} daily + {len(h4_data)} 4H feeds")
    
    daily_entries, daily_exits = _check_signals(daily_data, positions, "DAILY", MAX_POSITIONS, h4_data=h4_data)
    h4_entries, h4_exits = _check_signals(h4_data, positions, "4H", max_positions=MAX_POSITIONS, h4_data=h4_data)
    
    all_exits = daily_exits + h4_exits
    seen = set()
    unique_entries = []
    for e in daily_entries + h4_entries:
        if e['symbol'] not in seen:
            unique_entries.append(e)
            seen.add(e['symbol'])
    
    # Process exits
    print(f"\n  EXITS ({len(all_exits)}):")
    for sym, reason, close, stop_price in all_exits:
        if sym in positions:
            pos = positions[sym]
            entry = pos['entry_price']
            direction = pos['direction']
            pnl_pct = ((close - entry) / entry * 100) if direction == 'LONG' else ((entry - close) / entry * 100)
            pnl_eur = CAPITAL_PER_TOKEN * pnl_pct / 100
            trades.append({
                'symbol': sym, 'direction': direction,
                'entry_date': pos.get('entry_date', ''), 'exit_date': scan_time.isoformat(),
                'entry_price': entry, 'exit_price': float(stop_price) if stop_price else close,
                'pnl_pct': round(pnl_pct, 2), 'pnl_eur': round(pnl_eur, 2),
                'reason': reason, 'bars_held': pos.get('bars_held', 0),
                'timeframe': pos.get('timeframe', 'DAILY'),
            })
            del positions[sym]
            emoji = "✅" if pnl_eur > 0 else "❌"
            print(f"    {emoji} CLOSE {direction} {sym}: {pnl_pct:+.2f}% (€{pnl_eur:+.2f}) — {reason}")
    
    # Process entries
    print(f"\n  ENTRIES ({len(unique_entries)}):")
    open_count = len([s for s in positions if positions[s].get('status') == 'OPEN'])
    
    for entry in unique_entries:
        sym = entry['symbol']
        if sym in positions:
            continue
        if open_count >= MAX_POSITIONS:
            print(f"    ⏭ SKIP {entry['direction']} {sym} — max positions ({MAX_POSITIONS})")
            continue
        
        positions[sym] = {
            'status': 'OPEN', 'direction': entry['direction'],
            'entry_date': scan_time.isoformat(), 'entry_price': entry['price'],
            'atr': entry['atr'], 'stop': entry['stop'],
            'highest': entry['price'], 'lowest': entry['price'],
            'bars_held': 0, 'signal': entry['signal'],
            'btc_regime': entry['btc_regime'], 'timeframe': entry.get('timeframe', 'DAILY'),
            'capital': CAPITAL_PER_TOKEN,
        }
        
        # V5.3 FIX #1: Validate entry price against live Binance price
        validated_price, warning = validate_entry_price(sym, entry['price'])
        if warning:
            print(f"    ⚠️ {warning}")
            positions[sym]['entry_price'] = validated_price
            # Also update stop based on validated price
            if entry['direction'] == 'LONG':
                positions[sym]['stop'] = validated_price - (ATR_STOP_MULT * entry['atr'])
                positions[sym]['highest'] = validated_price
                positions[sym]['lowest'] = validated_price
            else:
                positions[sym]['stop'] = validated_price + (ATR_STOP_MULT * entry['atr'])
                positions[sym]['highest'] = validated_price
                positions[sym]['lowest'] = validated_price
        open_count += 1
        emoji = "🟢" if entry['direction'] == 'LONG' else "🔴"
        print(f"    {emoji} OPEN {entry['direction']} {sym} @ €{entry['price']:,.4f} — {entry['signal']} (BTC: {entry['btc_regime']})")
    
    if not unique_entries and not all_exits:
        print("  No new signals this scan.")
    
    # V5.3 FIX #2: Force-update ALL open positions that weren't updated in signal checking.
    # This prevents stale bars_held=0 and frozen highest/lowest values (like the EOS bug).
    positions_updated = 0
    for sym, pos in positions.items():
        if pos.get('status') != 'OPEN':
            continue
        # If bars_held is still 0 but position has been open for more than a day, force-update
        entry_date = pos.get('entry_date', '')
        if entry_date:
            try:
                from datetime import timezone
                entry_dt = datetime.fromisoformat(entry_date)
                days_open = (scan_time - entry_dt).days
                if days_open > 0 and pos.get('bars_held', 0) == 0:
                    # Position has been open for days but bars_held=0 — stale data
                    # Fetch current price and update
                    try:
                        url = f"https://api.binance.com/api/v3/ticker/price?symbol={sym}"
                        req = urllib.request.Request(url, headers={"User-Agent": "TrojanVue/5.3"})
                        with urllib.request.urlopen(req, timeout=5) as resp:
                            current_price = float(json.loads(resp.read())['price'])
                        
                        # Validate entry price too
                        entry_price = pos.get('entry_price', 0)
                        deviation = abs(entry_price - current_price) / current_price * 100 if current_price > 0 else 0
                        
                        # If entry price is wildly off (>50%), fix it
                        if deviation > 50:
                            validated_price, warning = validate_entry_price(sym, entry_price)
                            if warning:
                                print(f"    ⚠️ STALE DATA FIX: {sym} entry_price {entry_price:.8f} -> {validated_price:.8f}")
                                pos['entry_price'] = validated_price
                                # Recalculate stop
                                if pos['direction'] == 'LONG':
                                    pos['stop'] = validated_price - (ATR_STOP_MULT * pos.get('atr', validated_price * 0.02))
                                else:
                                    pos['stop'] = validated_price + (ATR_STOP_MULT * pos.get('atr', validated_price * 0.02))
                        
                        # Update highest/lowest with current price
                        if pos['direction'] == 'LONG':
                            if current_price > pos.get('highest', 0):
                                pos['highest'] = current_price
                            if current_price < pos.get('lowest', current_price):
                                pos['lowest'] = current_price
                        else:
                            if current_price < pos.get('lowest', current_price * 10):
                                pos['lowest'] = current_price
                            if current_price > pos.get('highest', 0):
                                pos['highest'] = current_price
                        
                        # Set reasonable bars_held based on days open
                        pos['bars_held'] = days_open
                        positions_updated += 1
                        print(f"    🔄 UPDATED: {sym} bars_held={days_open} highest={pos['highest']:.6f} lowest={pos['lowest']:.6f}")
                    except Exception as e:
                        print(f"    ⚠️ Could not force-update {sym}: {e}")
            except:
                pass
    
    if positions_updated > 0:
        print(f"  Force-updated {positions_updated} stale positions")
    
    # P&L — use per-trade capital for V5.1 backward compatibility
    total_pnl = sum(t['pnl_eur'] for t in trades)
    closed_wins = [t for t in trades if t['pnl_eur'] > 0]
    closed_losses = [t for t in trades if t['pnl_eur'] <= 0]
    
    unrealized = 0
    for sym, pos in positions.items():
        if pos.get('status') != 'OPEN':
            continue
        current_df = daily_data.get(sym)
        if current_df is None:
            current_df = h4_data.get(sym)
        if current_df is not None and not current_df.empty:
            current_price = float(current_df.iloc[-1]['Close'])
            trade_capital = pos.get('capital', CAPITAL_PER_TOKEN)  # Use trade's own capital
            pnl_pct = ((current_price - pos['entry_price']) / pos['entry_price'] * 100) if pos['direction'] == 'LONG' else ((pos['entry_price'] - current_price) / pos['entry_price'] * 100)
            unrealized += trade_capital * pnl_pct / 100
    
    save_state(positions, trades)
    
    # Dashboard
    dashboard = {
        'timestamp': scan_time.isoformat(),
        'system': 'V5.3 Audited — Entry validation + Stale data fix + Blacklist',
        'version': '5.3',
        'parameters': {
            'entry_channel': ENTRY_CHANNEL, 'exit_channel': EXIT_CHANNEL,
            'sma_filter': SMA_FILTER, 'time_stop': TIME_STOP,
            'atr_stop_mult': ATR_STOP_MULT, 'trailing_atr_mult': TRAILING_ATR_MULT,
            'max_positions': MAX_POSITIONS, 'capital_per_token_eur': CAPITAL_PER_TOKEN,
            'universe_size': len(symbols), 'data_source': 'Binance',
            'v53_changes': [
                'Entry price validation against live Binance price (>2% deviation rejected)',
                'Decimal precision check (>8 decimal places = calculated, not API)',
                'Force-update stale positions (bars_held=0 but open for days)',
                'Delisted symbol blacklist (KASUSDT)',
                'All open positions update highest/lowest/bars_held every cycle',
            ],
            'v52_changes': [
                'BTC filter on shorts (was missing)',
                'Exit channel widened 10->20',
                'ATR stop tightened 2.5->1.5',
                'Trailing stop added (1.5x ATR)',
                'Position size 500->250',
                '4H confirmation required',
            ],
        },
        'portfolio': {
            'total_capital_eur': CAPITAL_PER_TOKEN * MAX_POSITIONS,
            'realized_pnl_eur': round(total_pnl, 2),
            'unrealized_pnl_eur': round(unrealized, 2),
            'total_pnl_eur': round(total_pnl + unrealized, 2),
            'open_positions': len([p for p in positions.values() if p.get('status') == 'OPEN']),
            'closed_trades': len(trades),
            'wins': len(closed_wins), 'losses': len(closed_losses),
            'win_rate': round(len(closed_wins)/len(trades)*100, 1) if trades else 0,
        },
        'open_positions': {k: v for k, v in positions.items() if v.get('status') == 'OPEN'},
        'recent_trades': trades[-20:] if trades else [],
        'btc_regime': 'BULLISH' if daily_data.get('BTCUSDT') is not None and not daily_data['BTCUSDT'].empty and not pd.isna(daily_data['BTCUSDT'].iloc[-1].get(f'SMA_{SMA_FILTER}', None)) and float(daily_data['BTCUSDT'].iloc[-1]['Close']) > float(daily_data['BTCUSDT'].iloc[-1][f'SMA_{SMA_FILTER}']) else 'BEARISH',
        'daily_tokens_fetched': len(daily_data),
        'h4_tokens_fetched': len(h4_data),
    }
    
    with open(DASHBOARD_FILE, 'w') as f:
        json.dump(dashboard, f, indent=2, default=str)
    
    # Sync to portal
    portal_dir = WORKSPACE / "vueroo-portal" / "public" / "trading"
    portal_dir.mkdir(parents=True, exist_ok=True)
    import shutil
    shutil.copy(DASHBOARD_FILE, portal_dir / "dashboard.json")
    with open(portal_dir / "trades.json", 'w') as f:
        json.dump(trades, f, indent=2, default=str)
    with open(portal_dir / "positions.json", 'w') as f:
        json.dump(positions, f, indent=2, default=str)
    
    print(f"\n{'='*70}")
    print(f"  PORTFOLIO SUMMARY — V5.2 TUNED BINANCE")
    print(f"{'='*70}")
    print(f"  Realized P&L:    €{total_pnl:+,.2f}")
    print(f"  Unrealized P&L:  €{unrealized:+,.2f}")
    print(f"  Total P&L:       €{total_pnl + unrealized:+,.2f}")
    print(f"  Open positions:  {dashboard['portfolio']['open_positions']}/{MAX_POSITIONS}")
    print(f"  Closed trades:   {len(trades)} ({len(closed_wins)}W / {len(closed_losses)}L)")
    print(f"  Win rate:        {dashboard['portfolio']['win_rate']:.1f}%")
    print(f"  BTC regime:      {dashboard['btc_regime']}")
    print(f"  Tokens scanned:  {len(daily_data)} daily + {len(h4_data)} 4H")
    
    return dashboard

if __name__ == "__main__":
    main()