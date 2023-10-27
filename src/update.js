function updateChoropleth() {

    // Recompute data for selected countries
     const totalCountrySales = d3.group(gd_vehicles, (d) => d.COUNTRY);
     const selectedCountrySales = d3.group(d_vehicles, (d) => d.COUNTRY);
 
     // Initialize an empty object to store the aggregated data
     var currentData = {};
 
     totalCountrySales.forEach((sales, country) => {
         const totalSales = d3.sum(sales.filter(d => d.YEAR >= parseInt(minYear) && d.YEAR <= parseInt(maxYear)), (d) => +d.UNITS);
         const selectedSales = d3.sum(selectedCountrySales.get(country).filter(d => d.YEAR >= parseInt(minYear) && d.YEAR <= parseInt(maxYear)), (d) => +d.UNITS);
         console.log(country, selectedSales, totalSales);
         currentData[country] = selectedSales / totalSales;
     });
 
     // Get color scale 
     const colorScale = d3
         .scaleLinear()
         .domain([
             d3.min(Object.values(currentData)),
             d3.max(Object.values(currentData)),
         ])
         .range([0, 1]);
 
 
     const mapGroup = d3.select("#idiom3").select("g");
     Object.keys(currentData).forEach(function(element) {
         //console.log(element);
         mapGroup
             .transition()
             .duration(500)
             .attr("fill", "lightgrey")
             .selectAll("path")
             .filter(function(d) { 
             return d.properties.NAME === element; 
             })
             .attr("fill", d3.interpolateBlues(colorScale(currentData[element])))
             .attr("data", currentData[element]);
         });
 
     const countries = document.querySelectorAll(".country.data");
     countries.forEach((country) => {
         if (selected_countries.length == 0) {
             country.setAttribute("opacity", "1");
             country.setAttribute("stroke-width", "0.5");
         }
         else if (!selected_countries.includes(country.textContent)) {
             country.setAttribute("opacity", "0.5");
             country.setAttribute("stroke-width", "0.5");
         }
         else if (selected_countries.includes(country.textContent)) {
             country.setAttribute("opacity", "1");
             country.setAttribute("stroke-width", "1");
             // redraw them on top
             country.parentNode.appendChild(country);
         }
     });
 }


function update4() {

    svg = d3.select("#idiom4").select("svg");
    const h = svg.attr("height");
    const w = svg.attr("width");
    const prevMinYear = svg.attr("minYear");
    const prevMaxYear = svg.attr("maxYear");
    const height = h - 25;
    const width = w - 25;

    // Values for axes scales
    const maxX = d3.max(d_vehicles, (d) => {
        const air = d_air.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
        const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
        return (air.VALUE / pop.VALUE) * 1000;
    });
    const countryYearGroup = d3.group(d_vehicles, (d) => d.COUNTRY, (d) => d.YEAR);
    const maxY = d3.max(countryYearGroup.entries(), ([country, countryData]) => {
        return d3.max(countryData.entries(), ([year, yearData]) => {
            const units = d3.sum(yearData, (d) => d.UNITS);
            const pop = d_population.find((d) => d.COUNTRY === country && d.YEAR === year);
            return (units / pop.VALUE) * 1000;
        });
    });
    const minR = d3.min(d_vehicles, (d) => {
        const gdp = d_gdp.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
        const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
        return (gdp.VALUE / pop.VALUE) * 1000;
    });
    const maxR = d3.max(d_vehicles, (d) => {
        const gdp = d_gdp.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
        const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
        return (gdp.VALUE / pop.VALUE) * 1000;
    });
    // Create x, y and r scales for the scatter plot
    const xScale = d3
        .scaleLinear()
        .domain([0, 17])
        .range([width-12.5, 25]);
    const yScale = d3
        .scaleLinear()
        .domain([0, 13])
        .range([height-12.5, 25]);
    const rScale = d3
        .scaleRadial()
        .domain([minR, maxR])
        .range([5, 15]);

    // Lines connecting Circles
    {
    svg.selectAll(".line")
    .data(all_countries)
    .enter()
    .append("line")
    .attr("class", "line data")
    .attr("stroke", "url(#line-gradient)")
    .attr("stroke-width", "3")
    .attr("opacity", "0.65")
    .text((c) => c)
    .attr("x1", (c) => {
        const air = d_air.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        return xScale((air.VALUE / pop.VALUE) * 1000);
    })
    .attr("y1", (c) => {
        const units = d3.sum(d_vehicles.filter((o) => o.COUNTRY === c && o.YEAR === minYear), (d) => d.UNITS);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        return yScale((units / pop.VALUE) * 1000);
    })
    .attr("x2", (c) => {
        const air = d_air.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        return xScale((air.VALUE / pop.VALUE) * 1000);
    })
    .attr("y2", (c) => {
        const units = d3.sum(d_vehicles.filter((o) => o.COUNTRY === c && o.YEAR === maxYear), (d) => d.UNITS);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        return yScale((units / pop.VALUE) * 1000);
    });
    }
    // Circles for Min Year
    {
    svg
    .selectAll(".circle-min")
    .data(all_countries)
    .enter()
    .append("circle")
    .attr("class", "circle-min data")
    .attr("fill", "#CC6521")
    .attr("stroke", "black")
    .attr("stroke-width", "1")
    .text((c) => c)
    .on("mouseover", handleMouseOver4)
    .on("mouseout", handleMouseOut4)
    .on("click", handleClick4)
    .attr("x-data", (c) => {
        const air = d_air.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        return ((air.VALUE / pop.VALUE) * 1000).toFixed(1);
    })
    .attr("cx", (c) => {
        const air = d_air.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        return xScale((air.VALUE / pop.VALUE) * 1000);
    })
    .attr("y-data", (c) => {
        const units = d3.sum(d_vehicles.filter((o) => o.COUNTRY === c && o.YEAR === minYear), (d) => d.UNITS);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        return ((units / pop.VALUE) * 1000).toFixed(1);
    })
    .attr("cy", (c) => {
        const units = d3.sum(d_vehicles.filter((o) => o.COUNTRY === c && o.YEAR === minYear), (d) => d.UNITS);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        return yScale((units / pop.VALUE) * 1000);
    })
    .attr("r-data", (c) => {
        const gdp = d_gdp.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        return ((gdp.VALUE / pop.VALUE) * 1000).toFixed(1);
    })
    .attr("r", (c) => {
        const gdp = d_gdp.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === minYear);
        return rScale((gdp.VALUE / pop.VALUE) * 1000);
    });
    }
    // Circles for Max Year
    {
    svg
    .selectAll(".circle-max")
    .data(all_countries)
    .enter()
    .append("circle")
    .attr("class", "circle-max data")
    .attr("fill", "#663210")
    .attr("stroke", "black")
    .attr("stroke-width", "1")
    .text((c) => c)
    .on("mouseover", handleMouseOver4)
    .on("mouseout", handleMouseOut4)
    .on("click", handleClick4)
    .attr("tooltip-data", (c) => {
        const air = d_air.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        const units = d3.sum(d_vehicles.filter((o) => o.COUNTRY === c && o.YEAR === maxYear), (d) => d.UNITS);
        const gdp = d_gdp.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        return [{"x": (air.VALUE / pop.VALUE) * 1000, "y": (units / pop.VALUE) * 1000, "r": (gdp.VALUE / pop.VALUE) * 1000}]
    })
    .attr("x-data", (c) => {
        const air = d_air.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        return ((air.VALUE / pop.VALUE) * 1000).toFixed(1);
    })
    .attr("cx", (c) => {
        const air = d_air.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        return xScale((air.VALUE / pop.VALUE) * 1000);
    })
    .attr("y-data", (c) => {
        const units = d3.sum(d_vehicles.filter((o) => o.COUNTRY === c && o.YEAR === maxYear), (d) => d.UNITS);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        return ((units / pop.VALUE) * 1000).toFixed(1);
    })
    .attr("cy", (c) => {
        const units = d3.sum(d_vehicles.filter((o) => o.COUNTRY === c && o.YEAR === maxYear), (d) => d.UNITS);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        return yScale((units / pop.VALUE) * 1000);
    })
    .attr("r-data", (c) => {
        const gdp = d_gdp.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        return ((gdp.VALUE / pop.VALUE) * 1000).toFixed(1);
    })
    .attr("r", (c) => {
        const gdp = d_gdp.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
        return rScale((gdp.VALUE / pop.VALUE) * 1000);
    });
    }
    // Tick marks and labels for x and y axes
    {
    var xTicks = [], yTicks = []; // Ticks
    for (let index = 0; index <= 1; index += 0.25) {
    xTicks.push(Math.round(xScale.invert(12.5 + index * (width-12.5))));
    yTicks.push(Math.round(yScale.invert(12.5 + index * (height-12.5))));
    }
    svg.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height-12.5})`)
    .call(d3.axisBottom(xScale).tickFormat((d) => d).tickValues(xTicks).tickSizeOuter(0));
    svg.append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${width-12.5},0)`)
    .call(d3.axisRight(yScale).tickFormat((d) => d).tickValues(yTicks).tickSizeOuter(0));
    svg.append("text") // Labels
    .attr("class", "x-axis-label")
    .attr("x", width/2 - 2)
    .attr("y", height+16.5)
    .style("text-anchor", "end")
    .text("Air pollutants")
    .attr("font-weight", "500");
    svg.append("text") // Labels
    .attr("class", "x-axis-label")
    .attr("x", width/2 + 2)
    .attr("y", height+16.5)
    .style("text-anchor", "start")
    .text("(kg per th. people)")
    .attr("font-size", "12px")
    svg.append("text")
    .attr("class", "y-axis-label")
    .attr("x", width-5)
    .attr("y", 20)
    .style("text-anchor", "end")
    .text("Selected vehicles sold")
    .attr("font-weight", "500")
    svg.append("text")
    .attr("class", "y-axis-label")
    .attr("x", width-17)
    .attr("y", 33)
    .style("text-anchor", "end")
    .text("(per th. people)")
    .attr("font-size", "12px")
    }
    // Year Legend
    {
    const yearLegendData = [
    { cx: 20, r: 10, color: "#CC6521", label: minYear },
    { cx: 70, r: 10, color: "#663210", label: maxYear },
    ];
    const yearLegend = svg.append("g")
    .attr("class", "legend")
    .attr("transform", "translate(35, 20)");
    yearLegend.selectAll("line") // Line
    .data(yearLegendData)
    .enter()
    .append("line")
    .attr("x1", yearLegendData[0].cx)
    .attr("y1", 0)
    .attr("x2", yearLegendData[1].cx)
    .attr("y2", 0)
    .attr("stroke", "#994C18")
    .attr("stroke-width", "3")
    .attr("opacity", "0.5");
    yearLegend.selectAll("circle") // Circles
    .data(yearLegendData)
    .enter()
    .append("circle")
    .attr("cx", (d) => d.cx)
    .attr("r", (d) => d.r)
    .attr("fill", (d) => d.color);
    yearLegend.selectAll("text") // Labels
    .data(yearLegendData)
    .enter()
    .append("text")
    .attr("x", (d, i) => {
        if (i === 0) return d.cx - d.r - 30;
        if (i === 1) return d.cx + d.r + 5;
    })
    .attr("y", (d) => d.r / 2)
    .attr("font-size", "12px")
    .attr("font-weight", "600")
    .text((d) => d.label);
    }
    // GDP Legend
    {
    const gdpLegendData = [
    { cx: 0, r: 5, label: rScale.invert(5).toFixed(0) },
    { cx: 15 + 25, r: 10, label: rScale.invert(10).toFixed(0) },
    { cx: 40 + 50, r: 15, label: rScale.invert(15).toFixed(0) }
    ];
    const gdpLegend = svg.append("g")
    .attr("class", "gdp-legend")
    .attr("transform", "translate(20, 50)");
    gdpLegend.selectAll("circle")
    .data(gdpLegendData)
    .enter()
    .append("circle")
    .attr("r", (d) => d.r)
    .attr("cx", (d) => d.cx)
    .attr("cy", 18)
    .attr("fill", "transparent")
    .attr("stroke", "black")
    .attr("stroke-width", "1");
    gdpLegend.selectAll("text")
    .data(gdpLegendData)
    .enter()
    .append("text")
    .text((d) => d.label)
    .attr("x", (d) => d.cx + d.r + 5)
    .attr("y", 22)
    .attr("font-size", "12px");
    gdpLegend.append("text")
    .text("GDP")
    .attr("font-weight", "500")
    .attr("x", -6)
    .attr("y", 0);
    gdpLegend.append("text")
    .text("(mill. € per th. people)")
    .attr("font-size", "12px")
    .attr("x", 30)
    .attr("y", -1.5);
    }

    // Selection changes
    const circles_min = document.querySelectorAll(".circle-min.data");
    const circles_max = document.querySelectorAll(".circle-max.data");
    const circles = [...circles_min, ...circles_max];
    circles.forEach((circle) => {
        if (selected_countries.length == 0) {
            circle.setAttribute("opacity", "1");
            circle.setAttribute("stroke-width", "1")
        }
        else if (!selected_countries.includes(circle.textContent)) {
            circle.setAttribute("opacity", "0.65");
            circle.setAttribute("stroke-width", "1")
        }
        else if (selected_countries.includes(circle.textContent)) {
            circle.setAttribute("opacity", "1");
            circle.setAttribute("stroke-width", "1.5");
            circle.parentNode.appendChild(circle); // redraw them on top
        }
    });
    // Year changes
    if (minYear != 2014 || maxYear != 2022) {
        const lines = document.querySelectorAll(".line");
        const circles_min = document.querySelectorAll(".circle-min");
        const circles_max = document.querySelectorAll(".circle-max");
        marks = [...lines, ...circles_min, ...circles_max];
        marks.forEach((mark) => mark.remove());
    }
}


function updateDotPlot() {
    const dots = document.querySelectorAll(".dot")
    dots.forEach((dot) => {
        if (selected_countries.length == 0) {
            dot.setAttribute("opacity", "1");
            dot.setAttribute("stroke-width", "0.5");
        }
        else if (!selected_countries.includes(dot.getAttribute("country"))) {
            dot.setAttribute("opacity", "0.4");
            dot.setAttribute("stroke-width", "0.5");
        }
        else if (selected_countries.includes(dot.getAttribute("country"))) {
            dot.setAttribute("opacity", "1");
            dot.setAttribute("stroke-width", "1.5");
            dot.parentNode.appendChild(dot);
        }
    });
}