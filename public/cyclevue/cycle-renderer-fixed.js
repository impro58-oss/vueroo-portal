    // Filter data to visible range
    const filterData = (arr) => arr.filter(d => d.year >= currentZoom.start && d.year <= currentZoom.end && !isNaN(d.year));
    
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