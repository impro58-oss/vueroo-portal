# StockVue Deployment Fix Log

## Issue
- StockVue and CryptoVue dashboards showing "--" for all metrics
- Data not loading from GitHub

## Fix Applied
- StockVue: Added null-safe field access for `name`, `category`, `signal`
- CryptoVue: Switched to GitHub-first loading with `GITHUB_DATA_URL`

## Deployed
- 2026-03-26 08:45 UTC

## Verification
- [ ] StockVue loads data
- [ ] CryptoVue loads data
- [ ] NeuroVue loads data
