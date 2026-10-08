#!/usr/bin/env python3
"""BlackWatch c160-COMPLETION + c161 (window Oct-8 0837Z->0913Z) — apply + sync + push, c150-convention.
Restored-run debt duty: c160 died at 600s timeout after macro copy; this script pays its sync/push debt AND stamps c161."""
import json, shutil, hashlib, os, subprocess, sys
from datetime import datetime, timezone

CANON = r'C:\Users\impro\.openclaw\workspace\data'
SIG   = os.path.join(CANON, 'blackwatch-signals.json')
MACRO = os.path.join(CANON, 'blackwatch-macro-event.json')
ART160 = os.path.join(CANON, 'breaking-event-2026-10-08-0837.json')
ART   = os.path.join(CANON, 'breaking-event-2026-10-08-0913.json')
ARTL1 = os.path.join(CANON, 'breaking-event-latest.json')
ARTL2 = os.path.join(CANON, 'breaking-events-latest.json')
SIGAL = os.path.join(CANON, 'signals.json')
LQ160 = os.path.join(CANON, 'blackwatch-scans', 'live-quotes-2026-10-08-0837.json')
NOW_UTC = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%SZ')

LAST  = "2026-10-08T09:13:00+00:00"
SCAN  = "blackwatch-2026-10-08-0913"
W     = "161st"

T_MAIN_161 = ("RESTORE-DEBT-PAID QUIET-CHECKPOINT + CAT-5 SUSTAINED (window Oct-8 0837Z -> Oct-8 0913Z short-cycle; resumed-run scan; search-basis 16 queries/12 domains executed ~09:14-09:20Z; scan-id blackwatch-2026-10-08-0913): CAT-5 SUSTAINED 161st + alert_log #166. NO-ALERT-CHANGES (8 scores carried UNCHANGED: middle_east_war 200 / us_recession 200 / china_collapse 120 / japan_yen 120 / euro_crisis 120 / asian_contagion 100-DEVELOPING / crypto_collapse 40 / global_pandemic 40; KINETIC-BASIS-12-HELD: UKMTO-registry-latest-stays-158-26 = 159-26-sweep-2nd-NIL (batched searches return 158-26-era syndication only: seatrade-'crew-casualties'-tanker-off-Qatar-Oct-8 + shipandbunker-'multiple-projectiles-north-of-Madinat-ash-Shamal' + regulasshipping-'hit-north-of-Qatar-after-Warning-158-26' + worldports-Argus = CARRIED not-new; monitor-last-upd-21:14:17Z-Oct-7-carry). C160-DEBT-PAID: RUN2-of-4 08:47:56Z->08:57:57Z applied canon SIG+MACRO+artifact (md5s E2FDD92B/D1693AB2) then died at 600s timeout BEFORE aliases+4-target-sync+git-push (RUN1 quotes-fetch-only 08:40:20Z 26/26; RUN3 08:58:57->09:08:58Z no-durable-output; targets proven stale c159-era A902BAEC pre-apply; THIS cycle completed aliases+sync+commit+push). QUOTE-BASIS-DEGRADED-FLAG: NO live-quotes fetch this cycle (timeout-budget guard) — search-level quotes only; threshold-scanner owns values 1237Z. TEXTURE-SET-CARRY+LATE-CATCH: BRENT->104-zone-THU (c160 104.31-+4.1% + sharecast-'oil-BREACHES-103-on-Hormuz-attacks'-open + streak-~204h->100; first-sub-100-SETTLE-de-esc-gate->resolves-c163) + EUROPE-OPEN-SLUMP-LATE-CATCH (sharecast-'shares-slump'-open + FTSE-'opens-lower'-DAX-leads-pullback-247wallst-07:00Z + investinglive-'bond-yield-pressures-deepen-selloff'-07:19Z = c160-window-consolidation) + FRENCH-SPREAD-WIDENS-LATE-CATCH (Reuters-devdiscourse-07:28:05Z-'euro-zone-yields-jump-again-...-French-spread-widens' + fxbus-15:44-CEST-French-10Y-texture) + US-IRAN-ESCALATION-PREP-CARRY (Soufan-post-midterms + IranIntl-mediators-await + GulfNews-READY-MODE-05:39Z + NO-final-decision) + SAUDI-AIRPORT-DEATHS-3-CONF-CARRY (AFP-07:54:38Z + DW-05:22:40Z-claim + BBC-2h-ago-wrap + AA-airline-warning-renewed) + ERITREA-INTO-TIGRAY-CARRY (BBC-'move-DEEP-in'-wrap + AP-Hill-synd-06:43:49Z + AJ-Oct-7-witnesses; interstate-texture-not-rung) + KOREA-CYBER-DAY-4-TRACK-WIDENS (KoreaTimes-07:06:03Z-'INTENSIFIES-EFFORTS-TO-TRACK-HACKERS' + SBS-09:20-KST-'clues-to-identity' + KoreaHerald-Chinese-speaking-hacker-00:52:55Z-carry + FSC-vows-tougher-checks-carry) + A-SHARE-DAY-0-CLOSE-CARRY (SH-3,811.90--0.79% + CHINEXT--3.15% + STAR50--4.82%-CPO-semis-led + 3700-names-red + turnover-1.69万亿; 10jqka/sina-07:02Z-close-reviews) + GOLD-DRIFT-DOWN (exa-live-09:17:41Z-4,123.15--0.52%-vs-prev-close-4,144.57-BASIS-3-FLAG-retained + BT-'recover-from-two-month-low'-USD-stall-0140GMT-4,141 + AZERTAC-COMEX-4,153.0-06:44Z) + ETF-OUTFLOW-485M-CARRY + FDIC-no-7th-official-carry + ARGENTINA-carry (Infobae-04:14:24Z + c5n-00:17Z; imago-'during-June'-VINTAGE-KILL-flag) + JUNK-KILLED: **brusselspost-'US-Carried-Heavy-Strikes-on-Iran-after-Jordan-missiles'-single-source-lookalike-nominal-Oct-8-headline-pattern-2024-vintage + ZERO-wire-corroboration-in-16-searches + CONFLICTS-Soufan-CENTCOM-no-final-decision-thread = NOT-ADOPTED** + H5N1-animal-carry-NO-human-increment + Kenya-57-contacts-10-quarantined-stands. Full-cycle quiet-checkpoint; restored-attempt-series completed; 4-op-cycle.")

T_MAIN_160_CARRY = ("IRGC-HORMUZ-CLOSURE-CLAIM-CLIMAX + US-IRAN-ESCALATION-PREP + ASIA-DAY-3-DEEPENS + OIL-ACCELERATION-104 (window Oct-8 0437Z -> Oct-8 0837Z; restored-attempt quotes 08:40:20Z 26/26 + searches 08:47-08:57Z; run died pre-sync; scan-id blackwatch-2026-10-08-0837): CAT-5 SUSTAINED 160th + alert_log #165 + NO-ALERT-CHANGES (KINETIC-BASIS-12-HELD UKMTO-158-26-no-159-26-sweep) + BRENT-104.31-+4.1%-STREAK-~204H + KS11-CLOSE-6,625.93--2.62%-NEW-LOW-below-6600-cyber-day-4 + N225-CLOSE-69,042.11--1.42% + A-SHARE-REOPEN-DAY-0-CLOSE-SH--0.79%/CHINEXT--3.15%/STAR50--4.82%-SEMIS-LED + HSI--1.43% + NSEI-22,207.7--1.75% + UK30Y-6.036-PRINT-28YR-ZONE + BTP-Bund-115-4.69% + MILAN-BELOW-50k + MOF-30Y-JGB-4.109%-3.88x + FOMC-minutes-ALL-19-HAWKISH + US-FUTURES-FALL + SOUFAN-US-IRAN-ESCALATION-PREP-POST-MIDTERMS + IranIntl-mediators-await + GULFNEWS-READY-MODE + AFP-3-DEAD-AIRPORTS-CONF + ERITREAN-TROOPS-INTO-TIGRAY-TEXTURE + AI-DEBT-WAVE-WIDENS-SpaceX-40BN-money-loop + TRUMP-DYED-DIESEL-ORDER-little-relief + HEATING-OIL-RECORD-4.80 + ETF-OUTFLOW-485M-CONF + FDIC-no-7th-27TH + KOREA-VIRTUAL-ASSET-DEADLINE-DAY + EUROGROUP-in-session-results-pending + H5N1-animal-carry + Kenya-57-contacts; DEGRADED-COMPLETION-FLAG: sync-commit-push-missed->paid-0913-cycle (alert_log #165 event as-recorded-pre-crash; sync-debt-paid-this-cycle)")

ALERT_CHANGE = {"none": ("NO-ALERT-CHANGES cycle (sustained-161st; all 8 convergence scores unchanged: middle_east_war 200 / us_recession 200 / china_collapse 120 / japan_yen 120 / euro_crisis 120 / asian_contagion 100-DEVELOPING / crypto_collapse 40 / global_pandemic 40; KINETIC-BASIS 12 HELD: UKMTO-159-26-sweep-2nd-NIL; no new category-5 rungs in 16-op scan; US-IRAN-strike-prep-carry-no-final-decision; junk-killed brusselspost-strikes-flag)")}

HEADLINE = ("RESTORE-DEBT-PAID + CAT-5-SUSTAINED-161ST-QUIET-CHECKPOINT + NO-ALERT-CHANGES + UKMTO-159-26-SWEEP-2ND-NIL + BRENT-104-ZONE-CARRY + EUROPE-OPEN-SLUMP-LATE-CATCH + FRENCH-SPREAD-WIDENS + GOLD-4123-DRIFT + KOREA-TRACK-WIDENS + JUNK-KILLED-BRUSSELSPOST-STRIKES-FLAG + ALERT-LOG-#166")

NOTES = {
 "energy": "BREAKING 0913Z Oct-8 c161 (window 0837Z->0913Z restored-cycle): QUIET-CHECKPOINT-CARRY (Brent-104-zone-c104.31-+4.1% + sharecast-'oil-breaches-103'-EU-open-late-catch + streak-~204h->100-NO-sub-100-print; THU-settle-de-esc-gate->c163) + HEATING-OIL-record-4.80-carry + dyed-diesel-carry + IEA-325M-released-carry + Hormuz-claim-climax-vs-CENTCOM-20M-bbl-carry + transits-lowest-2-months-carry",
 "geopolitical": "BREAKING 0913Z Oct-8 c161: US-IRAN-ESCALATION-PREP-CARRY (Soufan- + IranIntl-mediators-await + READY-MODE-05:39Z; no-final-decision; NO-wire-corrob-of-strikes-in-16-op-scan) + SAUDI-AIRPORT-DEATHS-3-CARRY (AFP-07:54Z + DW-05:22Z-claim + BBC-wrap; coalition-82-targets-carry + airline-warning-renewed) + ERITREA-TIGRAY-CARRY (BBC-deep-in + AP-Hill-06:43Z + AJ-Oct-7; interstate-TEXTURE-not-rung) + UKMTO-158-26-HELD-159-26-sweep-NIL + JUNK-KILLED-brusselspost-heavy-strikes-single-source",
 "middle_east": "BREAKING 0913Z Oct-8 c161: HORMUZ-CLAIM-CLIMAX-CARRY (Naqdi-closed-claim-vs-CENTCOM-20M-bbl-FLOWING-conflict-2src-logged) + US-IRAN-STRIKE-PREP-CARRY-no-final-decision + SAUDI-KKIA+ABHA-DEATHS-3-CARRY + SAUDI-82-TARGETS-carry + Houthi-airline-warning-renewed-carry + ERITREA-TIGRAY-interstate-texture + UKMTO-158-26-HELD-no-159-26-2nd-sweep-NIL",
 "supply_chain": "BREAKING 0913Z Oct-8 c161: HORMUZ-TRANSITS-LOWEST-2-MONTHS-carry (reduced-but-flowing) + OMAN-coastal-route-crackdown-threat-carry + Bab-el-Mandeb-carry + Houthi-airline-warning-carry + IEA-release-ACCELERATION-carry + heating-oil-record-carry + dyed-diesel-little-relief-carry",
 "sov_debt": "BREAKING 0913Z Oct-8 c161: TNX-5.277-carry + TYX-5.661 + UK30Y-6.036-28YR-ZONE-carry + Reuters-'euro-yields-jump-again-FRENCH-SPREAD-WIDENS'-07:28Z-late-catch + MOF-30Y-JGB-4.109%-3.88x-result-carry + BTP-Bund-115-stable-4.69%-open-carry (ANSA-08:33-CEST) + gilt-Zone-carry + 10y-auction-5.300-since-NOV2000",
 "currency": "BREAKING 0913Z Oct-8 c161: DXY-102.263-DAY-6-carry + JPY-158.2-firm-158-zone-carry + JGB-30Y-auction-4.109%-today-carry + Fed-minutes-'JULY-coordinated-yen-intervention-US-TREASURY-funded'-carry + BoJ-hike-bets-intervention-risks-carry + EUR-1.1189-weak-G10 + USDBRL-5.0182-carry + GBP-1.3200-floor-carry",
 "gold": "BREAKING 0913Z Oct-8 c161: GOLD-DRIFT-DOWN (exa-live-09:17:41Z-4,123.15--0.52% + BT-'recover-from-2-month-low-USD-stall'-0140GMT-4,141.09 + AZERTAC-COMEX-4,153.0-06:44Z) + prev-close-BASIS-3-FLAG (4,144.57-exa-vs-4,140.70-e-close-vs-4,113.80-Comex-settle) + COMEX-registered-tracker-basis-mismatch-flag-stays-OPEN + silver-60.05-chase-dream-carry + $31bn-Q3-ETF-cant-hold-bid-carry",
 "crypto": "BREAKING 0913Z Oct-8 c161: BTC-82,795-zone-82-83k-support-carry + ETF-OUTFLOW-485M-CONF-CARRY (cointelegraph-07:30Z + coincamps-484.9M + pomegra-83k + cryptocompass-651M-longs-4.2%) = outflow-side-consolidated + OI-68.13B-carry; no-escalation-watch-held",
 "china": "BREAKING 0913Z Oct-8 c161: A-SHARE-DAY-0-CLOSE-CARRY (SH-3,811.90--0.79% + SZ-12,620.9--2.07% + CSI300--1.09% + CHINEXT--3.15% + STAR50--4.82%-CPO/semis-led + turnover-1.69trn-放量 + 3700-names-red + late-tail-rebound; 10jqka-07:02Z + sina-07:02Z close-reviews) + PBOC-fix-6.7367-weak-carry + EU-hybrid-import-cap-carry + fuel-window-Oct-15-carry",
 "europe": "BREAKING 0913Z Oct-8 c161: EUROPE-OPEN-SLUMP-CONF-LATE-CATCH (sharecast-'shares-slump-oil-breaches-103-Hormuz' + FTSE-lower-DAX-leads-pullback-07:00Z + investinglive-'bond-yield-pressures-deepen-selloff'-07:19Z) + Reuters-'French-spread-WIDENS'-07:28Z + BTP-Bund-115-stable-ANSA + UK30Y-6.036-28YR-carry + EUROGROUP-TODAY-results-pending-carry + ECOFIN-Oct-9 + ECB-accounts-today",
 "us_cycle": "BREAKING 0913Z Oct-8 c161: CARRY (US-FUTURES-FALL-Yahoo-08:05Z-'oil-rises-inflation-worries' + FXStreet-08:32Z-'futures-drop-yields-surge' + Yonhap-'S&P-futures-edge-lower-yields-multi-decade-highs'-03:09Z) + FOMC-minutes-ALL-19-hawkish-'most'-another-by-YE-carry + 10y-auction-5.300-carry + CPI-Oct-14-gate + minutes-AI-debt-discussion-carry",
 "fin_stability": "BREAKING 0913Z Oct-8 c161: KOREA-CYBER-DAY-4-TRACK-WIDENS (KoreaTimes-07:06:03Z-'intensifies-efforts-track-hackers' + SBS-09:20-KST-'clues-to-identity' + Herald-Chinese-speaking-hacker-00:52Z-carry + FSC-lee-tougher-checks-carry) + KS11-6,625.93--2.62%-NEW-LOW-carry + AI-DEBT-WAVE-carry (SpaceX-40BN + CNA-bonds-submerged) + ETF-outflow-485M-carry + private-credit-carry + FDIC-no-7th-27th-official-carry + MILAN-sub-50k-carry + VIX-15.58-carry",
}

STAMP_SIGS = ["fin_stability","sov_debt","energy","geopolitical","supply_chain","currency","gold","crypto","china","europe","us_cycle","middle_east"]

def md5(p):
    return hashlib.md5(open(p,'rb').read()).hexdigest().upper()
def load(p):
    return json.load(open(p, encoding='utf-8'))

sig = load(SIG); mac = load(MACRO)
# ---------- guards: c160 state ----------
assert sig['metadata']['last_update'] == "2026-10-08T08:37:00+00:00", "signals last_update not c160"
assert mac['scan_id'] == "blackwatch-2026-10-08-0837", "macro scan_id not c160"
assert len(mac['alert_log']) == 165, "alert_log != 165"
assert os.path.exists(ART160), "c160 artifact missing"
assert set(sig['signals'].keys()) == set(["fin_stability","liquidity","sov_debt","energy","geopolitical","cyber","supply_chain","food_security","climate","social_cohesion","inst_trust","ai_acceleration","currency","gold","crypto","china","europe","us_cycle","middle_east","public_sentiment"]), "signal keyset drifted"
pre_sig_size = os.path.getsize(SIG); pre_mac_size = os.path.getsize(MACRO)
untouched = {k: json.dumps(sig['signals'][k], sort_keys=True) for k in sig['signals'] if k not in STAMP_SIGS}
pre_al165 = json.dumps(mac['alert_log'][164], sort_keys=True, ensure_ascii=False)

# ---------- apply: macro c161 ----------
mac['last_updated'] = LAST
mac['scan_id'] = SCAN
mac['highest_alert'] = ("middle_east_war 200 (SUSTAINED CAT-5, month 8+; 161st consecutive scan, window Oct-8 0837Z -> Oct-8 0913Z SHORT-RESTORED-CYCLE + search-basis-only quotes-degraded; NO-ALERT-CHANGES (sustained-161st; KINETIC-BASIS 12 HELD: UKMTO-registry-latest-stays-158-26, 159-26-sweep-2nd-NIL) + THIS-CYCLE (QUIET-CHECKPOINT: no new rungs in 16-op/12-domain scan; Brent-104-zone-carry + streak-~204h; EUROPE-OPEN-SLUMP-late-catch (shares-slump-oil-103 + FTSE-lower-DAX-pullback + yields-deepen-selloff) + FRENCH-SPREAD-WIDENS-Reuters-07:28Z-late-catch + GOLD-4,123.15-exa-09:17:41Z-drift-basis-3-flag + KOREA-CYBER-DAY-4-track-widens-KoreaTimes-07:06Z + A-SHARE-DAY-0-CLOSE-carry + US-IRAN-PREP-no-final-decision + AFP-3-DEAD-AIRPORTS-carry + ERITREA-TIGRAY-texture-carry + FDIC-no-7th-official-carry + ETF-outflow-485M-consolidated + JUNK-KILLED-brusselspost-heavy-strikes-single-source-lookalike-vintage + H5N1-no-human-increment + Kenya-57-contacts; attribution NIL; restore-debt-paid; alert_log #166)")
mac['alert_log'].append({"timestamp": LAST, "event": T_MAIN_161})
assert len(mac['alert_log']) == 166
mac['active_count'] = 5; mac['developing_count'] = 2; mac['watch_count'] = 1; mac['clear_count'] = 0

# ---------- apply: signals c161 ----------
sig['metadata']['last_update'] = LAST
tb = sig['metadata']['threshold_breach']
sig['metadata']['threshold_breach'] = tb + (" || restore-resumed scan 09:13Z (cycle-161 short-window 0837Z->0913Z; 16 query ops/12 domains search-basis-only; quotes-degraded-flag; c160 sync+push debt PAID this cycle: targets were stale c159-era + no-160-commit -> committed 161st-CAT-5 with c160-completion; threshold scanner owns values 1237Z) + quiet-checkpoint: NO-new-breach-class in 16-op scan; Brent-104-zone-carry streak-~204h + Europe-open-slump-late-catch + gold-4123-drift; alert_log #166")
for k in STAMP_SIGS:
    o = sig['signals'][k]
    o['note'] = NOTES[k][:980]
    o['timestamp'] = LAST

# ---------- c160 completion: write c160-dated artifact is already in canon (#165 entry as-recorded) ----------
# ---------- artifacts + aliases ----------
art = {"scan_id": SCAN, "scan_type": "breaking_event_4h", "timestamp": LAST,
       "execution_note": T_MAIN_161, "alert_changes": ALERT_CHANGE,
       "cycle_headline": HEADLINE,
       "degraded_basis_flag": "search-only quote basis this cycle (no live-quotes fetch; timeout-budget guard after 3x 600s restore-attempt timeouts); threshold scanner owns values",
       "restore_debt": {"c160_scan_id": "blackwatch-2026-10-08-0837", "c160_alert_log_index": 165,
                        "paid": ["aliases", "4-target-sync", "git-commit-push"],
                        "note": "c160 run died at 600s timeout 08:57:57Z ~17s after macro copy; pre-crash canon state E2FDD92B/D1693AB2 verified and preserved as alert_log #165 as-recorded; targets proven stale c159-era pre-apply"}}
with open(ART,'w',encoding='utf-8') as f:
    json.dump(art, f, indent=1, ensure_ascii=False); f.write('\n')
shutil.copyfile(SIG, SIGAL)
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
assert len(chk['signals']) == 20 and len(chkm['alert_log']) == 166
for k,v in untouched.items():
    assert json.dumps(chk['signals'][k], sort_keys=True) == v, f'untouched drift {k}'
assert json.dumps(chkm['alert_log'][164], sort_keys=True, ensure_ascii=False) == pre_al165, 'old alert mutated'
shutil.copyfile(tmp_sig, SIG); shutil.copyfile(tmp_macro, MACRO); os.remove(tmp_sig); os.remove(tmp_macro)

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
    shutil.copyfile(ART, os.path.join(tgt, f'breaking-event-2026-10-08-0913.json'))
    shutil.copyfile(ART, os.path.join(tgt, 'breaking-event-latest.json'))
    shutil.copyfile(ART, os.path.join(tgt, 'breaking-events-latest.json'))
    checks += [(name+'/'+fn, md5(os.path.join(tgt, fn)), h) for fn, h in
               [('blackwatch-signals.json', sig_h), ('signals.json', sig_h), ('blackwatch-macro-event.json', mac_h),
                ('breaking-event-2026-10-08-0913.json', art_h), ('breaking-event-latest.json', art_h), ('breaking-events-latest.json', art_h)]]
    sc = os.path.join(tgt, 'blackwatch-scans')
    if os.path.isdir(sc):
        for src in (ART, ART160, LQ160, __file__):
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
msg = ("BlackWatch breaking event scan 2026-10-08-0913 (cycle 161, restored-short-window 0837Z->0913Z): CAT-5 SUSTAINED 161st + NO-ALERT-CHANGES (8 scores carried: middle_east_war 200 / us_recession 200 / china_collapse 120 / japan_yen 120 / euro_crisis 120 / asian_contagion 100-DEVELOPING / crypto_collapse 40 / global_pandemic 40; UKMTO-158-26-HELD, 159-26-sweep-2nd-NIL) + alert_log #165 (c160 pre-crash as-recorded) + #166. "
       "RESTORE-DEBT-PAID: c160 0837Z run (RUN2, 08:47:56Z->08:57:57Z) applied canon SIG+MACRO+artifact (E2FDD92B/D1693AB2) then died at 600s timeout ~17s after macro copy — aliases + 4-target sync + git push were owed and are paid here (targets proven stale c159-era md5 A902BAEC pre-apply; no-160-commit in log). Quotes-degraded-flag this cycle (search-only basis, no live-quotes fetch — timeout-budget guard). Texture: Brent-104-zone streak-~204h carry + Europe-open-slump late-catch (oil-breaches-103) + French-spread-widens-Reuters-07:28Z + gold-4,123.15-exa-basis-3-flag + Korea-cyber-day-4-track-widens + ETF-outflow-485M-consolidated + FDIC-no-7th-official + junk-killed brusselspost-'heavy-strikes'-single-source-lookalike-vintage-flag (conflicts 4-src no-final-decision thread). "
       f"4-target sync MD5-verified (workspace canon + vueroo-portal-scan repo + vueroo-portal live + D-Lumina) + dated artifacts both cycles + hygiene mirror. Vercel auto-deploy.")
git = r'C:\Users\impro\vueroo-portal-scan'
r1 = subprocess.run(['git','add','-A'], cwd=git, capture_output=True, timeout=60)
r2 = subprocess.run(['git','commit','-m',msg], cwd=git, capture_output=True, timeout=120)
print('COMMIT:', (r2.stdout or r2.stderr).decode('utf-8','ignore')[:300])
r3 = subprocess.run(['git','pull','--rebase','origin','main'], cwd=git, capture_output=True, timeout=90)
r4 = subprocess.run(['git','push','origin','main'], cwd=git, capture_output=True, timeout=120)
print('PUSH rc=%d:' % r4.returncode, ((r4.stdout or r4.stderr).decode('utf-8','ignore'))[:300])
if r4.returncode != 0:
    print('PUSH FAILED — retry once')
    r4 = subprocess.run(['git','push','origin','main'], cwd=git, capture_output=True, timeout=120)
    print('RETRY rc=%d:' % r4.returncode, ((r4.stdout or r4.stderr).decode('utf-8','ignore'))[:200])
print('ALL DONE' if bad == 0 else 'CHECK FAILURES')