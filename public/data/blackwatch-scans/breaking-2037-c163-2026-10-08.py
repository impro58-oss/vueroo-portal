#!/usr/bin/env python3
"""BlackWatch c163 (2037Z slot, window Oct-8 1237Z -> Oct-8 2037Z, 8h restore-merged: 1637Z slot missed post-outage) — apply + sync + push, c150-convention.
Restored-job first attempt fetched quotes 20:43:27Z then session-lost; artifact re-used, canon untouched (guards assert c162 state)."""
import json, shutil, hashlib, os, subprocess, sys
from datetime import datetime, timezone

CANON = r'C:\Users\impro\.openclaw\workspace\data'
SIG   = os.path.join(CANON, 'blackwatch-signals.json')
MACRO = os.path.join(CANON, 'blackwatch-macro-event.json')
ART   = os.path.join(CANON, 'breaking-event-2026-10-08-2037.json')
ARTL1 = os.path.join(CANON, 'breaking-event-latest.json')
ARTL2 = os.path.join(CANON, 'breaking-events-latest.json')
SIGAL = os.path.join(CANON, 'signals.json')
ART162 = os.path.join(CANON, 'breaking-event-2026-10-08-1237.json')
LQ    = os.path.join(CANON, 'blackwatch-scans', 'live-quotes-2026-10-08-2037.json')
NOW_UTC = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%SZ')

LAST  = "2026-10-08T20:37:00+00:00"
SCAN  = "blackwatch-2026-10-08-2037"
W     = "163rd"

T_MAIN_163 = ("CAT-5-SUSTAINED-163RD-RESTORE-MERGED (window Oct-8 1237Z -> Oct-8 2037Z, 8h: 1637Z slot MISSED post-outage, restored job fired 2047Z, catch-up merged; scan-id blackwatch-2026-10-08-2037; search-basis 23 queries/12 domains ~20:47-21:0xZ + quotes 26/26 + 7/7-intra 20:43:27Z by lost first-attempt re-used): CAT-5 SUSTAINED 163rd + alert_log #168 + NEW-KINETIC-RUNG-IN-WINDOW (first since 158-26): UKMTO-159-26-LOGGED-Oct-8 (time-late verified report, incident Oct-6 17:09UTC, crude oil tanker struck by unknown projectile transiting Strait-of-Hormuz, no reported casualties, damage/env unknown; UKMTO-PDF-20261008-159-26-ATTACK + CGTN-full-quote + IranIntl-14:58:15Z + Newsquawk-15:22:02Z + AA-18:20:59Z; registry-latest 159-26, 160-26-sweep-NIL; KINETIC-BASIS-12->13) + JMIC-Update-103-Oct-8-SEVERE (ICOD-081500Z, period Mar-1->Oct-8). BRENT-SETTLE-104.28-+4.07% (Morningstar/DJ-DataTalk + TASS-tops-104-first-since-Sep-29 + DTN-19:17Z; CL-settle-~90.89-intra-92.91; settle-basis-conflict-logged vs Yahoo-daily-chain-103.60; streak-~215h->100-NO-sub-100; FIRST-sub-100-SETTLE-de-esc-gate-UNRESOLVED-continues->Fri-settle-window) + TRUMP-NO-STRIKES-BEFORE-MIDTERMS-4SRC (AP-16:31:32Z + WSJ-17:25Z-'productive-discussions'-with-Tehran + Axios + SeattleTimes-AP-20:31:05Z; strike-prep-thread-DE-ESC-pledge vs kinetic-tempo-continues) + TREASURY-HITS-IRANIAN-OIL-FLEET (JPost) + US-CLOSE-MIXED (S&P-7,765.36--0.47% / Nasdaq-27,193.34--1.25%-CHIP-LED-2src / DJI-51,231.64-+0.10%-rotation; TNX-5.36-SWING-PEAK-EXCURSION->5.231-CLOSE--0.87%-2007-peak-intraday-only-Oct-5-close-5.311-above-day-carried; TYX-5.606; VIX-15.41-+2.19%) + UK-10Y-19-YEAR-HIGH-2SRC (Guardian-12:47:49Z + Reuters-Euronext-13:03) + UK-30Y-6.0-ZONE (fitted-5.90 + ForexPulse-6.036-Wed) + ECB-ACCOUNTS-Oct-8-LANDED-12:21Z-c162-edge-catch (Sept-minutes-upside-skew-no-guidance-higher-long-term-rates-could-affect-policy-rates; NO-decision-Oct-8) + NIKKEI-69,042.11--1.42%-SUB-70K-DAY-LOW-CLOSE (JIJI-official + daily5-chain-verified) + KS11-6,625.93--2.62%-c162-consistent (quotes-pct--4.54%-mislabeled-prev-basis-flag) + HSI-23,785.79--1.43% + Nifty-22,231.80--1.64%-Thursday-closes-daily5-chained + KOREA-CHINA-BASED-ACTOR-ATTRIBUTION-DAY-4 (CrowdStrike-AI-driven-ARTEX-Oct-7 + Reuters-syndication-3x-China-based-suspect-Oct-8 + DW-warns + KoreaTimes-explainer) + BTC-81,748.78-SUB-82K-FIRST-82-83K-ZONE-BROKEN (altcoinbuzz-sub-81k-intra + nile1-429M-liq; 484.9M-Oct-7-ETF-outflow-consolidated-6src; ETF-cost-basis-84,318-below) + GOLD-CLOSE-4,159.20-+0.45%-2-MONTH-LOW-REBOUND (BT-spot-4,141.09 + Kitco-firms) + SILVER-COMEX-59.425-SUB-59.9-CLOSE (spot-sub-59-first-carry) + KENYA-CONTACTS-57->66-QUARANTINED-+-WAJIR-SUSPECTED-CASE (citizen-06:20Z + DailyNation-Thu; case-count-1-carries) + SUDAN-BLUE-NILE-WAD-AL-MAHI-FIGHTING-NEW-GEO (Darfur24-Oct-8) + RSF-COMMANDER-DEFECTS-300 (AA-Oct-8) + PBOC-FIX-6.7367-weaker-expected + EUROPE-CLOSE-WEAK (GDAXI-24,806.97--1.18% / FCHI-7,729.69--0.51% / FTSE-10,441.60--0.16%) + USDBRL-5.022 / Ibov-206,220-+0.94%-quiet + attribution NIL.")

ALERT_CHANGE = {"none": ("NO-ALERT-CHANGES cycle (sustained-163rd; all 8 convergence scores unchanged; KINETIC-BASIS 13 after UKMTO-159-26 logged — first new rung since 158-26; no new category-5 tier-classes in 23-op merged scan; TRUMP-NO-STRIKES-BEFORE-MIDTERMS de-esc-pledge texture vs kinetic-tempo-continues)")}

HEADLINE = ("CAT-5-SUSTAINED-163RD-RESTORE-MERGED + NEW-RUNG-UKMTO-159-26-LOGGED-KINETIC-BASIS-13 + BRENT-SETTLE-104.28-+4.07%-STREAK-~215H + TRUMP-NO-STRIKES-BEFORE-MIDTERMS-4SRC + TREASURY-HITS-OIL-FLEET + UK-10Y-19YR-HIGH + ECB-ACCOUNTS-LANDED-Oct-8 + NIKKEI-SUB-70K-DAY-LOW-CLOSE + BTC-SUB-82K-FIRST + ALERT-LOG-#168")

NOTES = {
 "energy": "BREAKING 2037Z Oct-8 c163 (window 1237Z->2037Z 8h restore-merged): BRENT-SETTLE-104.28-+4.07%-Dec-delivery (Morningstar-DJ-DataTalk + TASS-tops-104-first-since-Sep-29 + DTN-19:17Z-most-in-month; CL-settle-~90.89-+2.96%-intra-92.91 + Boreal-+5.24%; settle-basis-conflict-logged vs Yahoo-daily-chain-103.60; streak-~215h->100-NO-sub-100-print; FIRST-sub-100-SETTLE-de-esc-gate-UNRESOLVED->Fri) + hurricane-Isaias-Gulf-texture (tradingnews + AA-08:19-carry) + heating-oil-rec-4.80-carry + IEA-325M-released-accel-carry + Hormuz-159-26-logged + transits-lowest-2-months-carry",
 "geopolitical": "BREAKING 2037Z Oct-8 c163: TRUMP-NO-STRIKES-BEFORE-MIDTERMS-4SRC (AP-16:31:32Z + WSJ-17:25Z-'productive-discussions'-with-Tehran + Axios-BarakRavid + SeattleTimes-20:31:05Z; Nov-3-midterms; strike-prep-thread-DE-ESC-pledge) + TREASURY-HITS-IRANIAN-OIL-FLEET (JPost; econ-warfare-carries) + UKMTO-159-26-NEW-RUNG-LOGGED + 158-26-QATAR-CASUALTIES-CARRY (Seatrade-crew-casualties) + IRAN-NEVER-ENRICHMENT-carry + MEO-deadlock-fork (TheNational-12:01Z-diplomacy-or-war) + SUDAN-Blue-Nile-Wad-Al-Mahi-fighting-NEW-GEO (Darfur24-Oct-8) + RSF-commander-defects-300-officers-30-vehicles (AA-Oct-8) + Burhan-rejects-talks-carry + TIGRAY-ERITREA-texture-carries",
 "middle_east": "BREAKING 2037Z Oct-8 c163: UKMTO-159-26-LOGGED (incident-Oct-6-17:09UTC-time-late-~2-day-lag; crude-tanker-struck-unknown-projectile-transiting-TSB-Hormuz; NO-reported-casualties-damage-env-unknown; PDF-20261008-ATTACK + CGTN-full-quote + IranIntl-14:58:15Z + Newsquawk-15:22:02Z + AA-18:20:59Z) + REGISTRY-LATEST-159-26 + 160-26-SWEEP-NIL + JMIC-UPDATE-103-Oct-8-SEVERE (ICOD-081500Z) + KINETIC-BASIS-13 + SAUDI-KKIA+ABHA-DEATHS-3-CARRY + SAUDI-82-TARGETS-carry + Houthi-airline-warning-carry + claim-climax-conflict-carry",
 "supply_chain": "BREAKING 2037Z Oct-8 c163: HORMUZ-159-26-ATTACK-DATUM (time-late-Oct-6-incident) + transits-lowest-2-months-carry (reduced-but-flowing) + JMIC-SEVERE-carry + IEA-release-ACCELERATION-carry + OMAN-coastal-route-crackdown-threat-carry + Bab-el-Mandeb-carry + Houthi-airline-warning-carry + heating-oil-record-carry + Mombasa-screening-queues-Ebola-texture-carry + food-security-no-new",
 "sov_debt": "BREAKING 2037Z Oct-8 c163: TNX-CLOSE-5.231--0.87% (daily5-chain-verified; INTRADAY-5.36-SWING-HIGH-new-extreme-excursion-2src-econplex+MarketWatchJP; 2007-peak-5.296-breach-INTRADAY-ONLY; Oct-5-close-5.311-above-peak-day-carried; zone-contested-5.23-5.36) + TYX-5.606--0.97% + UK-10Y-19-YEAR-HIGH-2SRC (Guardian-12:47:49Z + Reuters-Euronext-13:03-live) + UK-30Y-6.0-ZONE (bondScovery-fitted-5.90-Oct-8 + ForexPulse-6.036-Wed-28yr) + auction-5.300-best-in-decade-carry + OAT-150bp-zone-carry (Oct-5-vintage) + MOF-30Y-JGB-4.109-carry + ECB-ACCOUNTS (higher-long-term-rates-could-affect-policy-rates)",
 "currency": "BREAKING 2037Z Oct-8 c163: DXY-102.126-CLOSE-above-102-day-7-carries-slight-ease + EUR-1.1217-+0.14%-17-month-low-zone-carry + JPY-157.895-mid-158-roundtrip-carry (NO-MOF-action-Oct-8-sweep; Aug-intervention-vintages-junk-killed) + USDBRL-5.022-CLOSE-back-over-5 + USD-ARS-~1,516-zone-carry + PBOC-FIX-6.7367-weaker-than-anticipated-6.7254-above-prior-6.7351 (DYAX) + BoJ-Oct-30-bets-carry + US+JP-depts-both-undervalued-carry",
 "gold": "BREAKING 2037Z Oct-8 c163: GOLD-CLOSE-GC-4,159.20-+0.45%-vs-e-close-4,140.70 (2-MONTH-LOW-MORNING-REBOUND: BT-spot-4,141.09-+0.7%-01:40GMT + usagold-4,140-yields-retreat-24yr + Kitco-firms-13:03Z + invezz-2-month-low-4,275-revive-watch; morning-4,120-basis-variants-flags-carry; Comex-settle-anchor-gap-carry) + SILVER-COMEX-59.425-CLOSE--0.79%-SUB-59.9 (spot-sub-59-first-day-2-carry-exa-basis + Kitco-silver-slides-oil-inflation + registry-gate-carry) + Q3-ETF-31bn-cant-hold-bid-carry",
 "crypto": "BREAKING 2037Z Oct-8 c163: BTC-81,748.78--1.83%-SUB-82K-FIRST (82-83k-support-zone-BROKEN-day-7; altcoinbuzz-sub-81k-intraday-print + nile1-429M-leveraged-longs-liquidated + Benzinga-ticker-80,754-late-capture-flag) + ETF-OUTFLOW-484.9M-Oct-7-CONSOLIDATED-6SRC (decrypt-worst-since-June-Uptober-red + cryptoticker-487M-variant + cryptoslate-ETH-9-month-high-withdrawals; ETF-cost-basis-84,318-below) + OI-68.13B-carry + liq-709M-carry",
 "china": "BREAKING 2037Z Oct-8 c163: PBOC-FIX-6.7367 (weaker-than-anticipated-6.7254; above-prior-6.7351) + trillion-level-reverse-repo-day-0-support (nmdthds-Oct-8) + 150B-capital-injection-bond-priced-Oct-8-carry + yuan-steady-reopen-carry (bne) + no-devaluation-pledge-carry + A-SHARE-DAY-0-CLOSE-CARRY (SH-3,811.90; CHINEXT/STAR50-weak-carry) + S&P-property-turnaround-carry (CNBC-09:25:35Z-c162-vintage) + State-Council-weighs-UNVERIFIED-flag-carry + EU-hybrid-import-cap-carry + fuel-window-Oct-15-carry",
 "europe": "BREAKING 2037Z Oct-8 c163: ECB-ACCOUNTS-Oct-8-LANDED-12:21Z (Sept-meeting-minutes-c162-window-edge-catch: TE-12:21Z-upside-skew + Newsquawk-2.50-neutral-refrain-future-guidance + Continuum-12:46Z-unanimous-September-hike + Econostream-higher-long-term-rates-could-affect-policy-rates; NO-decision-Oct-8-correctly-accounts-only) + EUROPE-CLOSE-WEAK (GDAXI-24,806.97--1.18% + FCHI-7,729.69--0.51% + FTSE-10,441.60--0.16%; UK-rout-leads) + French-spread-150bp-zone-Oct-5-vintage-carry + Eurogroup-France-2027-budget-demand-carry + ECOFIN-Oct-9-gate",
 "us_cycle": "BREAKING 2037Z Oct-8 c163: US-CLOSE-MIXED (S&P-7,765.36--0.47% + Nasdaq-27,193.34--1.25%-CHIP-LED-SELL-OFF-Reuters+Yahoo-2src + DJI-51,231.64-+0.10%-rotation + AP-fared-20:20Z + Reuters-20:32:56Z-end-lower-crude-chips) + TNX-CLOSE-5.231--0.87%-after-5.36-swing-peak (excursion-faded) + TYX-5.606 + VIX-15.41-+2.19% + auction-5.300-best-in-decade-carry + FOMC-all-19-hawkish-carry + CPI-Oct-14-gate + futures-fall-morning-carry",
 "fin_stability": "BREAKING 2037Z Oct-8 c163: KOREA-CHINA-BASED-ACTOR-DAY-4 (CrowdStrike-AI-driven-ARTEX-Oct-7 + Reuters-syndication-3x-'China-based-suspect-used-AI-tools'-Oct-8 + DW-warns + KoreaTimes-explainer; CHOSUNBIZ-spread-carry) + KS11-6,625.93--2.62%-c162-consistent (quotes-pct--4.54%-mislabeled-prev-basis-flag-logged) + BTC-SUB-82K-FIRST-zone-broken + AI-DEBT-WAVE-carry + FDIC-NO-7TH-VERIFY (fresh-sweep-Nano-Banc-front; no-additions) + private-credit-carry + VIX-15.41 + TNX-zone-contested + Korea-virtual-asset-reports-carried",
}

STAMP_SIGS = ["fin_stability","sov_debt","energy","geopolitical","supply_chain","currency","gold","crypto","china","europe","us_cycle","middle_east"]

def md5(p):
    return hashlib.md5(open(p,'rb').read()).hexdigest().upper()
def load(p):
    return json.load(open(p, encoding='utf-8'))

sig = load(SIG); mac = load(MACRO)
# ---------- guards: c162 state ----------
assert sig['metadata']['last_update'] == "2026-10-08T12:37:00+00:00", "signals last_update not c162"
assert mac['scan_id'] == "blackwatch-2026-10-08-1237", "macro scan_id not c162"
assert len(mac['alert_log']) == 167, "alert_log != 167"
assert os.path.exists(ART162), "c162 artifact missing"
assert set(sig['signals'].keys()) == set(["fin_stability","liquidity","sov_debt","energy","geopolitical","cyber","supply_chain","food_security","climate","social_cohesion","inst_trust","ai_acceleration","currency","gold","crypto","china","europe","us_cycle","middle_east","public_sentiment"]), "signal keyset drifted"
pre_sig_size = os.path.getsize(SIG); pre_mac_size = os.path.getsize(MACRO)
untouched = {k: json.dumps(sig['signals'][k], sort_keys=True) for k in sig['signals'] if k not in STAMP_SIGS}
pre_al167 = json.dumps(mac['alert_log'][166], sort_keys=True, ensure_ascii=False)

# ---------- apply: macro c163 ----------
mac['last_updated'] = LAST
mac['scan_id'] = SCAN
mac['highest_alert'] = ("middle_east_war 200 (SUSTAINED CAT-5, month 8+; 163rd consecutive scan, window Oct-8 1237Z -> Oct-8 2037Z 8h-RESTORE-MERGED (1637Z slot MISSED post-outage, restored job fired 2047Z); NO-ALERT-CHANGES (sustained-163rd; KINETIC-BASIS 13: UKMTO-159-26-LOGGED-Oct-8 time-late-incident-Oct-6-17:09UTC-crude-tanker-Hormuz-no-casualties, first new rung since 158-26; 160-26-sweep-NIL) + THIS-CYCLE (BRENT-SETTLE-104.28-+4.07%-streak-~215h-de-esc-gate-UNRESOLVED + TRUMP-NO-STRIKES-BEFORE-MIDTERMS-4SRC + TREASURY-HITS-IRANIAN-OIL-FLEET + UK-10Y-19YR-HIGH-2src + ECB-ACCOUNTS-Oct-8-landed-12:21Z + NIKKEI-69,042-sub-70k-day-low-close + KS11-6,625.93--2.62% + HSI--1.43% + Nifty--1.64% + KOREA-CHINA-BASED-ACTOR-ATTRIBUTION-DAY-4 + BTC-81,748.78-SUB-82K-FIRST-zone-broken + GOLD-4,159.20-close-rebound + SILVER-Comex-59.425-close + KENYA-CONTACTS-66-+-WAJIR-SUSPECTED + SUDAN-BLUE-NILE-new-geo + RSF-commander-defects-300 + PBOC-fix-6.7367 + US-CLOSE-mixed-S&P--0.47/Nasdaq--1.25-chip-led/DJI-+0.10; TNX-5.231-close-after-5.36-swing-peak; attribution NIL; alert_log #168)")
mac['alert_log'].append({"timestamp": LAST, "event": T_MAIN_163})
assert len(mac['alert_log']) == 168
mac['active_count'] = 5; mac['developing_count'] = 2; mac['watch_count'] = 1; mac['clear_count'] = 0

# ---------- apply: signals c163 ----------
sig['metadata']['last_update'] = LAST
tb = sig['metadata']['threshold_breach']
sig['metadata']['threshold_breach'] = tb + (" || breaking scan 20:37Z in-slot restored-merged (cycle-163 window 1237Z->2037Z 8h; 1637Z slot MISSED post-outage, restored job fired 20:47Z; 23 query ops/12 domains + quotes 26/26 + 7/7-intra 20:43:27Z first-attempt artifact re-used) + UKMTO-159-26-NEW (time-late Oct-6-17:09UTC crude-tanker-Hormuz-no-casualties; registry-latest 159-26; 160-26-NIL; KINETIC-BASIS 13; first rung since 158-26) + Brent-settle-104.28-+4.07%-streak-~215h-de-esc-gate-open + TRUMP-NO-STRIKES-BEFORE-MIDTERMS-4src + Treasury-hits-oil-fleet + UK-10Y-19yr-high-2src + ECB-accounts-Oct-8-landed + Nikkei-sub-70k-day-low-close + BTC-sub-82k-first-zone-broken + KS11--2.62% + alert_log #168")
for k in STAMP_SIGS:
    o = sig['signals'][k]
    o['note'] = NOTES[k][:980]
    o['timestamp'] = LAST

# ---------- artifacts + aliases ----------
art = {"scan_id": SCAN, "scan_type": "breaking_event_4h", "timestamp": LAST,
       "execution_note": T_MAIN_163, "alert_changes": ALERT_CHANGE,
       "cycle_headline": HEADLINE,
       "quotes_basis": "Yahoo 26/26 + 7/7-intra live-quotes-2026-10-08-2037.json fetched 20:43:27Z by restored-job first attempt (session lost post-fetch; in-slot artifact re-used, no refetch; threshold scanner value-ownership convention applies to its own runs)"}
with open(ART,'w',encoding='utf-8') as f:
    json.dump(art, f, indent=1, ensure_ascii=False); f.write('\n')
shutil.copyfile(ART, ARTL1); shutil.copyfile(ART, ARTL2)

# ---------- write: canon atomic finalize (tmp-verify-swap) ----------
tmp_sig = SIG + '.tmp'; tmp_macro = MACRO + '.tmp'
with open(tmp_sig,'w',encoding='utf-8') as f:
    json.dump(sig, f, indent=1, ensure_ascii=False); f.write('\n')
with open(tmp_macro,'w',encoding='utf-8') as f:
    json.dump(mac, f, indent=1, ensure_ascii=False); f.write('\n')
vs = os.path.getsize(tmp_sig); vm = os.path.getsize(tmp_macro)
print('sizes: sig %d -> %d (%+d) | macro %d -> %d (%+d)' % (pre_sig_size, vs, vs-pre_sig_size, pre_mac_size, vm, vm-pre_mac_size))
if not (476000 <= vs <= 512000): print('SIG SIZE OUT OF BAND'); sys.exit(2)
if not (pre_mac_size <= vm <= pre_mac_size + 25000): print('MACRO SIZE OUT OF BAND'); sys.exit(2)
chk = load(tmp_sig); chkm = load(tmp_macro)
assert len(chk['signals']) == 20 and len(chkm['alert_log']) == 168
for k,v in untouched.items():
    assert json.dumps(chk['signals'][k], sort_keys=True) == v, f'untouched drift {k}'
assert json.dumps(chkm['alert_log'][166], sort_keys=True, ensure_ascii=False) == pre_al167, 'old alert mutated'
shutil.copyfile(tmp_sig, SIG); shutil.copyfile(tmp_macro, MACRO); os.remove(tmp_sig); os.remove(tmp_macro)
print('SIGNALS stamped 12 (canon written) + macro alert_log #168')
print('post-sig md5:', md5(SIG)[:8])

# ---------- canon alias fix: copy AFTER finalize ----------
shutil.copyfile(SIG, SIGAL)
assert md5(SIGAL) == md5(SIG), 'canon alias signals.json mismatch vs canon'
print('canon alias signals.json fixed post-finalize: md5', md5(SIGAL)[:8])

# ---------- sync: 4 targets ----------
targets = {
  'repo':    r'C:\Users\impro\vueroo-portal-scan\public\data',
  'live':    r'C:\Users\impro\vueroo-portal\public\data',
  'lumina':  r'D:\Lumina\workspace\data',
  'hygiene': r'C:\Users\impro\.openclaw\workspace\vueroo-portal\public\data',
}
checks = []
sig_h, mac_h, art_h = md5(SIG), md5(MACRO), md5(ART)
for name, tgt in targets.items():
    os.makedirs(tgt, exist_ok=True)
    shutil.copyfile(SIG, os.path.join(tgt, 'blackwatch-signals.json'))
    shutil.copyfile(SIG, os.path.join(tgt, 'signals.json'))
    shutil.copyfile(MACRO, os.path.join(tgt, 'blackwatch-macro-event.json'))
    shutil.copyfile(ART, os.path.join(tgt, f'breaking-event-2026-10-08-2037.json'))
    shutil.copyfile(ART, os.path.join(tgt, 'breaking-event-latest.json'))
    shutil.copyfile(ART, os.path.join(tgt, 'breaking-events-latest.json'))
    checks += [(name+'/'+fn, md5(os.path.join(tgt, fn)), h) for fn, h in
               [('blackwatch-signals.json', sig_h), ('signals.json', sig_h), ('blackwatch-macro-event.json', mac_h),
                ('breaking-event-2026-10-08-2037.json', art_h), ('breaking-event-latest.json', art_h), ('breaking-events-latest.json', art_h)]]
    sc = os.path.join(tgt, 'blackwatch-scans')
    if os.path.isdir(sc):
        for src in (ART, ART162, LQ, __file__):
            try:
                shutil.copyfile(src, os.path.join(sc, os.path.basename(src)))
            except Exception as e:
                print('scans-mirror skip', os.path.basename(src), e)
bad = sum(1 for _, got, want in checks if got != want)
for label, got, want in checks:
    if got != want: print('MISMATCH', label)
print('sync checks:', len(checks), 'mismatches:', bad)
print('applied', NOW_UTC, '| canon sig', sig_h[:8], 'macro', mac_h[:8], 'art', art_h[:8])

# ---------- git commit+push ----------
msg = ("BlackWatch breaking event scan 2026-10-08-2037 (cycle 163, 8h restore-merged window 1237Z->2037Z; 1637Z slot missed post-outage): CAT-5 SUSTAINED 163rd + NEW-KINETIC-RUNG UKMTO-159-26 logged Oct-8 (time-late incident Oct-6 17:09UTC, crude tanker struck by unknown projectile Hormuz, no casualties; registry-latest 159-26, 160-26-sweep-NIL; KINETIC-BASIS 13) + JMIC Update-103 SEVERE + NO-ALERT-CHANGES (8 scores carried; alert_log #168). "
       "Quotes 26/26 + 7/7-intra 20:43:27Z (restored-job first-attempt artifact re-used). Texture: BRENT-SETTLE-104.28-+4.07% (DJ+TASS; CL ~90.89; streak ~215h >100; de-esc gate UNRESOLVED -> Fri) + TRUMP-NO-STRIKES-BEFORE-MIDTERMS-4src ('productive discussions', AP/WSJ/Axios) + Treasury-hits-Iranian-oil-fleet + US-CLOSE-mixed (S&P 7,765 -0.47 / Nasdaq 27,193 -1.25 chip-led / DJI 51,232 +0.10; TNX 5.231 close after 5.36 swing peak) + UK-10Y-19YR-HIGH + UK-30Y-6.0-zone + ECB-ACCOUNTS-Oct-8 (Sept min: upside skew, no guidance) + NIKKEI-69,042-sub-70k-day-low-close + KS11 6,625.93 -2.62% + HSI -1.43%/Nifty -1.64% + KOREA-China-based-actor-attribution-day-4 (CrowdStrike ARTEX/Reuters) + BTC-81,749-SUB-82K-FIRST (82-83k broken; 484.9M Oct-7 outflow 6src consolidated) + GOLD-4,159.20-close-rebound + SILVER-Comex-59.425-close + KENYA-contacts-57->66 + Wajir-suspected-case + SUDAN-Blue-Nile-new-geo + RSF-commander-defects-300 + PBOC-fix-6.7367. "
       f"4-target sync MD5-verified (workspace canon + vueroo-portal-scan repo + vueroo-portal live + D-Lumina) + dated artifacts + hygiene mirror; canon-alias signals.json post-finalize copy asserted. Vercel auto-deploy.")
cmg = os.path.join(CANON, '..', 'scripts', 'blackwatch-2026-10-08-2037-commit-msg.txt')
try:
    with open(cmg, 'w', encoding='utf-8') as f: f.write(msg)
except Exception as e: print('commit-msg save skip', e)
git = r'C:\Users\impro\vueroo-portal-scan'
r1 = subprocess.run(['git','add','-A'], cwd=git, capture_output=True, timeout=60)
r2 = subprocess.run(['git','commit','-m',msg], cwd=git, capture_output=True, timeout=120)
print('COMMIT:', (r2.stdout or r2.stderr).decode('utf-8','ignore')[:300])
r3 = subprocess.run(['git','pull','--rebase','origin','main'], cwd=git, capture_output=True, timeout=90)
print('REBASE:', (r3.stdout or r3.stderr).decode('utf-8','ignore')[:200])
r4 = subprocess.run(['git','push','origin','main'], cwd=git, capture_output=True, timeout=120)
print('PUSH rc=%d:' % r4.returncode, ((r4.stdout or r4.stderr).decode('utf-8','ignore'))[:300])
if r4.returncode != 0:
    print('PUSH FAILED — retry once')
    r4 = subprocess.run(['git','push','origin','main'], cwd=git, capture_output=True, timeout=120)
    print('RETRY rc=%d:' % r4.returncode, ((r4.stdout or r4.stderr).decode('utf-8','ignore'))[:200])
print('ALL DONE' if bad == 0 else 'CHECK FAILURES')