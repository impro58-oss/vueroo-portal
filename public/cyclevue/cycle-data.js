/**
 * CycleVue Data Generator
 * Generates wave data for ECM, Structural, and Generational cycles
 * Time range: 1924-2124 (200 years)
 */

const CYCLE_CONFIG = {
    startYear: 1924,
    endYear: 2124,
    currentYear: 2026,
    
    // ECM: 8.6 years = Pi × 1000 days ≈ 3141 days
    ecm: {
        period: 8.6,
        startOffset: 0,  // Aligns with 2020 start
        amplitude: 1,
        color: '#3b82f6',
        subdivisions: [2.15, 1.075]  // Quarter and eighth cycles
    },
    
    // Structural: 18 years
    structural: {
        period: 18,
        startOffset: 1,  // 2019 start
        amplitude: 1.5,
        color: '#10b981',
        phases: {
            A: { name: 'Panic', color: '#ef4444', value: -1 },
            B: { name: 'Good Times', color: '#10b981', value: 1 },
            C: { name: 'Hard Times', color: '#f59e0b', value: 0 }
        }
    },
    
    // Generational: 54 years (3 × 18)
    generational: {
        period: 54,
        startOffset: 4,  // 2020 start
        amplitude: 2,
        color: '#f59e0b'
    }
};

// PMM Phase Data (from your documentation)
const PMM_PHASES = {
    A: [1927, 1945, 1965, 1981, 1999, 2019, 2035, 2053, 2073, 2089, 2107, 2127, 2143, 2161, 2181, 2197, 2215, 2235, 2251, 2269, 2289, 2305, 2323, 2343, 2359],
    B: [1926, 1935, 1945, 1953, 1962, 1972, 1980, 1989, 1999, 2007, 2016, 2026, 2034, 2043, 2053, 2062, 2072, 2080, 2089, 2099, 2107, 2116, 2126, 2134, 2143, 2153, 2161, 2170, 2180, 2188, 2197, 2207, 2215],
    C: [1924, 1931, 1942, 1951, 1958, 1969, 1978, 1985, 1996, 2005, 2012, 2023, 2032, 2039, 2050, 2059, 2066, 2077, 2086, 2093, 2104, 2113, 2120, 2131, 2140, 2147, 2158, 2167, 2174, 2185, 2194]
};

// Historical inflection points with context
const INFLECTION_POINTS = [
    { year: 1929, type: 'panic', cycle: 'structural', event: 'Great Depression', description: 'Stock market crash, global depression begins' },
    { year: 1945, type: 'transition', cycle: 'structural', event: 'WWII Ends', description: 'Post-war economic rebuilding begins' },
    { year: 1965, type: 'peak', cycle: 'ecm', event: 'Dow Decline', description: 'Market panic and economic slowdown' },
    { year: 1971, type: 'structural', cycle: 'generational', event: 'Nixon Shock', description: 'End of gold standard, fiat era begins' },
    { year: 1981, type: 'panic', cycle: 'structural', event: 'High Inflation', description: 'Volcker Fed, peak inflation crisis' },
    { year: 1987, type: 'panic', cycle: 'ecm', event: 'Black Monday', description: 'Largest single-day stock market drop' },
    { year: 1998, type: 'peak', cycle: 'ecm', event: 'Asian Financial Crisis', description: 'Global contagion, LTCM collapse' },
    { year: 1999, type: 'panic', cycle: 'structural', event: 'Tech Bubble Peak', description: 'Dot-com euphoria reaches maximum' },
    { year: 2000, type: 'peak', cycle: 'ecm', event: 'Dot-Com Crash', description: 'Technology sector collapse begins' },
    { year: 2008, type: 'panic', cycle: 'structural', event: 'Global Financial Crisis', description: 'Housing collapse, Lehman bankruptcy' },
    { year: 2019, type: 'panic', cycle: 'structural', event: 'Economic Uncertainty', description: 'Trade wars, yield curve inversion' },
    { year: 2020, type: 'panic', cycle: 'ecm', event: 'COVID-19 Pandemic', description: 'Global lockdowns, market crash and recovery' },
    { year: 2028, type: 'peak', cycle: 'ecm', event: 'Projected ECM Peak', description: 'Next 8.6-year cycle inflection' },
    { year: 2032, type: 'trough', cycle: 'structural', event: 'Projected Hard Times', description: 'C phase - accumulation opportunity' },
    { year: 2035, type: 'panic', cycle: 'structural', event: 'Projected Panic', description: 'A phase - major downturn expected' },
    { year: 2043, type: 'peak', cycle: 'structural', event: 'Projected Peak', description: 'B phase - speculative high' },
    { year: 2053, type: 'peak', cycle: 'generational', event: 'Projected Generational Peak', description: '54-year cycle maximum - major shift' },
    { year: 2081, type: 'trough', cycle: 'generational', event: 'Projected Generational Trough', description: 'Next major bottom - generational buying' }
];

/**
 * Generate sine wave data for a given cycle
 */
function generateWave(cycle, startYear, endYear, resolution = 0.1) {
    const data = [];
    const period = cycle.period;
    const amplitude = cycle.amplitude;
    const offset = cycle.startOffset;
    
    for (let year = startYear; year <= endYear; year += resolution) {
        const yearsIntoCycle = (year - 2020 + offset) % period;
        const phase = (yearsIntoCycle / period) * 2 * Math.PI;
        const value = Math.sin(phase) * amplitude;
        
        data.push({
            year: year,
            value: value,
            phase: yearsIntoCycle / period
        });
    }
    
    return data;
}

/**
 * Generate combined wave (superposition of all three cycles)
 */
function generateCombinedWave(ecmData, structuralData, generationalData) {
    const combined = [];
    const length = Math.min(ecmData.length, structuralData.length, generationalData.length);
    
    for (let i = 0; i < length; i++) {
        combined.push({
            year: ecmData[i].year,
            value: ecmData[i].value + structuralData[i].value + generationalData[i].value,
            ecm: ecmData[i].value,
            structural: structuralData[i].value,
            generational: generationalData[i].value
        });
    }
    
    return combined;
}

/**
 * Get PMM phase for a given year
 */
function getPMMPhase(year) {
    if (PMM_PHASES.A.includes(year)) return { phase: 'A', name: 'Panic', color: '#ef4444', value: -1 };
    if (PMM_PHASES.B.includes(year)) return { phase: 'B', name: 'Good Times', color: '#10b981', value: 1 };
    if (PMM_PHASES.C.includes(year)) return { phase: 'C', name: 'Hard Times', color: '#f59e0b', value: 0 };
    
    // Interpolate between known points
    const allYears = [...PMM_PHASES.A, ...PMM_PHASES.B, ...PMM_PHASES.C].sort((a, b) => a - b);
    const nearest = allYears.reduce((prev, curr) => 
        Math.abs(curr - year) < Math.abs(prev - year) ? curr : prev
    );
    
    if (PMM_PHASES.A.includes(nearest)) return { phase: 'A', name: 'Panic', color: '#ef4444', value: -0.5 };
    if (PMM_PHASES.B.includes(nearest)) return { phase: 'B', name: 'Good Times', color: '#10b981', value: 0.5 };
    return { phase: 'C', name: 'Hard Times', color: '#f59e0b', value: 0 };
}

/**
 * Get current position in cycles
 */
function getCurrentPosition(year = CYCLE_CONFIG.currentYear) {
    const ecm = generateWave(CYCLE_CONFIG.ecm, year, year + 0.1, 0.1);
    const structural = generateWave(CYCLE_CONFIG.structural, year, year + 0.1, 0.1);
    const generational = generateWave(CYCLE_CONFIG.generational, year, year + 0.1, 0.1);
    
    const ecmPhase = ecm[0].phase;
    const structuralPhase = structural[0].phase;
    const generationalPhase = generational[0].phase;
    
    return {
        year: year,
        ecm: {
            phase: ecmPhase,
            position: getCyclePosition(ecmPhase),
            nextInflection: getNextInflection(year, CYCLE_CONFIG.ecm.period, 2020)
        },
        structural: {
            phase: structuralPhase,
            position: getCyclePosition(structuralPhase),
            nextInflection: getNextInflection(year, CYCLE_CONFIG.structural.period, 2019)
        },
        generational: {
            phase: generationalPhase,
            position: getCyclePosition(generationalPhase),
            nextInflection: getNextInflection(year, CYCLE_CONFIG.generational.period, 2020)
        },
        pmm: getPMMPhase(Math.floor(year))
    };
}

/**
 * Get descriptive cycle position
 */
function getCyclePosition(phase) {
    if (phase < 0.25) return 'Early Expansion';
    if (phase < 0.5) return 'Late Expansion';
    if (phase < 0.75) return 'Early Contraction';
    return 'Late Contraction';
}

/**
 * Calculate next inflection point
 */
function getNextInflection(currentYear, period, cycleStart) {
    const yearsIntoCycle = (currentYear - cycleStart) % period;
    const yearsToPeak = (period / 2) - yearsIntoCycle;
    const yearsToTrough = period - yearsIntoCycle;
    
    if (yearsToPeak > 0 && yearsToPeak < yearsToTrough) {
        return { type: 'peak', year: Math.floor(currentYear + yearsToPeak) };
    }
    return { type: 'trough', year: Math.floor(currentYear + yearsToTrough) };
}

/**
 * Generate full dataset for visualization
 */
function generateCycleVueData() {
    const { startYear, endYear } = CYCLE_CONFIG;
    
    // Generate wave data
    const ecmData = generateWave(CYCLE_CONFIG.ecm, startYear, endYear);
    const structuralData = generateWave(CYCLE_CONFIG.structural, startYear, endYear);
    const generationalData = generateWave(CYCLE_CONFIG.generational, startYear, endYear);
    const combinedData = generateCombinedWave(ecmData, structuralData, generationalData);
    
    // Add PMM phases to combined data
    combinedData.forEach(point => {
        point.pmm = getPMMPhase(Math.floor(point.year));
    });
    
    return {
        config: CYCLE_CONFIG,
        waves: {
            ecm: ecmData,
            structural: structuralData,
            generational: generationalData,
            combined: combinedData
        },
        pmm: PMM_PHASES,
        inflectionPoints: INFLECTION_POINTS,
        currentPosition: getCurrentPosition()
    };
}

// Export for use in renderer
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { generateCycleVueData, getCurrentPosition, PMM_PHASES, INFLECTION_POINTS };
}

// Make available globally for browser
if (typeof window !== 'undefined') {
    window.CycleData = { generateCycleVueData, getCurrentPosition, PMM_PHASES, INFLECTION_POINTS };
}
