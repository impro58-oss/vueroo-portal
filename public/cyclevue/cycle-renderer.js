/**
 * CycleVue D3.js Renderer
 * Renders interactive multi-layer cycle visualization
 */

let cycleChart = null;
let currentZoom = { start: 1924, end: 2124 };
let visibleCycles = { ecm: true, structural: true, generational: true, combined: true };

function initializeCycleVue() {
    console.log('Initializing CycleVue...');
    
    // Generate cycle data
    const data = generateCycleVueData();
    window.cycleData = data;
    
    // Update UI components
    updatePhaseTimeline(data);
    updateInflectionPoints(data);
    
    // Render main chart
    renderCycleChart(data);
    
    // Setup legend toggles
    setupLegendToggles();
    
    console.log('CycleVue initialized');
}

function renderCycleChart(data) {
    const container = document.getElementById('cycle-chart');
    if (!container) {
        console.error('Chart container not found');
        return;
    }
    
    // Clear previous chart
    container.innerHTML = '';
    
    // Setup dimensions
    const width = container.clientWidth;
    const height = container.clientHeight || 500;
    const margin = { top: 40, right: 60, bottom: 60, left: 60 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select('#cycle-chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet');
    
    // Create defs for gradients
    const defs = svg.append('defs');
    
    // Gradient for combined wave
    const gradient = defs.append('linearGradient')
        .attr('id', 'combined-gradient')
        .attr('x1', '0%').attr('y1', '0%')
        .attr('x2', '0%').attr('y2', '100%');
    
    gradient.append('stop').attr('offset', '0%').attr('stop-color', '#a855f7').attr('stop-opacity', 0.3);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', '#a855f7').attr('stop-opacity', 0.05);
    
    // Main group
    const g = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Scales
    const xScale = d3.scaleLinear()
        .domain([currentZoom.start, currentZoom.end])
        .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
        .domain([-4, 4])
        .range([innerHeight, 0]);
    
    // Store scales for zoom
    cycleChart = { svg, g, xScale, yScale, data, width, height, margin, innerWidth, innerHeight };
    
    // Draw grid
    drawGrid(g, xScale, yScale, innerWidth, innerHeight);
    
    // Draw axes
    drawAxes(g, xScale, yScale, innerWidth, innerHeight);
    
    // Draw PMM phase backgrounds
    drawPMMPhases(g, xScale, yScale, innerHeight, data);
    
    // Draw cycle waves
    drawCycleWaves(g, xScale, yScale, data);
    
    // Draw inflection points
    drawInflectionPoints(g, xScale, yScale, data);
    
    // Draw current year marker
    drawCurrentYearMarker(g, xScale, yScale, innerHeight);
    
    // Add zoom behavior
    addZoomBehavior(svg, g, xScale, yScale, data, innerWidth, innerHeight);
    
    // Add tooltip behavior
    addTooltipBehavior(svg, data, xScale, yScale);
}

function drawGrid(g, xScale, yScale, width, height) {
    // X-axis grid lines (every 9 years)
    const xTicks = xScale.ticks(20).filter(year => year % 9 === 0);
    
    g.selectAll('.grid-line-x')
        .data(xTicks)
        .enter()
        .append('line')
        .attr('class', 'grid-line')
        .attr('x1', d => xScale(d))
        .attr('x2', d => xScale(d))
        .attr('y1', 0)
        .attr('y2', height);
    
    // Y-axis grid lines
    g.selectAll('.grid-line-y')
        .data(yScale.ticks(8))
        .enter()
        .append('line')
        .attr('class', 'grid-line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', d => yScale(d))
        .attr('y2', d => yScale(d));
    
    // Zero line
    g.append('line')
        .attr('class', 'axis-line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', yScale(0))
        .attr('y2', yScale(0))
        .attr('stroke', '#64748b')
        .attr('stroke-width', 1.5);
}

function drawAxes(g, xScale, yScale, width, height) {
    // X-axis
    const xAxis = d3.axisBottom(xScale)
        .tickValues(d3.range(Math.ceil(currentZoom.start / 9) * 9, currentZoom.end, 9))
        .tickFormat(d3.format('d'));
    
    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis)
        .selectAll('text')
        .style('fill', '#94a3b8')
        .style('font-size', '11px');
    
    // Y-axis
    const yAxis = d3.axisLeft(yScale).ticks(8);
    
    g.append('g')
        .call(yAxis)
        .selectAll('text')
        .style('fill', '#94a3b8')
        .style('font-size', '11px');
    
    // Axis labels
    g.append('text')
        .attr('x', width / 2)
        .attr('y', height + 45)
        .attr('text-anchor', 'middle')
        .style('fill', '#94a3b8')
        .style('font-size', '12px')
        .text('Year');
    
    g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -45)
        .attr('text-anchor', 'middle')
        .style('fill', '#94a3b8')
        .style('font-size', '12px')
        .text('Cycle Intensity');
}

function drawPMMPhases(g, xScale, yScale, height, data) {
    // Create phase bands
    const phases = [];
    let currentPhase = null;
    let phaseStart = null;
    
    // Iterate through PMM data to create phase bands
    const allYears = [...data.pmm.A, ...data.pmm.B, ...data.pmm.C].sort((a, b) => a - b);
    
    // Simple phase visualization (every 6 years alternate phases)
    const phaseLength = 6;
    for (let year = currentZoom.start; year <= currentZoom.end; year += phaseLength) {
        const phaseType = Math.floor((year - 1924) / phaseLength) % 3;
        let phaseClass, phaseName;
        
        switch(phaseType) {
            case 0:
                phaseClass = 'phase-a';
                phaseName = 'A';
                break;
            case 1:
                phaseClass = 'phase-b';
                phaseName = 'B';
                break;
            case 2:
                phaseClass = 'phase-c';
                phaseName = 'C';
                break;
        }
        
        // Check if year is in actual PMM data
        const isA = data.pmm.A.some(y => Math.abs(y - year) < 3);
        const isB = data.pmm.B.some(y => Math.abs(y - year) < 3);
        const isC = data.pmm.C.some(y => Math.abs(y - year) < 3);
        
        if (isA) { phaseClass = 'phase-a'; phaseName = 'A'; }
        else if (isB) { phaseClass = 'phase-b'; phaseName = 'B'; }
        else if (isC) { phaseClass = 'phase-c'; phaseName = 'C'; }
        
        const rectWidth = xScale(Math.min(year + phaseLength, currentZoom.end)) - xScale(year);
        
        g.append('rect')
            .attr('class', phaseClass)
            .attr('x', xScale(year))
            .attr('y', 0)
            .attr('width', rectWidth)
            .attr('height', height)
            .style('opacity', 0.15);
        
        // Phase label
        if (rectWidth > 30) {
            g.append('text')
                .attr('class', 'phase-label')
                .attr('x', xScale(year) + rectWidth / 2)
                .attr('y', 20)
                .text(phaseName);
        }
    }
}

function drawCycleWaves(g, xScale, yScale, data) {
    const line = d3.line()
        .x(d => xScale(d.year))
        .y(d => yScale(d.value))
        .curve(d3.curveMonotoneX);
    
    // Filter data to visible range
    const filterData = (arr) => arr.filter(d => d.year >= currentZoom.start && d.year <= currentZoom.end);
    
    // Draw ECM wave
    if (visibleCycles.ecm) {
        const ecmLine = d3.line()
            .defined(d => !isNaN(d.ecm))
            .x(d => xScale(d.year))
            .y(d => yScale(d.ecm * 0.5))
            .curve(d3.curveMonotoneX);
        
        g.append('path')
            .datum(filterData(data.waves.ecm))
            .attr('class', 'cycle-wave-ecm')
            .attr('d', ecmLine)
            .attr('fill', 'none');
    }
    
    // Draw Structural wave
    if (visibleCycles.structural) {
        const structuralLine = d3.line()
            .defined(d => !isNaN(d.structural))
            .x(d => xScale(d.year))
            .y(d => yScale(d.structural * 0.8))
            .curve(d3.curveMonotoneX);
        
        g.append('path')
            .datum(filterData(data.waves.structural))
            .attr('class', 'cycle-wave-structural')
            .attr('d', structuralLine)
            .attr('fill', 'none');
    }
    
    // Draw Generational wave
    if (visibleCycles.generational) {
        const generationalLine = d3.line()
            .defined(d => !isNaN(d.generational))
            .x(d => xScale(d.year))
            .y(d => yScale(d.generational))
            .curve(d3.curveMonotoneX);
        
        g.append('path')
            .datum(filterData(data.waves.generational))
            .attr('class', 'cycle-wave-generational')
            .attr('d', generationalLine)
            .attr('fill', 'none');
    }
    
    // Draw Combined wave (always on top)
    if (visibleCycles.combined) {
        const combinedLine = d3.line()
            .defined(d => !isNaN(d.value))
            .x(d => xScale(d.year))
            .y(d => yScale(d.value))
            .curve(d3.curveMonotoneX);
        
        // Area for combined wave
        const area = d3.area()
            .defined(d => !isNaN(d.value))
            .x(d => xScale(d.year))
            .y0(d => yScale(0))
            .y1(d => yScale(d.value))
            .curve(d3.curveMonotoneX);
        
        // Add gradient fill
        g.append('path')
            .datum(filterData(data.waves.combined))
            .attr('d', area)
            .style('fill', 'url(#combined-gradient)');
        
        // Add line
        g.append('path')
            .datum(filterData(data.waves.combined))
            .attr('class', 'cycle-wave-combined')
            .attr('d', combinedLine)
            .attr('fill', 'none');
    }
}

function drawInflectionPoints(g, xScale, yScale, data) {
    const relevantPoints = data.inflectionPoints.filter(
        p => p.year >= currentZoom.start && p.year <= currentZoom.end
    );
    
    relevantPoints.forEach(point => {
        // Find y-value at this year
        const yearData = data.waves.combined.find(d => Math.abs(d.year - point.year) < 0.5);
        if (!yearData) return;
        
        const x = xScale(point.year);
        const y = yScale(yearData.value);
        
        // Draw point
        g.append('circle')
            .attr('class', 'inflection-point')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 6)
            .style('cursor', 'pointer')
            .on('mouseover', function(event) {
                d3.select(this).attr('r', 9);
                showTooltip(event, `
                    <strong>${point.year}: ${point.event}</strong><br>
                    Type: ${point.type}<br>
                    Cycle: ${point.cycle}<br>
                    ${point.description}
                `);
            })
            .on('mouseout', function() {
                d3.select(this).attr('r', 6);
                hideTooltip();
            });
        
        // Label for significant points
        if (['panic', 'peak', 'trough'].includes(point.type) && point.year >= 1950) {
            g.append('text')
                .attr('x', x)
                .attr('y', y - 15)
                .attr('text-anchor', 'middle')
                .style('fill', '#e2e8f0')
                .style('font-size', '10px')
                .style('font-weight', 'bold')
                .text(point.year.toString());
        }
    });
}

function drawCurrentYearMarker(g, xScale, yScale, height) {
    const currentYear = 2026;
    const x = xScale(currentYear);
    
    // Vertical line
    g.append('line')
        .attr('class', 'current-year-marker')
        .attr('x1', x)
        .attr('x2', x)
        .attr('y1', 0)
        .attr('y2', height);
    
    // Label
    g.append('text')
        .attr('x', x)
        .attr('y', -10)
        .attr('text-anchor', 'middle')
        .style('fill', '#ef4444')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('NOW: 2026');
}

function addZoomBehavior(svg, g, xScale, yScale, data, width, height) {
    const zoom = d3.zoom()
        .scaleExtent([0.1, 10])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on('zoom', (event) => {
            const newXScale = event.transform.rescaleX(xScale);
            const newYScale = event.transform.rescaleY(yScale);
            
            // Update current zoom
            currentZoom.start = Math.round(newXScale.domain()[0]);
            currentZoom.end = Math.round(newXScale.domain()[1]);
            
            // Re-render chart with new scales
            g.selectAll('*').remove();
            drawGrid(g, newXScale, newYScale, width, height);
            drawAxes(g, newXScale, newYScale, width, height);
            drawPMMPhases(g, newXScale, newYScale, height, data);
            drawCycleWaves(g, newXScale, newYScale, data);
            drawInflectionPoints(g, newXScale, newYScale, data);
            drawCurrentYearMarker(g, newXScale, newYScale, height);
        });
    
    svg.call(zoom);
}

function addTooltipBehavior(svg, data, xScale, yScale) {
    const tooltip = d3.select('#tooltip');
    
    svg.on('mousemove', function(event) {
        const [x, y] = d3.pointer(event, this);
        const year = Math.round(xScale.invert(x - cycleChart.margin.left));
        
        if (year >= currentZoom.start && year <= currentZoom.end) {
            const yearData = data.waves.combined.find(d => Math.abs(d.year - year) < 0.5);
            if (yearData) {
                const phase = yearData.pmm || { phase: '-', name: 'Unknown' };
                
                tooltip
                    .style('left', (event.pageX + 15) + 'px')
                    .style('top', (event.pageY - 15) + 'px')
                    .style('display', 'block')
                    .html(`
                        <strong>Year: ${Math.round(year)}</strong><br>
                        PMM Phase: ${phase.name} (${phase.phase})<br>
                        Cycle Value: ${yearData.value.toFixed(2)}<br>
                        ECM: ${yearData.ecm.toFixed(1)} | Structural: ${yearData.structural.toFixed(1)} | Gen: ${yearData.generational.toFixed(1)}
                    `);
            }
        }
    });
    
    svg.on('mouseout', function() {
        hideTooltip();
    });
}

function showTooltip(event, content) {
    const tooltip = document.getElementById('tooltip');
    tooltip.innerHTML = content;
    tooltip.style.display = 'block';
    tooltip.style.left = (event.pageX + 15) + 'px';
    tooltip.style.top = (event.pageY - 15) + 'px';
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    tooltip.style.display = 'none';
}

function updatePhaseTimeline(data) {
    const container = document.getElementById('phase-timeline');
    if (!container) return;
    
    const startYear = 1924;
    const endYear = 2124;
    const yearWidth = 3; // pixels per year
    
    let html = '';
    
    for (let year = startYear; year <= endYear; year += 9) {
        const yearStr = year.toString();
        const isMatchA = data.pmm.A.includes(year);
        const isMatchB = data.pmm.B.includes(year);
        const isMatchC = data.pmm.C.includes(year);
        
        let bgClass = 'bg-slate-700';
        if (isMatchA) bgClass = 'bg-red-500/40 border-red-500';
        else if (isMatchB) bgClass = 'bg-emerald-500/40 border-emerald-500';
        else if (isMatchC) bgClass = 'bg-amber-500/40 border-amber-500';
        
        const borderClass = (isMatchA || isMatchB || isMatchC) ? 'border' : '';
        
        html += `
            <div class="flex-shrink-0 w-6 ${bgClass} ${borderClass} rounded flex items-center justify-center text-xs text-slate-300"
                 style="height: 32px;" title="${year}">
                ${yearStr.slice(-2)}
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function updateInflectionPoints(data) {
    const container = document.getElementById('inflection-grid');
    if (!container) return;
    
    const futurePoints = data.inflectionPoints.filter(p => p.year >= 2026 && p.year <= 2060);
    
    let html = '';
    futurePoints.forEach(point => {
        let icon = 'fa-circle';
        let colorClass = 'text-slate-400';
        let bgClass = 'bg-slate-700/30';
        
        switch(point.type) {
            case 'panic':
                icon = 'fa-exclamation-triangle';
                colorClass = 'text-red-400';
                bgClass = 'bg-red-500/20';
                break;
            case 'peak':
                icon = 'fa-arrow-up';
                colorClass = 'text-emerald-400';
                bgClass = 'bg-emerald-500/20';
                break;
            case 'trough':
                icon = 'fa-arrow-down';
                colorClass = 'text-amber-400';
                bgClass = 'bg-amber-500/20';
                break;
        }
        
        html += `
            <div class="${bgClass} rounded-xl p-4 border border-slate-700">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-2xl font-bold text-white">${point.year}</span>
                    <i class="fas ${icon} ${colorClass}"></i>
                </div>
                <div class="text-sm ${colorClass} font-medium mb-1">${point.event}</div>
                <div class="text-xs text-slate-400">${point.description}</div>
                <div class="text-xs text-slate-500 mt-2">Cycle: ${point.cycle}</div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function setupLegendToggles() {
    const legendItems = document.querySelectorAll('.legend-item');
    
    legendItems.forEach(item => {
        item.addEventListener('click', () => {
            const cycle = item.dataset.cycle;
            visibleCycles[cycle] = !visibleCycles[cycle];
            item.classList.toggle('hidden', !visibleCycles[cycle]);
            
            // Re-render chart
            if (cycleChart) {
                renderCycleChart(window.cycleData);
            }
        });
    });
}

// Zoom functions
function zoomToCentury() {
    currentZoom = { start: 1924, end: 2024 };
    renderCycleChart(window.cycleData);
}

function zoomToDecade() {
    currentZoom = { start: 2020, end: 2045 };
    renderCycleChart(window.cycleData);
}

function zoomToYear() {
    currentZoom = { start: 2020, end: 2030 };
    renderCycleChart(window.cycleData);
}

function resetZoom() {
    currentZoom = { start: 1924, end: 2124 };
    renderCycleChart(window.cycleData);
}

// Window resize handler
window.addEventListener('resize', () => {
    if (cycleChart && window.cycleData) {
        renderCycleChart(window.cycleData);
    }
});
