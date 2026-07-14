/**
 * CycleVue Europe Impact Layer
 * Maps US cycle indicators to European impact
 * Provides Eurozone + Ireland-specific indicators from FRED
 */

const EuropeImpact = {
    // US → Europe Transmission Matrix
    // How US cycle events cascade into European markets
    transmissionMatrix: [
        {
            usEvent: 'Fed Rate Cuts',
            europeImpact: 'ECB follows with lag (3-6 months). Euro strengthens vs USD. Eurozone bonds rally. European bank margins compress.',
            impact: 'high',
            lagDays: '90-180',
            sectors: { winners: ['European Real Estate', 'Utilities', 'Government Bonds'], losers: ['European Banks', 'Export-Heavy Industrials'] },
            irelandNote: 'Ireland: Variable mortgage rates drop 3-6 months after ECB cuts. Positive for Irish housing market. EUR/GBP movement affects cross-border purchasing power.'
        },
        {
            usEvent: 'US Debt Crisis / Credit Crunch',
            europeImpact: 'European bank funding costs spike. EUR liquidity tightens. Southern European spreads widen (BTP-Bund). ECB likely expands QE/TLTRO.',
            impact: 'high',
            lagDays: '7-30',
            sectors: { winners: ['Bund', 'Swiss Franc', 'Gold'], losers: ['Italian Banks', 'Greek Banks', 'Peripheral Bonds'] },
            irelandNote: 'Ireland: Highly exposed — foreign-owned bank assets = 300%+ of GDP. IFSC flows contract. But Ireland\'s sovereign debt is low (~60% GDP), providing buffer.'
        },
        {
            usEvent: 'US Dollar Devaluation',
            europeImpact: 'Euro appreciates sharply. European exports become less competitive. ECB may intervene to weaken EUR. Reserve diversification accelerates.',
            impact: 'medium',
            lagDays: '30-90',
            sectors: { winners: ['European Importers', 'Tourism', 'Consumer Goods'], losers: ['German Exporters', 'Luxembourg Financials'] },
            irelandNote: 'Ireland: Pharma/tech exports (40%+ of GDP) face margin pressure. But USD-denominated multinationals see EUR translation gains. FDI flows may slow.'
        },
        {
            usEvent: 'US Geopolitical Conflict',
            europeImpact: 'Energy prices spike (Middle East). Defense spending rises. NATO pressure increases. Refugee flows to Southern/Eastern Europe. Supply chain disruption.',
            impact: 'high',
            lagDays: '0-7',
            sectors: { winners: ['Defense (BAE, Rheinmetall)', 'Energy', 'Cybersecurity'], losers: ['Airlines', 'Tourism', 'Chemicals'] },
            irelandNote: 'Ireland: Energy import costs spike (87% energy import dependent). Shannon airport refueling costs rise. But Ireland\'s neutrality reduces direct exposure. Data center energy costs a concern.'
        },
        {
            usEvent: 'US Recession',
            europeImpact: 'Eurozone enters recession 1-2 quarters later. German manufacturing (export-led) hit hardest. Southern Europe fiscal stress returns. ECB cuts aggressively.',
            impact: 'high',
            lagDays: '60-180',
            sectors: { winners: ['Government Bonds', 'Defensive Stocks (Healthcare, Utilities)'], losers: ['Industrials', 'Banks', 'Cyclicals'] },
            irelandNote: 'Ireland: Multinational sector provides buffer (pharma/tech resilient in recessions). But domestic SMEs exposed. Unemployment rises from low base. Corporation tax revenue volatile.'
        },
        {
            usEvent: 'US Asset Bubble Burst',
            europeImpact: 'Cross-border contagion via financial linkages. European equity valuations follow US lower. Safe-haven flows to Bund/CHF. Credit spreads widen.',
            impact: 'medium',
            lagDays: '1-30',
            sectors: { winners: ['Bund', 'Gold', 'Swiss Franc'], losers: ['European Equities', 'High Yield Credit', 'Peripheral Debt'] },
            irelandNote: 'Ireland: Dublin property market vulnerable (prices 20%+ above 2007 peak in real terms). Irish bank loan books exposed to commercial real estate. Pension fund drawdowns.'
        },
        {
            usEvent: 'US Reserve Currency Loss',
            europeImpact: 'Long-term: EUR gains reserve status share. European financial markets deepen. But transition period is volatile — EUR may initially weaken from global uncertainty.',
            impact: 'low',
            lagDays: '365+',
            sectors: { winners: ['Euro Sovereign Debt', 'European Financials (long-term)'], losers: ['USD-denominated assets'] },
            irelandNote: 'Ireland: Long-term positive — EUR reserve status increases FDI attractiveness. IFSC benefits from EUR-denominated financial services. But transition period creates FX volatility for Irish exporters.'
        }
    ],

    // Europe-specific cycle position assessment
    europeCyclePosition: {
        eurozone: {
            debtCycle: { stage: 'Mid-Late', yearsToPeak: 5, status: 'warning' },
            economicCycle: { stage: 'Stagnation', status: 'warning' },
            politicalIntegration: { stage: 'Fragmentation Risk', status: 'danger' },
            energySecurity: { stage: 'Transition Critical', status: 'danger' },
            demographics: { stage: 'Declining', status: 'danger' },
            overallRisk: 'HIGH',
            overallRiskScore: 72
        },
        ireland: {
            sovereignDebt: { stage: 'Manageable', value: 60, status: 'good' },
            housingMarket: { stage: 'Overvalued', value: 78, status: 'danger' },
            fdiDependency: { stage: 'High Risk', value: 85, status: 'danger' },
            energyImport: { stage: 'Critical Dependency', value: 87, status: 'danger' },
            demographics: { stage: 'Stable (immigration-led)', value: 55, status: 'good' },
            bankingExposure: { stage: 'High (foreign-owned)', value: 80, status: 'warning' },
            overallRisk: 'MEDIUM-HIGH',
            overallRiskScore: 62
        }
    },

    // 12 Europe-specific indicators (parallel to US 18)
    europeIndicators: [
        { id: 'eu_ecb_rate', name: 'ECB Deposit Rate', series_id: 'ECBDFR', value: 2.00, threshold: 3, status: 'warning', unit: '%', freq: 'daily' },
        { id: 'eu_10y_yield', name: 'EU 10Y Gov Bond Yield', series_id: 'IRLTLT01EZM156N', value: 2.89, threshold: 3.5, status: 'warning', unit: '%', freq: 'monthly' },
        { id: 'eu_inflation', name: 'Eurozone HICP Inflation', series_id: 'FPCPITOTLZGEMU', value: 2.4, threshold: 2, status: 'warning', unit: '%', freq: 'annual' },
        { id: 'eu_unemployment', name: 'Eurozone Unemployment', series_id: 'LRHUTTTTEZM156S', value: 6.3, threshold: 7, status: 'good', unit: '%', freq: 'monthly' },
        { id: 'eu_gov_debt', name: 'EU Gov Debt / GDP', series_id: 'GCDODTOTLGDZSEMU', value: 91, threshold: 90, status: 'warning', unit: '%', freq: 'annual' },
        { id: 'eu_m3', name: 'Eurozone M3 Growth', series_id: 'MABMM301EZM189S', value: 3.2, threshold: 4, status: 'warning', unit: '%', freq: 'monthly' },
        { id: 'eu_credit_spread', name: 'EU High Yield Spread', series_id: 'BAMLHE00EHYIOAS', value: 3.41, threshold: 5, status: 'good', unit: '%', freq: 'daily' },
        { id: 'eu_eurusd', name: 'EUR/USD Exchange Rate', series_id: 'DEXUSEU', value: 1.08, threshold: null, status: 'info', unit: '', freq: 'daily' },
        { id: 'eu_ecb_assets', name: 'ECB Balance Sheet', series_id: 'ECBASSETSW', value: 6800000, threshold: null, status: 'info', unit: 'M EUR', freq: 'weekly' },
        { id: 'eu_3m_rate', name: 'EU 3M Interbank Rate', series_id: 'IR3TIB01EZM156N', value: 2.45, threshold: 3, status: 'warning', unit: '%', freq: 'monthly' },
        { id: 'ie_10y_yield', name: 'Ireland 10Y Bond Yield', series_id: 'IRLTLT01IEM156N', value: 2.95, threshold: 4, status: 'good', unit: '%', freq: 'monthly' },
        { id: 'ie_inflation', name: 'Ireland Inflation', series_id: 'FPCPITOTLZGIRL', value: 2.1, threshold: 3, status: 'good', unit: '%', freq: 'annual' }
    ],

    // Ireland-specific risk assessment
    irelandRisks: [
        { risk: 'Housing Bubble', severity: 'high', detail: 'Dublin prices 20%+ above 2007 peak (real terms). Supply shortage persists. ECB rate cuts may reignite price growth.', indicator: 'House price / disposable income ratio at 8.5x' },
        { risk: 'FDI Concentration', severity: 'high', detail: 'Top 10 multinationals = 40% of corporation tax. USD-denominated revenue creates EUR translation risk. Global minimum tax (15%) reduces competitive advantage.', indicator: 'Corp tax = 27% of total revenue' },
        { risk: 'Energy Dependency', severity: 'high', detail: '87% energy import dependent. Natural gas via UK interconnectors. No LNG terminal. Wind capacity growing but grid bottlenecks. Data centers = 18% of electricity demand.', indicator: '87% import dependency' },
        { risk: 'Banking Sovereignty', severity: 'medium', detail: 'Foreign-owned banks dominate (UK, US, European). 300%+ GDP in foreign bank assets. Domestic lending concentrated in property (60%+ of loans).', indicator: 'Foreign bank assets = 300% GDP' },
        { risk: 'Brexit Spillover', severity: 'medium', detail: 'UK remains #1 trading partner for SMEs. Northern Ireland protocol stable but fragile. Cross-border supply chains exposed to UK policy shifts.', indicator: 'UK trade = 15% of total' },
        { risk: 'EU Fragmentation', severity: 'medium', detail: 'Rising Euroscepticism in France, Germany, Italy. Potential for debt mutualization deadlock. Ireland\'s pro-EU stance provides diplomatic capital but limited protection from fragmentation shocks.', indicator: 'EU budget contributions rising' }
    ],

    // European strategic playbook (adjusted for EU/Ireland position)
    europePlaybook: {
        assetAllocation: { stocks: 35, bonds: 15, realEstate: 15, gold: 15, cash: 20 },
        geographic: { ireland: 25, eurozone: 30, us: 20, emerging: 15, uk: 10 },
        currency: { eur: 55, usd: 20, gbp: 10, gold: 10, chf: 5 },
        actions: [
            'Reduce Irish property exposure (bubble risk)',
            'Hold 20% cash — EUR liquidity for ECB rate cuts',
            'Diversify out of EUR (20% USD, 10% GBP)',
            'Own physical gold (15% — geopolitical hedge)',
            'Reduce FDI-dependent income streams',
            'Build EUR emergency fund (12 months)',
            'Consider CHF-denominated assets for stability',
            'Energy independence investments (solar, heat pump)',
            'Pre-position for EU fragmentation scenario',
            'Maintain UK trade relationships post-Brexit'
        ]
    }
};

// Export for dashboard use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EuropeImpact;
}