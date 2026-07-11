#!/usr/bin/env python3
"""
Comprehensive statistical analysis of Irish Lotto jackpot wins (2011-2026).
Parses WINS_DATA from irish-lotto-wins.html and outputs wins-analysis.json.
"""

import json
import re
import os
from datetime import datetime, date
from collections import Counter, defaultdict
from itertools import combinations
import statistics
import math

HTML_PATH = os.path.join(os.path.dirname(__file__), "irish-lotto-wins.html")
OUTPUT_PATH = os.path.join(os.path.dirname(__file__), "wins-analysis.json")

def extract_wins_data(html_text):
    """Extract WINS_DATA JS object from HTML and parse it as JSON."""
    # Find the WINS_DATA block
    match = re.search(r'const WINS_DATA\s*=\s*(\{.*?\});', html_text, re.DOTALL)
    if not match:
        raise ValueError("Could not find WINS_DATA in HTML")
    raw = match.group(1)
    # The data is already valid JSON (keys are quoted, values are JSON)
    data = json.loads(raw)
    return data

def get_all_wins(data):
    """Get all wins as a sorted list (by date ascending)."""
    wins = data.get("all", [])
    # Sort by date ascending
    wins_sorted = sorted(wins, key=lambda w: w["date"])
    return wins_sorted

def analyze_number_frequency(wins):
    """Frequency of each number 1-47 across all wins (main + bonus)."""
    main_freq = Counter()
    bonus_freq = Counter()
    all_freq = Counter()

    for w in wins:
        for n in w["nums"]:
            main_freq[n] += 1
            all_freq[n] += 1
        bonus_freq[w["bonus"]] += 1
        all_freq[w["bonus"]] += 1

    total_main = sum(main_freq.values())  # 192 * 6 = 1152
    total_bonus = sum(bonus_freq.values())  # 192

    freq_list = []
    for n in range(1, 48):
        mf = main_freq.get(n, 0)
        bf = bonus_freq.get(n, 0)
        af = all_freq.get(n, 0)
        freq_list.append({
            "number": n,
            "main_count": mf,
            "bonus_count": bf,
            "total_count": af,
            "main_pct": round(mf / total_main * 100, 2),
            "total_pct": round(af / (total_main + total_bonus) * 100, 2)
        })

    sorted_by_total = sorted(freq_list, key=lambda x: x["total_count"], reverse=True)
    hot = sorted_by_total[:15]
    cold = sorted_by_total[-15:]

    return {
        "total_main_numbers": total_main,
        "total_bonus_numbers": total_bonus,
        "total_all_numbers": total_main + total_bonus,
        "frequency_all": freq_list,
        "hot_numbers": hot,
        "cold_numbers": cold,
    }

def analyze_frequency_by_position(wins):
    """Frequency by position (sorted order: 1st-6th)."""
    position_stats = {}
    for pos in range(6):  # 0-indexed
        values = []
        for w in wins:
            sorted_nums = sorted(w["nums"])
            values.append(sorted_nums[pos])
        position_stats[f"position_{pos+1}"] = {
            "min": min(values),
            "max": max(values),
            "mean": round(statistics.mean(values), 2),
            "median": statistics.median(values),
            "stdev": round(statistics.stdev(values), 2),
            "most_common": Counter(values).most_common(5),
        }
    return position_stats

def analyze_consecutive_patterns(wins):
    """Consecutive number patterns in draws."""
    draws_with_pair = 0
    draws_with_run3 = 0
    draws_with_two_pairs = 0
    total_consecutive_pairs = 0
    draws_with_run4plus = 0

    for w in wins:
        sorted_nums = sorted(w["nums"])
        pairs = 0
        runs = []
        current_run = 1
        for i in range(1, len(sorted_nums)):
            if sorted_nums[i] == sorted_nums[i-1] + 1:
                current_run += 1
            else:
                if current_run >= 2:
                    runs.append(current_run)
                current_run = 1
        if current_run >= 2:
            runs.append(current_run)

        if any(r >= 2 for r in runs):
            draws_with_pair += 1
        if any(r >= 3 for r in runs):
            draws_with_run3 += 1
        if any(r >= 4 for r in runs):
            draws_with_run4plus += 1

        # Count separate consecutive pairs (runs of exactly 2, or pairs within longer runs)
        # A "pair" is two consecutive numbers. A run of 3 has 2 pairs, run of 4 has 3, etc.
        pair_count = sum(r - 1 for r in runs if r >= 2)
        total_consecutive_pairs += pair_count

        # Two separate pairs means at least 2 distinct runs of >= 2
        if len([r for r in runs if r >= 2]) >= 2:
            draws_with_two_pairs += 1

    avg_pairs = total_consecutive_pairs / len(wins) if wins else 0

    return {
        "draws_with_at_least_one_consecutive_pair": draws_with_pair,
        "draws_with_run_of_3_plus": draws_with_run3,
        "draws_with_run_of_4_plus": draws_with_run4plus,
        "draws_with_two_separate_consecutive_pairs": draws_with_two_pairs,
        "average_consecutive_pairs_per_draw": round(avg_pairs, 3),
        "percentage_with_consecutive_pair": round(draws_with_pair / len(wins) * 100, 1),
    }

def analyze_carry_over(wins):
    """For each consecutive pair of winning draws, how many numbers are shared."""
    carry_overs = []
    carry_over_numbers = Counter()

    for i in range(1, len(wins)):
        prev_nums = set(wins[i-1]["nums"])
        curr_nums = set(wins[i]["nums"])
        shared = prev_nums & curr_nums
        carry_overs.append(len(shared))
        for n in shared:
            carry_over_numbers[n] += 1

    carry_dist = Counter(carry_overs)

    return {
        "total_consecutive_draw_pairs": len(carry_overs),
        "average_carry_over": round(statistics.mean(carry_overs), 3),
        "median_carry_over": statistics.median(carry_overs),
        "stdev_carry_over": round(statistics.stdev(carry_overs), 3) if len(carry_overs) > 1 else 0,
        "carry_over_distribution": {str(k): carry_dist.get(k, 0) for k in range(7)},
        "most_carry_over_numbers": carry_over_numbers.most_common(15),
    }

def analyze_gaps(wins):
    """Gap analysis (time between wins)."""
    gaps = []
    gap_details = []

    for i in range(1, len(wins)):
        d1 = datetime.strptime(wins[i-1]["date"], "%Y-%m-%d").date()
        d2 = datetime.strptime(wins[i]["date"], "%Y-%m-%d").date()
        gap_days = (d2 - d1).days
        gaps.append(gap_days)
        gap_details.append({
            "from": wins[i-1]["date"],
            "to": wins[i]["date"],
            "gap_days": gap_days,
            "prev_jackpot": wins[i-1]["jackpot"],
            "next_jackpot": wins[i]["jackpot"],
        })

    # Gaps by year (average)
    gaps_by_year = defaultdict(list)
    for i in range(1, len(wins)):
        year = wins[i]["date"][:4]
        d1 = datetime.strptime(wins[i-1]["date"], "%Y-%m-%d").date()
        d2 = datetime.strptime(wins[i]["date"], "%Y-%m-%d").date()
        gaps_by_year[year].append((d2 - d1).days)

    # Gap histogram
    hist_bins = {"0-7": 0, "8-14": 0, "15-30": 0, "31-60": 0, "60+": 0}
    for g in gaps:
        if g <= 7:
            hist_bins["0-7"] += 1
        elif g <= 14:
            hist_bins["8-14"] += 1
        elif g <= 30:
            hist_bins["15-30"] += 1
        elif g <= 60:
            hist_bins["31-60"] += 1
        else:
            hist_bins["60+"] += 1

    # Day of week analysis
    day_counts = Counter(w["day"] for w in wins)
    day_jackpots = defaultdict(list)
    for w in wins:
        day_jackpots[w["day"]].append(w["jackpot"])

    return {
        "total_gaps": len(gaps),
        "average_gap_days": round(statistics.mean(gaps), 1),
        "median_gap_days": statistics.median(gaps),
        "shortest_gap_days": min(gaps),
        "longest_gap_days": max(gaps),
        "stdev_gap_days": round(statistics.stdev(gaps), 1) if len(gaps) > 1 else 0,
        "gaps_by_year": {y: round(statistics.mean(g), 1) for y, g in sorted(gaps_by_year.items())},
        "gap_histogram": hist_bins,
        "wins_by_day_of_week": {d: day_counts.get(d, 0) for d in ["Wed", "Sat", "Thu", "Tue", "Mon", "Fri", "Sun"]},
        "avg_jackpot_by_day": {d: round(statistics.mean(j), 0) for d, j in day_jackpots.items()},
    }

def analyze_jackpots(wins):
    """Jackpot analysis."""
    jackpots = [w["jackpot"] for w in wins]
    total_won = sum(jackpots)

    # By year
    by_year = defaultdict(list)
    for w in wins:
        year = w["date"][:4]
        by_year[year].append(w["jackpot"])

    avg_by_year = {}
    for y in sorted(by_year.keys()):
        jlist = by_year[y]
        avg_by_year[y] = {
            "wins": len(jlist),
            "avg_jackpot": round(statistics.mean(jlist), 0),
            "max_jackpot": max(jlist),
            "min_jackpot": min(jlist),
            "total_won": sum(jlist),
        }

    # Correlation between gap length and jackpot size
    gaps_and_jackpots = []
    for i in range(1, len(wins)):
        d1 = datetime.strptime(wins[i-1]["date"], "%Y-%m-%d").date()
        d2 = datetime.strptime(wins[i]["date"], "%Y-%m-%d").date()
        gap_days = (d2 - d1).days
        next_jp = wins[i]["jackpot"]
        gaps_and_jackpots.append((gap_days, next_jp))

    gap_jp_corr = compute_correlation([g[0] for g in gaps_and_jackpots],
                                       [g[1] for g in gaps_and_jackpots])

    # Correlation between week number and jackpot
    weeks = [w["week"] for w in wins]
    week_jp_corr = compute_correlation(weeks, jackpots)

    # Distribution buckets
    dist = {"2M_min": 0, "2-5M": 0, "5-8M": 0, "8-12M": 0, "12M+": 0}
    for j in jackpots:
        if j < 2_500_000:
            dist["2M_min"] += 1
        elif j < 5_000_000:
            dist["2-5M"] += 1
        elif j < 8_000_000:
            dist["5-8M"] += 1
        elif j < 12_000_000:
            dist["8-12M"] += 1
        else:
            dist["12M+"] += 1

    # Biggest jackpots and their number patterns
    biggest = sorted(wins, key=lambda w: w["jackpot"], reverse=True)[:10]
    biggest_info = [{
        "date": w["date"],
        "jackpot": w["jackpot"],
        "nums": w["nums"],
        "bonus": w["bonus"],
        "day": w["day"],
        "week": w["week"],
        "sum_of_nums": sum(w["nums"]),
        "has_consecutive": any(w["nums"][i+1] == w["nums"][i] + 1 for i in range(len(w["nums"])-1) if w["nums"] == sorted(w["nums"])),
    } for w in biggest]

    return {
        "total_won": total_won,
        "average_jackpot": round(statistics.mean(jackpots), 0),
        "median_jackpot": statistics.median(jackpots),
        "stdev_jackpot": round(statistics.stdev(jackpots), 0),
        "min_jackpot": min(jackpots),
        "max_jackpot": max(jackpots),
        "avg_jackpot_by_year": avg_by_year,
        "gap_vs_jackpot_correlation": round(gap_jp_corr, 3),
        "week_vs_jackpot_correlation": round(week_jp_corr, 3),
        "jackpot_distribution": dist,
        "biggest_jackpots": biggest_info,
    }

def compute_correlation(x, y):
    """Pearson correlation coefficient."""
    n = len(x)
    if n < 2:
        return 0
    mean_x = sum(x) / n
    mean_y = sum(y) / n
    num = sum((xi - mean_x) * (yi - mean_y) for xi, yi in zip(x, y))
    den_x = math.sqrt(sum((xi - mean_x) ** 2 for xi in x))
    den_y = math.sqrt(sum((yi - mean_y) ** 2 for yi in y))
    if den_x == 0 or den_y == 0:
        return 0
    return num / (den_x * den_y)

def analyze_seasonality(wins):
    """Wins by month, week, day, season."""
    # By month
    month_counts = Counter()
    month_jackpots = defaultdict(list)
    for w in wins:
        month = int(w["date"][5:7])
        month_counts[month] += 1
        month_jackpots[month].append(w["jackpot"])

    month_data = {}
    month_names = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    for m in range(1, 13):
        month_data[month_names[m]] = {
            "month_num": m,
            "wins": month_counts.get(m, 0),
            "avg_jackpot": round(statistics.mean(month_jackpots[m]), 0) if month_jackpots[m] else 0,
        }

    # By week number
    week_counts = Counter(w["week"] for w in wins)
    week_jackpots = defaultdict(list)
    for w in wins:
        week_jackpots[w["week"]].append(w["jackpot"])

    week_data = {}
    for wk in range(1, 53):
        if wk in week_counts:
            week_data[wk] = {
                "wins": week_counts[wk],
                "avg_jackpot": round(statistics.mean(week_jackpots[wk]), 0),
            }

    # By day of week
    day_counts = Counter(w["day"] for w in wins)
    day_jackpots = defaultdict(list)
    for w in wins:
        day_jackpots[w["day"]].append(w["jackpot"])

    day_data = {}
    for d in ["Wed", "Sat", "Thu", "Tue", "Mon", "Fri", "Sun"]:
        if d in day_counts:
            day_data[d] = {
                "wins": day_counts[d],
                "avg_jackpot": round(statistics.mean(day_jackpots[d]), 0),
                "pct_of_total": round(day_counts[d] / len(wins) * 100, 1),
            }

    # Seasonal (quarters)
    quarter_counts = {1: 0, 2: 0, 3: 0, 4: 0}
    quarter_jackpots = {1: [], 2: [], 3: [], 4: []}
    for w in wins:
        month = int(w["date"][5:7])
        q = (month - 1) // 3 + 1
        quarter_counts[q] += 1
        quarter_jackpots[q].append(w["jackpot"])

    quarter_data = {}
    quarter_names = {1: "Q1 (Jan-Mar)", 2: "Q2 (Apr-Jun)", 3: "Q3 (Jul-Sep)", 4: "Q4 (Oct-Dec)"}
    for q in range(1, 5):
        quarter_data[quarter_names[q]] = {
            "wins": quarter_counts[q],
            "avg_jackpot": round(statistics.mean(quarter_jackpots[q]), 0) if quarter_jackpots[q] else 0,
            "pct_of_total": round(quarter_counts[q] / len(wins) * 100, 1),
        }

    # Week clusters (weeks with 3+ wins)
    week_clusters = {str(wk): info for wk, info in week_data.items() if info["wins"] >= 3}

    return {
        "wins_by_month": month_data,
        "wins_by_week": week_data,
        "week_clusters_3plus": week_clusters,
        "wins_by_day_of_week": day_data,
        "seasonal_quarters": quarter_data,
    }

def analyze_number_groupings(wins):
    """Low/Mid/High, Even/Odd, Sum analysis."""
    low_mid_high = []
    even_odd = []
    sums = []

    for w in wins:
        nums = w["nums"]
        low = sum(1 for n in nums if n <= 16)
        mid = sum(1 for n in nums if 17 <= n <= 32)
        high = sum(1 for n in nums if n >= 33)
        low_mid_high.append((low, mid, high))

        evens = sum(1 for n in nums if n % 2 == 0)
        odds = 6 - evens
        even_odd.append((evens, odds))

        sums.append(sum(nums))

    # LMH distribution
    lmh_dist = Counter(low_mid_high)
    lmh_formatted = {f"{k[0]}L-{k[1]}M-{k[2]}H": v for k, v in lmh_dist.most_common()}

    # Even/Odd distribution
    eo_dist = Counter(even_odd)
    eo_formatted = {f"{k[0]}E-{k[1]}O": v for k, v in eo_dist.most_common()}

    # Sum analysis
    sum_bins = Counter()
    for s in sums:
        if s < 100:
            sum_bins["<100"] += 1
        elif s < 120:
            sum_bins["100-119"] += 1
        elif s < 140:
            sum_bins["120-139"] += 1
        elif s < 160:
            sum_bins["140-159"] += 1
        elif s < 180:
            sum_bins["160-179"] += 1
        elif s < 200:
            sum_bins["180-199"] += 1
        else:
            sum_bins["200+"] += 1

    return {
        "low_mid_high": {
            "definition": "Low=1-16, Mid=17-32, High=33-47",
            "distribution": lmh_formatted,
            "most_common": lmh_dist.most_common(10),
            "avg_low": round(statistics.mean([x[0] for x in low_mid_high]), 2),
            "avg_mid": round(statistics.mean([x[1] for x in low_mid_high]), 2),
            "avg_high": round(statistics.mean([x[2] for x in low_mid_high]), 2),
        },
        "even_odd": {
            "distribution": eo_formatted,
            "most_common": eo_dist.most_common(10),
            "avg_even": round(statistics.mean([x[0] for x in even_odd]), 2),
            "avg_odd": round(statistics.mean([x[1] for x in even_odd]), 2),
        },
        "sum_analysis": {
            "min": min(sums),
            "max": max(sums),
            "mean": round(statistics.mean(sums), 2),
            "median": statistics.median(sums),
            "stdev": round(statistics.stdev(sums), 2),
            "sum_range_distribution": dict(sum_bins),
            "most_common_sum_range": sum_bins.most_common(1)[0] if sum_bins else None,
        },
    }

def analyze_bonus_ball(wins):
    """Bonus ball frequency and correlation with main numbers."""
    bonus_freq = Counter(w["bonus"] for w in wins)
    freq_list = [{"number": n, "count": bonus_freq.get(n, 0)} for n in range(1, 48)]
    freq_list.sort(key=lambda x: x["count"], reverse=True)

    # Does bonus correlate with main numbers?
    same_decade = 0
    same_parity = 0
    bonus_in_main_range_low = 0  # bonus in 1-16
    bonus_in_main_range_mid = 0  # bonus in 17-32
    bonus_in_main_range_high = 0  # bonus in 33-47

    for w in wins:
        main = w["nums"]
        bonus = w["bonus"]
        main_decades = set(n // 10 for n in main)
        bonus_decade = bonus // 10
        if bonus_decade in main_decades:
            same_decade += 1
        if bonus % 2 in set(n % 2 for n in main):
            same_parity += 1
        if bonus <= 16:
            bonus_in_main_range_low += 1
        elif bonus <= 32:
            bonus_in_main_range_mid += 1
        else:
            bonus_in_main_range_high += 1

    total = len(wins)
    return {
        "bonus_frequency": freq_list,
        "top_10_bonus": freq_list[:10],
        "bottom_10_bonus": freq_list[-10:],
        "same_decade_as_main_pct": round(same_decade / total * 100, 1),
        "same_parity_as_main_pct": round(same_parity / total * 100, 1),
        "bonus_range_distribution": {
            "low_1_16": bonus_in_main_range_low,
            "mid_17_32": bonus_in_main_range_mid,
            "high_33_47": bonus_in_main_range_high,
        },
    }

def analyze_synergy(wins):
    """Pairs and triples that appear together most frequently."""
    pair_counts = Counter()
    triple_counts = Counter()

    for w in wins:
        nums = w["nums"]
        for pair in combinations(sorted(nums), 2):
            pair_counts[pair] += 1
        for triple in combinations(sorted(nums), 3):
            triple_counts[triple] += 1

    top_pairs = [{"pair": list(p), "count": c} for p, c in pair_counts.most_common(20)]
    top_triples = [{"triple": list(t), "count": c} for t, c in triple_counts.most_common(10)]

    # PMI (Pointwise Mutual Information) for pairs
    # Expected frequency of a pair = (freq_a / total_draws) * (freq_b / total_draws) * total_draws
    # PMI = log(observed / expected)
    total_draws = len(wins)
    main_freq = Counter()
    for w in wins:
        for n in w["nums"]:
            main_freq[n] += 1

    pmi_list = []
    for pair, count in pair_counts.items():
        a, b = pair
        expected = (main_freq[a] / total_draws) * (main_freq[b] / total_draws) * total_draws
        if expected > 0 and count > 0:
            pmi = math.log(count / expected)
            pmi_list.append({"pair": list(pair), "count": count, "expected": round(expected, 2), "pmi": round(pmi, 3)})

    pmi_list.sort(key=lambda x: x["pmi"], reverse=True)
    top_pmi = pmi_list[:20]
    # Also show most negative PMI (pairs that appear together LESS than expected)
    bottom_pmi = sorted(pmi_list, key=lambda x: x["pmi"])[:10]

    return {
        "total_unique_pairs_observed": len(pair_counts),
        "top_20_pairs": top_pairs,
        "top_10_triples": top_triples,
        "top_20_pmi_pairs": top_pmi,
        "bottom_10_pmi_pairs": bottom_pmi,
    }

def main():
    # Read HTML
    with open(HTML_PATH, "r", encoding="utf-8") as f:
        html_text = f.read()

    # Extract data
    data = extract_wins_data(html_text)
    wins = get_all_wins(data)

    print(f"Total wins extracted: {len(wins)}")
    print(f"Date range: {wins[0]['date']} to {wins[-1]['date']}")

    # Run all analyses
    analysis = {
        "metadata": {
            "total_wins": len(wins),
            "date_range": f"{wins[0]['date']} to {wins[-1]['date']}",
            "number_range": "1-47",
            "main_numbers_per_draw": 6,
            "bonus_per_draw": 1,
            "generated": datetime.now().isoformat(),
        },
        "number_analysis": analyze_number_frequency(wins),
        "frequency_by_position": analyze_frequency_by_position(wins),
        "consecutive_patterns": analyze_consecutive_patterns(wins),
        "carry_over_analysis": analyze_carry_over(wins),
        "gap_analysis": analyze_gaps(wins),
        "jackpot_analysis": analyze_jackpots(wins),
        "seasonality": analyze_seasonality(wins),
        "number_groupings": analyze_number_groupings(wins),
        "bonus_ball_analysis": analyze_bonus_ball(wins),
        "synergy_matrix": analyze_synergy(wins),
    }

    # Save JSON
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(analysis, f, indent=2, ensure_ascii=False)

    print(f"\n[OK] Analysis saved to: {OUTPUT_PATH}")
    print(f"File size: {os.path.getsize(OUTPUT_PATH):,} bytes")

    # Print summary
    print("\n" + "=" * 60)
    print("KEY FINDINGS SUMMARY")
    print("=" * 60)

    na = analysis["number_analysis"]
    print(f"\nNUMBER FREQUENCY:")
    print(f"  Hot numbers (top 5): {[(n['number'], n['total_count']) for n in na['hot_numbers'][:5]]}")
    print(f"  Cold numbers (bottom 5): {[(n['number'], n['total_count']) for n in na['cold_numbers'][-5:]]}")

    cp = analysis["consecutive_patterns"]
    print(f"\nCONSECUTIVE PATTERNS:")
    print(f"  Draws with consecutive pair: {cp['draws_with_at_least_one_consecutive_pair']} ({cp['percentage_with_consecutive_pair']}%)")
    print(f"  Draws with run of 3+: {cp['draws_with_run_of_3_plus']}")
    print(f"  Avg consecutive pairs/draw: {cp['average_consecutive_pairs_per_draw']}")

    co = analysis["carry_over_analysis"]
    print(f"\nCARRY-OVER ANALYSIS:")
    print(f"  Average carry-over: {co['average_carry_over']} numbers")
    print(f"  Distribution: {co['carry_over_distribution']}")

    ga = analysis["gap_analysis"]
    print(f"\nGAP ANALYSIS:")
    print(f"  Average gap: {ga['average_gap_days']} days")
    print(f"  Shortest: {ga['shortest_gap_days']} days | Longest: {ga['longest_gap_days']} days")
    print(f"  Histogram: {ga['gap_histogram']}")
    print(f"  Wed wins: {ga['wins_by_day_of_week'].get('Wed', 0)} | Sat wins: {ga['wins_by_day_of_week'].get('Sat', 0)}")

    ja = analysis["jackpot_analysis"]
    print(f"\nJACKPOT ANALYSIS:")
    print(f"  Average: €{ja['average_jackpot']:,} | Median: €{ja['median_jackpot']:,}")
    print(f"  Min: €{ja['min_jackpot']:,} | Max: €{ja['max_jackpot']:,}")
    print(f"  Gap vs Jackpot correlation: {ja['gap_vs_jackpot_correlation']}")
    print(f"  Week vs Jackpot correlation: {ja['week_vs_jackpot_correlation']}")
    print(f"  Distribution: {ja['jackpot_distribution']}")

    se = analysis["seasonality"]
    print(f"\nSEASONALITY:")
    print(f"  Wed wins: {se['wins_by_day_of_week'].get('Wed', {}).get('wins', 0)} | Sat wins: {se['wins_by_day_of_week'].get('Sat', {}).get('wins', 0)}")
    print(f"  Q1: {se['seasonal_quarters']['Q1 (Jan-Mar)']['wins']} | Q2: {se['seasonal_quarters']['Q2 (Apr-Jun)']['wins']} | Q3: {se['seasonal_quarters']['Q3 (Jul-Sep)']['wins']} | Q4: {se['seasonal_quarters']['Q4 (Oct-Dec)']['wins']}")

    ng = analysis["number_groupings"]
    print(f"\nNUMBER GROUPINGS:")
    print(f"  Sum: min={ng['sum_analysis']['min']}, max={ng['sum_analysis']['max']}, mean={ng['sum_analysis']['mean']}, median={ng['sum_analysis']['median']}")
    print(f"  Most common sum range: {ng['sum_analysis']['most_common_sum_range']}")
    print(f"  Even/Odd most common: {ng['even_odd']['most_common'][:3]}")
    print(f"  L/M/H most common: {ng['low_mid_high']['most_common'][:3]}")

    bb = analysis["bonus_ball_analysis"]
    print(f"\nBONUS BALL:")
    print(f"  Top 5: {[(b['number'], b['count']) for b in bb['top_10_bonus'][:5]]}")
    print(f"  Same decade as main: {bb['same_decade_as_main_pct']}%")
    print(f"  Same parity as main: {bb['same_parity_as_main_pct']}%")

    sy = analysis["synergy_matrix"]
    print(f"\nSYNERGY MATRIX:")
    print(f"  Top pair: {sy['top_20_pairs'][0]}")
    print(f"  Top triple: {sy['top_10_triples'][0]}")
    print(f"  Highest PMI pair: {sy['top_20_pmi_pairs'][0]['pair']} (PMI={sy['top_20_pmi_pairs'][0]['pmi']})")

    print("\n" + "=" * 60)
    print("DONE")

if __name__ == "__main__":
    main()