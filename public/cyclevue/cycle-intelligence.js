/**
 * CycleVue Intelligence Layer
 * Integrates cycle-knowledge-base.md frameworks
 * Provides real-time cycle positioning and strategic guidance
 */

const CycleIntelligence = {
    // Current assessment based on knowledge base
    currentAssessment: {
        date: '2026-03-29',
        debtCycle: { stage: 'Late', yearsToPeak: 3, status: 'danger' },
        bigDebtCycle: { stage: 'Deleveraging Beginning', progress: 15, status: 'warning' },
        empireCycle: { stage: 'Stage 3-4 Transition', currentStage: 3.5, status: 'danger' },
        geopoliticalCycle: { stage: 'Conflict Intensifying', yearsToResolution: 20, status: 'warning' },
        overallRisk: 'HIGH',
        overallRiskScore: 78 // 0-100
    },
    
    // 18 Key Indicators from knowledge base
    indicators: [
        { id: 'debt_gdp', name: 'Total Debt / GDP', value: 265, threshold: 250, status: 'danger', unit: '%' },
        { id: 'debt_service', name: 'Debt Service Burden', value: 42, threshold: 40, status: 'warning', unit: '%' },
        { id: 'budget_deficit', name: 'Budget Deficit / GDP', value: 6.8, threshold: 6, status: 'warning', unit: '%' },
        { id: 'wealth_inequality', name: 'Wealth Inequality (Top 10%)', value: 72, threshold: 70, status: 'danger', unit: '%' },
        { id: 'reserve_status', name: 'Reserve Currency Share', value: 58, threshold: 50, status: 'warning', unit: '%', trend: 'declining' },
        { id: 'internal_conflict', name: 'Internal Conflict Index', value: 68, threshold: 60, status: 'warning', unit: '/100' },
        { id: 'military_overreach', name: 'Military Spending / GDP', value: 3.8, threshold: 4, status: 'warning', unit: '%' },
        { id: 'innovation', name: 'R&D Spending / GDP', value: 2.8, threshold: 3, status: 'good', unit: '%' },
        { id: 'education', name: 'Education Quality Rank', value: 18, threshold: 15, status: 'warning', unit: 'global' },
        { id: 'infrastructure', name: 'Infrastructure Quality', value: 62, threshold: 70, status: 'warning', unit: '/100' },
        { id: 'current_account', name: 'Current Account / GDP', value: -3.2, threshold: -3, status: 'warning', unit: '%' },
        { id: 'niip', name: 'Net International Position', value: -18, threshold: -15, status: 'danger', unit: '% of GDP' },
        { id: 'bubble_index', name: 'Asset Bubble Index', value: 78, threshold: 75, status: 'danger', unit: '/100' },
        { id: 'demographics', name: 'Working Age Growth', value: 0.3, threshold: 0.5, status: 'warning', unit: '%' },
        { id: 'resource_security', name: 'Energy Independence', value: 85, threshold: 80, status: 'good', unit: '%' },
        { id: 'leadership', name: 'Leadership Quality Index', value: 45, threshold: 50, status: 'warning', unit: '/100' },
        { id: 'rule_of_law', name: 'Rule of Law Index', value: 68, threshold: 70, status: 'warning', unit: '/100' },
        { id: 'geopolitical_position', name: 'Alliance Strength', value: 55, threshold: 60, status: 'warning', unit: '/100' }
    ],
    
    // Empire Cycle Stages
    empireStages: [
        { num: 1, name: 'New World Order', years: '1945-1960', status: 'complete', color: 'emerald' },
        { num: 2, name: 'Government Building', years: '1960-1990', status: 'complete', color: 'emerald' },
        { num: 3, name: 'Peace & Prosperity', years: '1990-2020', status: 'complete', color: 'emerald' },
        { num: 4, name: 'Bubble & Overextension', years: '2020-2030', status: 'current', color: 'amber' },
        { num: 5, name: 'Decline & Adjustment', years: '2030-2050', status: 'pending', color: 'rose' },
        { num: 6, name: 'Conflict / Revolution', years: '2050+', status: 'pending', color: 'red' }
    ],
    
    // Preparation Windows
    preparationWindows: [
        {
            event: 'Debt Crisis Peak',
            yearsOut: 3,
            urgency: 'critical',
            preparation: [
                'Reduce leverage immediately',
                'Build cash reserves (6-12 months expenses)',
                'Diversify internationally (30-50% foreign assets)',
                'Own physical gold (10-15% allocation)',
                'Secure recession-proof income'
            ],
            ifNotPrepared: [
                'Do NOT panic sell assets',
                'Preserve capital over returns',
                'Reduce expenses drastically',
                'Consider strategic default options',
                'Build community support networks'
            ]
        },
        {
            event: 'Currency Devaluation',
            yearsOut: 5,
            urgency: 'high',
            preparation: [
                'Hold foreign currency exposure',
                'Own real assets (unencumbered property)',
                'Diversify banking relationships',
                'Consider non-USD denominated investments',
                'Develop skills with global demand'
            ],
            ifNotPrepared: [
                'Convert cash to real goods quickly',
                'Avoid long-term fixed income',
                'Seek inflation-protected assets',
                'Reduce USD-denominated debt'
            ]
        },
        {
            event: 'Geopolitical Conflict',
            yearsOut: 15,
            urgency: 'medium',
            preparation: [
                'Geographic diversification of assets',
                'Avoid enemy country exposure',
                'Consider defense sector positioning',
                'Multiple citizenship/residency options',
                'Portable skills and wealth'
            ],
            ifNotPrepared: [
                'Avoid nationalistic investments',
                'Build local community resilience',
                'Secure physical safety',
                'Be ready to move quickly'
            ]
        },
        {
            event: 'Reserve Currency Loss',
            yearsOut: 20,
            urgency: 'planning',
            preparation: [
                'Long-term diversification to rising powers',
                'Learn Mandarin/Chinese markets',
                'Build relationships in Asia',
                'Own assets in multiple currency zones',
                'Consider emigration while young'
            ],
            ifNotPrepared: [
                'Focus on real assets over currency',
                'Build businesses with global reach',
                'Develop location-independent income'
            ]
        }
    ],
    
    // Strategic Playbook by Stage
    strategicPlaybook: {
        3: {
            name: 'Late Prosperity',
            assetAllocation: { stocks: 40, bonds: 20, realEstate: 20, gold: 10, cash: 10 },
            geographic: { domestic: 60, developed: 25, emerging: 15 },
            currency: { usd: 60, eur: 20, gbp: 10, jpy: 10 },
            actions: [
                'Reduce leverage',
                'Take profits on overvalued assets',
                'Build cash position',
                'Start international diversification',
                'Secure income streams'
            ]
        },
        4: {
            name: 'Crisis / Deleveraging',
            assetAllocation: { stocks: 20, bonds: 10, realEstate: 25, gold: 30, cash: 15 },
            geographic: { domestic: 40, developed: 30, emerging: 30 },
            currency: { usd: 40, eur: 25, chf: 15, gold: 20 },
            actions: [
                'Hold physical gold',
                'Avoid banks - diversify institutions',
                'Own unencumbered real estate',
                'Maintain employment at all costs',
                'Avoid new debt completely',
                'Build community resilience'
            ]
        },
        5: {
            name: 'Decline',
            assetAllocation: { stocks: 30, bonds: 15, realEstate: 20, gold: 25, cash: 10 },
            geographic: { domestic: 30, developed: 30, emerging: 40 },
            currency: { usd: 30, cny: 20, eur: 25, gold: 25 },
            actions: [
                'Heavy international diversification',
                'Own assets in rising powers',
                'Develop portable income',
                'Consider emigration',
                'Learn new markets/languages'
            ]
        }
    },
    
    // Historical analogues
    historicalAnalogues: [
        { year: '1928', name: 'Roaring Twenties Peak', similarity: 85, phases: ['Stage 3 Peak', 'Debt Bubble'], lessons: 'Leverage was fatal. Gold holders preserved wealth.' },
        { year: '1987', name: 'Pre-Black Monday', similarity: 68, phases: ['Late Expansion', 'Portfolio Insurance'], lessons: 'Programmatic selling amplified crash.' },
        { year: '2007', name: 'Pre-Financial Crisis', similarity: 82, phases: ['Stage 3', 'Debt Bubble', 'Real Estate Peak'], lessons: 'Real estate bubbles hurt most. Cash was king.' },
        { year: '1968', name: 'Late 60s Turbulence', similarity: 75, phases: ['Stage 3', 'Social Unrest', 'Currency Stress'], lessons: 'Social cohesion matters. Inflation eroded bonds.' }
    ]
};

// Export for dashboard use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CycleIntelligence;
}
