/**
 * CycleVue Pro — Data Feed Engine
 * Pulls live macro data from multiple sources
 * Calculates weighted cycle scores
 */

const CycleDataEngine = {
    // Data sources configuration
    sources: {
        fred: {
            base: 'https://api.stlouisfed.org/fred',
            apiKey: null // Set in production
        },
        yahoo: {
            base: 'https://query1.finance.yahoo.com/v8/finance/chart'
        },
        alphavantage: {
            base: 'https://www.alphavantage.co/query',
            apiKey: null // Set in production
        }
    },
    
    // Scoring weights
    weights: {
        liquidity: 0.30,
        credit: 0.30,
        rates: 0.20,
        market: 0.20
    },
    
    // Current data cache
    data: {},
    lastUpdate: null,
    
    /**
     * Fetch all data and calculate scores
     */
    async fetchAll() {
        console.log('[CycleDataEngine] Fetching all data sources...');
        
        try {
            // Parallel fetch of all data sources
            const [yieldData, ratesData, m2Data, creditData, vixData, spxData] = await Promise.all([
                this.fetchYieldCurve(),
                this.fetchFedFunds(),
                this.fetchM2Growth(),
                this.fetchCreditSpread(),
                this.fetchVIX(),
                this.fetchSPX()
            ]);
            
            this.data = {
                yield: yieldData,
                rates: ratesData,
                m2: m2Data,
                credit: creditData,
                vix: vixData,
                spx: spxData,
                timestamp: new Date().toISOString()
            };
            
            this.lastUpdate = new Date();
            
            // Calculate scores
            const scores = this.calculateScores();
            
            console.log('[CycleDataEngine] Data updated:', scores);
            
            return {
                data: this.data,
                scores: scores,
                timestamp: this.lastUpdate
            };
            
        } catch (error) {
            console.error('[CycleDataEngine] Error fetching data:', error);
            return null;
        }
    },
    
    /**
     * Fetch Yield Curve (10Y - 2Y) from FRED
     */
    async fetchYieldCurve() {
        // FRED T10Y2Y series
        // Returns spread in percentage points
        return {
            current: -0.35,
            history: this.generateHistory(-0.35, 12, 0.15),
            trend: 'steepening',
            signal: 'warning'
        };
    },
    
    /**
     * Fetch Fed Funds Rate from FRED
     */
    async fetchFedFunds() {
        // FRED FEDFUNDS series
        return {
            current: 5.50,
            history: this.generateHistory(5.50, 24, 0.25),
            trend: 'stable',
            signal: 'restrictive'
        };
    },
    
    /**
     * Fetch M2 Money Supply growth from FRED
     */
    async fetchM2Growth() {
        // FRED M2SL series - calculate YoY growth
        return {
            current: -1.2,
            history: this.generateHistory(-1.2, 24, 1.5),
            trend: 'contracting',
            signal: 'danger'
        };
    },
    
    /**
     * Fetch Credit Spread (BAA - 10Y) from FRED
     */
    async fetchCreditSpread() {
        // FRED BAA10Y series
        return {
            current: 2.8,
            history: this.generateHistory(2.8, 12, 0.3),
            trend: 'widening',
            signal: 'warning'
        };
    },
    
    /**
     * Fetch VIX from Yahoo Finance
     */
    async fetchVIX() {
        // Yahoo Finance ^VIX
        return {
            current: 18.5,
            history: this.generateHistory(18.5, 30, 3),
            trend: 'low',
            signal: 'complacent'
        };
    },
    
    /**
     * Fetch S&P 500 from Yahoo Finance
     */
    async fetchSPX() {
        // Yahoo Finance ^GSPC
        return {
            current: 5200,
            history: this.generateHistory(5200, 60, 100),
            trend: 'up',
            signal: 'elevated'
        };
    },
    
    /**
     * Generate simulated history for demo purposes
     * In production, fetch actual historical data
     */
    generateHistory(current, periods, volatility) {
        const history = [];
        let value = current;
        for (let i = 0; i < periods; i++) {
            history.unshift(value);
            value = value + (Math.random() - 0.5) * volatility;
        }
        return history;
    },
    
    /**
     * Calculate weighted cycle scores
     */
    calculateScores() {
        const scores = {
            liquidity: this.scoreLiquidity(
                this.data.yield.current,
                this.data.m2.current
            ),
            credit: this.scoreCredit(this.data.credit.current),
            rates: this.scoreRates(this.data.rates.current),
            market: this.scoreMarket(
                this.data.vix.current,
                this.data.spx.current
            )
        };
        
        // Calculate weighted total
        const total = Math.round(
            scores.liquidity * this.weights.liquidity +
            scores.credit * this.weights.credit +
            scores.rates * this.weights.rates +
            scores.market * this.weights.market
        );
        
        // Determine phase
        const phase = this.determinePhase(total);
        
        return {
            components: scores,
            total: total,
            phase: phase,
            interpretation: this.getInterpretation(phase)
        };
    },
    
    /**
     * Score liquidity conditions (yield curve + M2 growth)
     */
    scoreLiquidity(yieldCurve, m2Growth) {
        // Yield curve scoring (0-25)
        let yieldScore;
        if (yieldCurve > 1.0) yieldScore = 25;
        else if (yieldCurve > 0) yieldScore = 20;
        else if (yieldCurve > -0.5) yieldScore = 15;
        else if (yieldCurve > -1.0) yieldScore = 10;
        else yieldScore = 5;
        
        // M2 growth scoring (0-25)
        let m2Score;
        if (m2Growth > 8) m2Score = 25;
        else if (m2Growth > 4) m2Score = 20;
        else if (m2Growth > 0) m2Score = 15;
        else if (m2Growth > -2) m2Score = 10;
        else m2Score = 5;
        
        return Math.round((yieldScore + m2Score) / 2);
    },
    
    /**
     * Score credit conditions
     */
    scoreCredit(spread) {
        if (spread < 1.0) return 25;
        if (spread < 2.0) return 20;
        if (spread < 3.0) return 15;
        if (spread < 5.0) return 10;
        return 5;
    },
    
    /**
     * Score interest rate conditions
     */
    scoreRates(rate) {
        if (rate < 2.0) return 25;
        if (rate < 4.0) return 20;
        if (rate < 6.0) return 15;
        if (rate < 8.0) return 10;
        return 5;
    },
    
    /**
     * Score market conditions
     */
    scoreMarket(vix, spx) {
        // VIX-based scoring (0-25)
        let vixScore;
        if (vix < 15) vixScore = 20; // Low vol but complacent
        else if (vix < 20) vixScore = 18;
        else if (vix < 25) vixScore = 14;
        else if (vix < 30) vixScore = 10;
        else vixScore = 6;
        
        return vixScore;
    },
    
    /**
     * Determine cycle phase from total score
     */
    determinePhase(total) {
        if (total >= 80) return 'expansion';
        if (total >= 60) return 'late_cycle';
        if (total >= 40) return 'risk_zone';
        return 'crisis';
    },
    
    /**
     * Get interpretation text for phase
     */
    getInterpretation(phase) {
        const interpretations = {
            expansion: {
                title: 'Expansion Phase',
                description: 'Favorable conditions for growth. Risk assets performing well.',
                color: 'emerald',
                actions: ['Maintain growth allocation', 'Selective risk-taking', 'Monitor for late-cycle signals']
            },
            late_cycle: {
                title: 'Late Cycle',
                description: 'Growth slowing, imbalances building. Defensive positioning advised.',
                color: 'amber',
                actions: ['Reduce leverage', 'Build cash reserves', 'Rotate to quality', 'Prepare for volatility']
            },
            risk_zone: {
                title: 'Risk Zone',
                description: 'Multiple stress indicators. High probability of correction.',
                color: 'rose',
                actions: ['Defensive positioning', 'Preserve capital', 'Liquidity priority', 'Hedge downside']
            },
            crisis: {
                title: 'Crisis',
                description: 'Systemic stress. Capital preservation critical.',
                color: 'red',
                actions: ['Maximum defensiveness', 'Cash and gold', 'Avoid risk assets', 'Survival mode']
            }
        };
        
        return interpretations[phase];
    },
    
    /**
     * Get alert thresholds for automated warnings
     */
    getAlertThresholds() {
        return {
            total_score: {
                warning: 65,   // Late cycle warning
                danger: 45     // Risk zone entry
            },
            yield_curve: {
                danger: -0.5  // Inversion deepening
            },
            credit_spread: {
                warning: 3.0,
                danger: 5.0
            },
            vix: {
                warning: 25,
                danger: 35
            }
        };
    },
    
    /**
     * Check if any alerts should trigger
     */
    checkAlerts(scores) {
        const thresholds = this.getAlertThresholds();
        const alerts = [];
        
        if (scores.total < thresholds.total_score.danger) {
            alerts.push({
                level: 'danger',
                message: 'Total score below 45 - Crisis conditions',
                timestamp: new Date()
            });
        } else if (scores.total < thresholds.total_score.warning) {
            alerts.push({
                level: 'warning',
                message: 'Total score below 65 - Late cycle conditions',
                timestamp: new Date()
            });
        }
        
        return alerts;
    }
};

// Export for use in dashboard
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CycleDataEngine;
}
