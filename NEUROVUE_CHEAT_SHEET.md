# NeuroVue Dashboard - CHEAT SHEET
## Data Schema & Rendering Debugging Guide

**Last Updated:** 2026-03-26 18:20 UTC  
**Incident:** Revenue & Epidemiology showing "--" or blank after syntax fix

---

## 🚨 INCIDENT LOG

### What Happened
- Dashboard stuck on loading screen (SyntaxError from malformed if/else block)
- After fixing syntax: Revenue & Epidemiology showed "--" (no data)
- Root cause: Data schema mismatch between code expectations and actual JSON

### The Mismatches

| Section | Code Expected | Actual JSON | File |
|---------|--------------|-------------|------|
| Revenue | `revenue-summary.json` | `revenue-historical.json` (different structure) | Data loader |
| Epidemiology | `summary['2024'].annualStrokes.value` | `summary.annualStrokes.value` (flat, not nested) | Processing function |

### Fix Applied
1. Changed data loader from `revenue-summary.json` → `revenue-historical.json`
2. Fixed `processEpidemiologyData()` to use flat structure: `summary.annualStrokes.value`
3. Fixed `renderEpidemiologyDashboard()` to use `summary.treatmentAccess2024` not `global2024.treatmentAccess`

---

## 🔧 TOMORROW'S DIFFERENT STEPS

### 1. ALWAYS Verify Data Schema First
```javascript
// Add this to data-loader.js when debugging:
console.log('Data structure check:', {
  hasGlobal: !!data.global,
  hasSummary: !!data.global?.summary,
  has2024: !!data.global?.summary?.['2024'],
  sampleKeys: data.global?.summary ? Object.keys(data.global.summary) : 'N/A'
});
```

### 2. Check JSON Structure Before Coding
```bash
# Always inspect actual JSON structure:
curl -s URL | jq '.global.summary | keys'
# NOT: Assume structure from memory or docs
```

### 3. Defensive Rendering Pattern
Add to EVERY render function:
```javascript
function renderSection() {
  if (!appData || !appData.sectionName) {
    console.error('Missing data for section:', appData);
    showError('Data not loaded. Check console for schema mismatch.');
    return;
  }
  
  // Schema validation
  const required = ['field1', 'field2'];
  const missing = required.filter(f => !appData.sectionName[f]);
  if (missing.length) {
    console.error('Schema mismatch. Missing fields:', missing);
    showError(`Data schema issue: missing ${missing.join(', ')}`);
    return;
  }
  
  // Normal rendering...
}
```

### 4. Data File Inventory (Single Source of Truth)
| Section | Data File | Loader Path | Schema Notes |
|---------|-----------|-------------|--------------|
| Epidemiology | `epidemiology-comprehensive.json` | `/epidemiology-comprehensive.json` | Flat: `summary.annualStrokes.value` |
| Revenue | `revenue-historical.json` | `/revenue-historical.json` | Has `historicalRevenue`, `projectedRevenue` |
| Competitors | `competitor-intelligence.json` | `/competitor-intelligence.json` | Array: `companies[]` |
| Portfolio | `portfolio-matrix.json` | `/portfolio-matrix.json` | Has `categories[]` |

### 5. Test Sequence After Any Change
1. Hard refresh (Ctrl+Shift+R)
2. Check browser console for 404s
3. Verify `NeuroVueDataLoader.loadNeuroVueData()` logs show all ✅
4. Check each section renders with actual numbers (not "--")
5. Verify no `undefined` or `null` in rendered output

---

## 🛡️ PREVENTION CHECKLIST

- [ ] Add JSON schema validation at build time
- [ ] Version-lock data files (data-v1.json, data-v2.json)
- [ ] Dashboard checks version compatibility on load
- [ ] CI/CD test: Load data → Render → Screenshot comparison
- [ ] Document schema changes in commit messages

---

## 📝 LESSONS LEARNED

**What worked:**
- Self-sufficient debugging using git history to trace changes
- Inspecting actual JSON structure vs. assuming it
- Fixing root cause (schema) not symptom (blank display)

**What to do differently:**
- ALWAYS verify JSON structure before writing processing code
- Add schema validation to catch mismatches early
- Document data dependencies in code comments

---

*Compiled after successful fix: Revenue + Epidemiology both rendering correctly*
