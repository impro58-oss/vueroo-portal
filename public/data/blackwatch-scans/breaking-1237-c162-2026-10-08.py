#!/usr/bin/env python3
"""BlackWatch c162 (1237Z slot, window Oct-8 0913Z -> Oct-8 1237Z) — apply + sync + push, c150-convention.
Fixes c161 restore-script alias bug as a side duty: canon signals.json now copied AFTER canon finalize."""
import json, shutil, hashlib, os, subprocess, sys
from datetime import datetime, timezone

CANON = r'C:\Users\impro\.openclaw\workspace\data'
SIG   = os.path.join(CANON, 'blackwatch-signals.json')
MACRO = os.path.join(CANON, 'blackwatch-macro-event.json')
ART   = os.path.join(CANON, 'breaking-event-2026-10-08-1237.json')
ARTL1 = os.path.join(CANON, 'breaking-event-latest.json')
ARTL2 = os.path.join(CANON, 'breaking-events-latest.json')
SIGAL = os.path.join(CANON, 'signals.json')
ART161 = os.path.join(CANON, 'breaking-event-2026-10-08-0913.json')
LQ    = os.path.join(CANON, 'blackwatch-scans', 'live-quotes-2026-10-08-1237.json')
NOW_UTC = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%SZ')

LAST  = "2026-10-08T12:37:00+00:00"
SCAN  = "blackwatch-2026-10-08-1237"
W     = "162nd"

T_MAIN_162 = ("QUIET-CHECKPOINT-CARRY + CAT-5 SUSTAINED (window Oct-8 0913Z -> Oct-8 1237Z in-slot; search-basis 17 queries/12 domains executed ~12:37-12:55Z + quotes 26/26 + 7/7-intra 12:42:27Z; scan-id blackwatch-2026-10-08-1237): CAT-5 SUSTAINED 162nd + alert_log #167. NO-ALERT-CHANGES (8 scores carried UNCHANGED: middle_east_war 200 / us_recession 200 / china_collapse 120 / japan_yen 120 / euro_crisis 120 / asian_contagion 100-DEVELOPING / crypto_collapse 40 / global_pandemic 40; KINETIC-BASIS-12-HELD: UKMTO-registry-latest-stays-158-26 = 159-26-sweep-3rd-NIL (all searches return 158-26-era syndication: BBC-10:07:58Z-158-26-coverage-lag + monitor-the-situation-lupd-10:19:59Z + mehr-09:30Z-'new-maritime-incident-north-of-Qatar'-echo-consistent + regulasshipping/worldports/alarabiya/Xinhua-158-26-era; warning-150-26-Oct-4-history; monitor-158-26-lupd-carry). THIS-CYCLE-IN-WINDOW: BRENT-FRESH-CYCLE-HIGH-INTRA (Yahoo-12:42:27Z-BZ=F-105.02-+4.81%-vs-Wed-settle-100.20 + intra-tail-12:30-105.02 + CL-92.49-+4.77% = above-c160-104-zone; Newsquawk-'Brent-tops-USD-104'-US-prepares-strikes-morning-texture + tipranks-104.22/WTI-91.86-morning + AA-'oil-rises-4%-...-hurricane-disruptions-US-crude-stocks-fall'-08:19TRT-carry; streak-~207h->100-NO-sub-100-print; FIRST-sub-100-SETTLE-de-esc-gate->resolves-2037Z-cycle) + TNX-5.322-+0.85%-LIVE-ABOVE-2007-PEAK-5.296 (5.25-gate-CLEARED-zone; TYX-5.694-+0.58%-24yr-zone) + EUROGROUP-RESULT-LANDED-IN-WINDOW (Euronext-Reuters-11:36Z-'euro-zone-ministers-to-tell-FRANCE-PASS-2027-BUDGET-to-calm-markets'+ECB-set; c160-results-pending-gate-RESOLVED-soft) + KOREA-CYBER-DAY-4-AI-AGENT-IDENTIFIED (Nikkei-CrowdStrike-'AI-tools-identified'-Shinhan+KB-targeted + sedaily-'fed-personal-details-into-Claude-Code'-CrowdStrike-report + CHOSUNBIZ-11:10Z-'AI-hacking-tool-SPREADS-ACROSS-SERVERS'-upd-11:34Z + DW-12:17:54Z-'warns-of-AI-aided-hacking' + JDA-FSS-'IP-blocking-alone-isnt-enough') + PBOC-NO-DEVALUATION-PLEDGE-IN-WINDOW (FXStreet-10:21:14Z-'neither-need-nor-intention'-+FX-transparency) + PBOC-500B-reverse-repo-inject + STATE-COUNCIL-WEIGHS-NEW-PROPERTY-SUPPORT (BeijingPost-Oct-8) + S&P-'property-turnaround'-texture-CNBC-09:25:35Z + SILVER-SPOT-58.88--3.30%-exa-12:43:26Z-SUB-59-FIRST (sub-60-day-2; Comex-59.15--1.25%' + registry-101.68Moz-gate-open) + GOLD-4,148.70-GC-LIVE-+0.19%-two-month-low-overnight-then-rebound (Yahoo-10:53Z-'YEARLY-GAINS-EVAPORATE-after-Fed-higher-rates'-texture + CNBC-TV18-01:49Z-2-month-low + morning-prints-4,120-variants-basis-3-flag-OPEN + Comex-settle-4,113.80-gap-flag-34.9-retained) + BTC-82,321.35--1.15%-LIVE-SUB-83k-DAY-7 (flash-crash-recount-carry-~07:30Z-vintage + ETF-outflow-485M-consolidated-carry + liq-709M-carry + OI-68.13B-carry) + YEN-158.197-mid-158-carry (US+JP-Treasury-depts-both-'undervalued'-fxbus-08:27Z + roundtrip-158.50->157.83-UOB; NO-MOF-action) + USDBRL-5.0162-back-over-5-post-election-rally-interrupted (Valor-08:00BRZ-carry) + Merval-586-risk-carry (riotimes-00:54Z-Oct-7-close-basis-conflict-flag-stands) + KENYA-EBOLA-RESPONSE-ESCALATES-TEXTURE (Ruto-'enhanced-emergency-measures'-Xinhua + nation-'counties-on-high-alert'+Mombasa-screening-queues + Laikipia-US-facility-request; case-count-1-imported-carry-57-contacts) + TIGRAY-ERITREA-TEXTURE-HOLDS (BBC-'move-DEEP-in'-refresh-~10:40Z + AP-Hill-06:43Z + TheNational-'edge-closer-direct-conflict'-Oct-8 + Eritrea-dismisses-as-pretext = interstate-texture-not-rung) + EUROPE-MID-SESSION-SOFT-LIVE (GDAXI-24,889.86--0.85% + FCHI-7,735--0.44% + FTSE-10,448.61--0.09%-mixed vs slumped-open) + US-OPEN-13:30Z-POST-CYCLE + attribution NIL. Full-cycle quiet-checkpoint; alert_log #167.")

ALERT_CHANGE = {"none": ("NO-ALERT-CHANGES cycle (sustained-162nd; all 8 convergence scores unchanged: middle_east_war 200 / us_recession 200 / china_collapse 120 / japan_yen 120 / euro_crisis 120 / asian_contagion 100-DEVELOPING / crypto_collapse 40 / global_pandemic 40; KINETIC-BASIS 12 HELD: UKMTO-159-26-sweep-3rd-NIL; no new category-5 rungs in 17-op scan + quotes 26/26; US-IRAN-prep-carry-no-final-decision; EUROGROUP-soft-result-France-budget-demand)")}

HEADLINE = ("CAT-5-SUSTAINED-162ND-QUIET-CHECKPOINT + NO-ALERT-CHANGES + UKMTO-159-26-SWEEP-3RD-NIL + BRENT-105.02-CYCLE-HIGH-+4.8% + TNX-5.322-ABOVE-2007-PEAK + EUROGROUP-FRANCE-2027-BUDGET-DEMAND-11:36Z + KOREA-AI-AGENT-CYBER-DAY-4-WIDENS + PBOC-NO-DEVALUATION-PLEDGE + SILVER-SPOT-58.88-SUB-59 + BTC-82.3K-DAY-7 + ALERT-LOG-#167")

NOTES = {
 "energy": "BREAKING 1237Z Oct-8 c162 (window 0913Z->1237Z): BRENT-105.02-CYCLE-HIGH-INTRA (Yahoo-12:42:27Z-BZ=F-+4.81%-vs-settle-100.20 + CL-92.49-+4.77%; intra-12:30-105.02; Newsquawk-tops-104-morning + tipranks-104.22 + AA-hurricane-disruptions-carry; streak-~207h->100-NO-sub-100-print; THU-settle-de-esc-gate->2037Z-cycle) + heating-oil-rec-4.80-carry + dyed-diesel-carry + IEA-325M-released-accel-carry + Hormuz-claim-climax-vs-CENTCOM-20M-bbl-carry + transits-lowest-2-months-carry",
 "geopolitical": "BREAKING 1237Z Oct-8 c162: US-IRAN-ESCALATION-PREP-CARRY (BS-'prepares-Trump-yet-decide' + GulfNews-READY-MODE-05:39Z + TheNational-both-threads-Oct-8; mediator-exchange-continues; NO-wire-corrob-of-strikes-in-17-op-scan) + SAUDI-AIRPORT-DEATHS-3-CARRY + ERITREA-TIGRAY-CARRY (BBC-deep-in-refresh-~10:40Z + AP-Hill-06:43Z + TheNational-edge-closer-Oct-8; Eritrea-dismisses; interstate-TEXTURE-not-rung) + UKMTO-158-26-HELD-159-26-sweep-3rd-NIL + YEMEN-DAWN-OFFENSIVE-carry + JUNK-NONE-NEW",
 "middle_east": "BREAKING 1237Z Oct-8 c162: HORMUZ-CLAIM-CLIMAX-CARRY (Naqdi-closed-claim-vs-CENTCOM-20M-bbl-FLOWING-conflict-2src-logged) + US-IRAN-STRIKE-PREP-CARRY-no-final-decision + UKMTO-158-26-HELD-159-26-SWEEP-3RD-NIL (BBC-10:07Z-coverage-lag + monitor-lupd-10:19:59Z + mehr-09:30Z-echo) + SAUDI-KKIA+ABHA-DEATHS-3-CARRY + SAUDI-82-TARGETS-carry + Houthi-airline-warning-carry + ERITREA-TIGRAY-interstate-texture",
 "supply_chain": "BREAKING 1237Z Oct-8 c162: HORMUZ-TRANSITS-LOWEST-2-MONTHS-carry (reduced-but-flowing) + OMAN-coastal-route-crackdown-threat-carry + Bab-el-Mandeb-carry + Houthi-airline-warning-carry + IEA-release-ACCELERATION-carry + heating-oil-record-carry + dyed-diesel-little-relief-carry + Mombasa-screening-queues-Ebola-texture + food-security-no-new",
 "sov_debt": "BREAKING 1237Z Oct-8 c162: TNX-5.322-+0.85%-LIVE-ABOVE-2007-PEAK-5.296-NEW-MULTI-DECADE-EXTREME (5.25-gate-CLEARED; TYX-5.694-+0.58%) + UK30Y-6.036-28YR-ZONE-carry + FRENCH-SPREAD-143bp-texture-carry (AiEon-11:06CEST) + EUROGROUP-RESULT-LANDED (Euronext-Reuters-11:36Z-ministers-tell-FRANCE-PASS-2027-BUDGET-calm-markets) + Reuters-euro-yields-jump-07:28Z-carry + 10y-auction-5.300-since-NOV2000-carry + MOF-30Y-JGB-4.109-carry",
 "currency": "BREAKING 1237Z Oct-8 c162: DXY-102.286-above-102-DAY-7-carry + EUR-1.1192--0.55%-17-month-low-zone-carry + JPY-158.197-mid-158-carry (US+JP-depts-BOTH-undervalued-fxbus-08:27Z + roundtrip-158.50->157.83-UOB; NO-MOF-action) + BoJ-hike-bets-intervention-risks-carry + Takaichi-no-reflation + cap-debt-40trn + PBOC-NO-DEVALUATION-PLEDGE-FXStreet-10:21:14Z + USDBRL-5.0162-back-over-5",
 "gold": "BREAKING 1237Z Oct-8 c162: GOLD-4,148.70-GC-LIVE-12:42Z-+0.19%-vs-e-close-4,140.70 (Comex-settle-anchor-4,113.80-gap-flag-34.9-retained) + two-month-low-overnight->rebound (CNBC-TV18-01:49Z + Yahoo-10:53Z-'YEARLY-GAINS-EVAPORATE'-texture + morning-4,120-basis-variants-FLAG-open) + SILVER-COMEX-59.15--1.25%-LIVE + spot-58.88-SUB-59-FIRST-exa-12:43:26Z--3.30% (sub-60-day-2; registry-101.68Moz-gate-open) + $31bn-Q3-ETF-cant-hold-bid-carry",
 "crypto": "BREAKING 1237Z Oct-8 c162: BTC-82,321--1.15%-LIVE-12:42Z-SUB-83k-DAY-7-zone-82-83k-support-carries + flash-crash-recount-carry-~07:30Z-vintage + ETF-OUTFLOW-485M-CONSOLIDATED-CARRY (cointelegraph-07:30Z + coincamps-484.9M + cryptocompass-651M-longs-4.2%) + liq-709M-01:30Z-carry + OI-68.13B-carry; no-escalation-watch-held",
 "china": "BREAKING 1237Z Oct-8 c162: PBOC-NO-DEVALUATION-PLEDGE (FXStreet-10:21:14Z-'neither-need-nor-intention' + bne-yuan-steady-reopen) + PBOC-500B-reverse-repo + trn-level-day-inject + STATE-COUNCIL-WEIGHS-PROPERTY-SUPPORT (BeijingPost) + S&P-turnaround-texture-CNBC-09:25:35Z + 150B-capital-injection-bond-today + A-SHARE-DAY-0-CLOSE-CARRY (SH-3,811.90--0.79% + CHINEXT--3.15% + STAR50--4.82%) + PBOC-fix-6.7367-carry + EU-hybrid-import-cap + fuel-window-Oct-15-carries",
 "europe": "BREAKING 1237Z Oct-8 c162: EUROGROUP-RESULT-LANDED-IN-WINDOW (Euronext-Reuters-11:36Z-ministers+ECB-tell-FRANCE-PASS-2027-BUDGET-calm-markets; c160-pending-gate-RESOLVED-soft) + FRENCH-SPREAD-143bp-texture-carry + GDAXI-24,889.86--0.85%-LIVE + FCHI-7,735--0.44% + FTSE-10,448.61--0.09%-mixed vs slumped-open + Reuters-yields-jump-07:28Z-carry + UK30Y-6.036-28YR-carry + ECOFIN-Oct-9 + ECB-accounts-carry",
 "us_cycle": "BREAKING 1237Z Oct-8 c162: US-FUTURES-FALL-CARRY (Yahoo-08:05Z + FXStreet-08:32Z-yields-surge + WSJ-08:31Z-futures-fall-oil + finviz-AI-debt-thread) + TNX-5.322-above-2007-peak-LIVE + TYX-5.694 + VIX-15.70-+4.11%-LIVE + FOMC-minutes-ALL-19-hawkish-carry + 10y-auction-5.300-carry + CPI-Oct-14-gate + US-open-13:30Z-post-cycle",
 "fin_stability": "BREAKING 1237Z Oct-8 c162: KOREA-CYBER-DAY-4-AI-AGENT-IDENTIFIED-WIDENS (Nikkei-CrowdStrike-Anthropic-agent-Shinhan+KB + sedaily-Claude-Code-feeding + CHOSUNBIZ-11:10Z-tool-SPREADS-ACROSS-SERVERS-upd-11:34Z + DW-12:17Z-warns + JDA-FSS-IP-blocking-isnt-enough) + KS11-6,625.93--2.62%-NEW-LOW-carry + TNX-above-2007-peak + AI-DEBT-WAVE-carry (SpaceX-40BN + CNA-bonds-swamped + investing-AI-debt-deal-wave) + private-credit-carry + FDIC-no-7th-carry + VIX-15.70 + MILAN-sub-50k-carry",
}

STAMP_SIGS = ["fin_stability","sov_debt","energy","geopolitical","supply_chain","currency","gold","crypto","china","europe","us_cycle","middle_east"]

def md5(p):
    return hashlib.md5(open(p,'rb').read()).hexdigest().upper()
def load(p):
    return json.load(open(p, encoding='utf-8'))

sig = load(SIG); mac = load(MACRO)
# ---------- guards: c161 state ----------
assert sig['metadata']['last_update'] == "2026-10-08T09:13:00+00:00", "signals last_update not c161"
assert mac['scan_id'] == "blackwatch-2026-10-08-0913", "macro scan_id not c161"
assert len(mac['alert_log']) == 166, "alert_log != 166"
assert os.path.exists(ART161), "c161 artifact missing"
assert set(sig['signals'].keys()) == set(["fin_stability","liquidity","sov_debt","energy","geopolitical","cyber","supply_chain","food_security","climate","social_cohesion","inst_trust","ai_acceleration","currency","gold","crypto","china","europe","us_cycle","middle_east","public_sentiment"]), "signal keyset drifted"
pre_sig_size = os.path.getsize(SIG); pre_mac_size = os.path.getsize(MACRO)
untouched = {k: json.dumps(sig['signals'][k], sort_keys=True) for k in sig['signals'] if k not in STAMP_SIGS}
pre_al166 = json.dumps(mac['alert_log'][165], sort_keys=True, ensure_ascii=False)

# ---------- apply: macro c162 ----------
mac['last_updated'] = LAST
mac['scan_id'] = SCAN
mac['highest_alert'] = ("middle_east_war 200 (SUSTAINED CAT-5, month 8+; 162nd consecutive scan, window Oct-8 0913Z -> Oct-8 1237Z IN-SLOT; NO-ALERT-CHANGES (sustained-162nd; KINETIC-BASIS 12 HELD: UKMTO-registry-latest-stays-158-26, 159-26-sweep-3rd-NIL) + THIS-CYCLE (QUIET-CHECKPOINT-CARRY: no new rungs in 17-op/12-domain scan + quotes 26/26 12:42:27Z; BRENT-105.02-CYCLE-HIGH-+4.81%-streak-~207h + TNX-5.322-ABOVE-2007-PEAK-5.296 + TYX-5.694 + EUROGROUP-RESULT-LANDED-11:36Z-France-2027-budget-demand + KOREA-CYBER-DAY-4-AI-agent-identified-CrowdStrike-Anthropic + PBOC-no-devaluation-pledge-10:21Z + 500B-reverse-repo + silver-spot-58.88-sub-59-first + gold-4,148.7-rebound-basis-flags + BTC-82,321-sub-83k-day-7 + USDBRL-5.0162 + Kenya-Ruto-emergency-measures-texture + Tigray-Eritrea-texture-holds; US-open-13:30Z-post-cycle; attribution NIL; alert_log #167)")
mac['alert_log'].append({"timestamp": LAST, "event": T_MAIN_162})
assert len(mac['alert_log']) == 167
mac['active_count'] = 5; mac['developing_count'] = 2; mac['watch_count'] = 1; mac['clear_count'] = 0

# ---------- apply: signals c162 ----------
sig['metadata']['last_update'] = LAST
tb = sig['metadata']['threshold_breach']
sig['metadata']['threshold_breach'] = tb + (" || breaking scan 12:37Z in-slot (cycle-162 window 0913Z->1237Z; 17 query ops/12 domains + quotes 26/26 + 7/7-intra 12:42:27Z; THU settle de-esc gate unchanged -> 2037Z cycle) + quiet-checkpoint: NO-new-breach-class in 17-op scan; Brent-105.02-cycle-high-+4.81% streak-~207h no-sub-100 + TNX-5.322-ABOVE-2007-peak-5.296 (TYX-5.694) + Europe-soft-live (GDAXI--0.85%) + Korea-AI-agent-cyber-day-4 + PBOC-no-devaluation-pledge + silver-spot-58.88-sub-59-first + BTC-82.3k-day-7; c161-alias-bug-fixed (canon signals.json resynced post-finalize); alert_log #167")
for k in STAMP_SIGS:
    o = sig['signals'][k]
    o['note'] = NOTES[k][:980]
    o['timestamp'] = LAST

# ---------- artifacts + aliases ----------
art = {"scan_id": SCAN, "scan_type": "breaking_event_4h", "timestamp": LAST,
       "execution_note": T_MAIN_162, "alert_changes": ALERT_CHANGE,
       "cycle_headline": HEADLINE,
       "quotes_basis": "Yahoo 26/26 + 7/7-intra live-quotes-2026-10-08-1237.json fetched 12:42:27Z (in-slot fetch; threshold scanner value-ownership per c161-carried convention applies to its own runs)"}
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
assert len(chk['signals']) == 20 and len(chkm['alert_log']) == 167
for k,v in untouched.items():
    assert json.dumps(chk['signals'][k], sort_keys=True) == v, f'untouched drift {k}'
assert json.dumps(chkm['alert_log'][165], sort_keys=True, ensure_ascii=False) == pre_al166, 'old alert mutated'
shutil.copyfile(tmp_sig, SIG); shutil.copyfile(tmp_macro, MACRO); os.remove(tmp_sig); os.remove(tmp_macro)
print('SIGNALS stamped 12 (canon written) + macro alert_log #167')
print('post-sig md5:', md5(SIG)[:8], '(pre', md5(SIG)[:8] if False else 'guards passed', ')')

# ---------- canon alias fix (c161 restore-script bug): copy AFTER finalize ----------
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
    shutil.copyfile(ART, os.path.join(tgt, f'breaking-event-2026-10-08-1237.json'))
    shutil.copyfile(ART, os.path.join(tgt, 'breaking-event-latest.json'))
    shutil.copyfile(ART, os.path.join(tgt, 'breaking-events-latest.json'))
    checks += [(name+'/'+fn, md5(os.path.join(tgt, fn)), h) for fn, h in
               [('blackwatch-signals.json', sig_h), ('signals.json', sig_h), ('blackwatch-macro-event.json', mac_h),
                ('breaking-event-2026-10-08-1237.json', art_h), ('breaking-event-latest.json', art_h), ('breaking-events-latest.json', art_h)]]
    sc = os.path.join(tgt, 'blackwatch-scans')
    if os.path.isdir(sc):
        for src in (ART, ART161, LQ, __file__):
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
msg = ("BlackWatch breaking event scan 2026-10-08-1237 (cycle 162, in-slot window 0913Z->1237Z): CAT-5 SUSTAINED 162nd + NO-ALERT-CHANGES (8 scores carried: middle_east_war 200 / us_recession 200 / china_collapse 120 / japan_yen 120 / euro_crisis 120 / asian_contagion 100-DEVELOPING / crypto_collapse 40 / global_pandemic 40; UKMTO-158-26-HELD, 159-26-sweep-3rd-NIL) + alert_log #167. "
       "Quotes 26/26 + 7/7-intra 12:42:27Z (in-slot fetch). Texture: BRENT-105.02-fresh-cycle-high +4.81% vs settle 100.20 (CL 92.49 +4.77%; streak ~207h >100, no sub-100; THU settle de-esc gate -> 2037Z cycle) + TNX-5.322-ABOVE-2007-peak-5.296 (TYX 5.694) + EUROGROUP-RESULT-LANDED 11:36Z (ministers+ECB to tell France pass 2027 budget) + KOREA-CYBER-DAY-4-AI-agent-identified (CrowdStrike/Anthropic-tool; CHOSUNBIZ tool-spreads-across-servers 11:10Z; DW 12:17Z) + PBOC-no-devaluation-pledge 10:21Z + 500B reverse repo + State-Council-weighs-property-support + silver-spot-58.88-sub-59-first (sub-60 day-2) + gold-4,148.7-rebound-basis-flags + BTC-82,321-sub-83k-day-7 + USDBRL-5.0162-back-over-5 + Kenya-Ruto-emergency-measures-Ebola-texture + Tigray-Eritrea-texture-holds. "
       f"4-target sync MD5-verified (workspace canon + vueroo-portal-scan repo + vueroo-portal live + D-Lumina) + dated artifacts + hygiene mirror; c161 canon-alias signals.json bug FIXED (post-finalize copy, md5-verified). Vercel auto-deploy.")
cmg = os.path.join(CANON, '..', 'scripts', 'blackwatch-2026-10-08-1237-commit-msg.txt')
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