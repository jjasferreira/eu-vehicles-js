function updateLineChart() {
    var selectedYearlySales = [];

    // Loop through the data to calculate the total sales for each year
    d_vehicles.forEach(function(d) {
    var year = parseInt(d.YEAR);
    var units = +d.UNITS; // Convert units to a number
    var yearEntry = selectedYearlySales.find(entry => entry.YEAR === year);

    if (yearEntry && (selected_countries.includes(d.COUNTRY) || selected_countries.length == 0)) {
        yearEntry.UNITS += units; // Add to existing total
    } else if (selected_countries.includes(d.COUNTRY) || selected_countries.length == 0){
        selectedYearlySales.push({ YEAR: year, UNITS: units }); // Initialize if it doesn't exist
    }
    });

    const height = d3.select("#idiom1").node().getBoundingClientRect().height;
    const width = d3.select("#idiom1").node().getBoundingClientRect().width;
    const margin = {top: 20, right: 20, bottom: 25, left: 60};

    console.log(selectedYearlySales);

    const xScale = d3
    .scalePoint()
    .domain(selectedYearlySales.map(d => d.YEAR)) // Use map to extract years from the array of objects
    .range([0, width - margin.left - margin.right])
    .padding(0.1);
    const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(selectedYearlySales, d => d.UNITS)]) // Use the maximum UNITS value
    .range([height - margin.top - margin.bottom, 0]);

    const line = d3.line()
    .x((d) => xScale(d.YEAR))
    .y((d) => yScale(d.UNITS));

    const svg = d3.select("#idiom1").select("svg");

    svg.select("path.line")
    .datum(selectedYearlySales)
    .transition()
    .duration(500)
    .attr("d", line);

    // update x-axis
    svg.select(".x-axis")
    .transition()
    .duration(500)
    .call(d3.axisBottom(xScale));

    // update y-axis
    svg.select(".y-axis")
    .transition()
    .duration(500)
    .call(d3.axisLeft(yScale).ticks(5));

    // update circles
    svg.selectAll(".circle.data")
    .data(selectedYearlySales)
    .transition()
    .duration(500)
    .attr("cx", d => xScale(d.YEAR))
    .attr("cy", d => yScale(d.UNITS));
}

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
            country.parentNode.appendChild(country); // redraw them on top
        }
    });
}

function update4() {

    svg = d3.select("#idiom4").select("svg");
    const prevMinYear = +svg.attr("minYear");
    const prevMaxYear = +svg.attr("maxYear");

    // Selection changes
    {
        const lines = document.querySelectorAll(".line.data");
        lines.forEach((line) => {
            if (selected_countries.length == 0) {
                line.setAttribute("opacity", "0.65");
                line.setAttribute("stroke-width", "3");
                line.setAttribute("stroke", "url(#line-gradient)");
            }
            else if (!selected_countries.includes(line.getAttribute("country"))) {
                line.setAttribute("opacity", "0.2");
            }
            else if (selected_countries.includes(line.getAttribute("country"))) {
                line.setAttribute("opacity", "1");
                line.setAttribute("stroke-width", "4");
                line.setAttribute("stroke", "black");
                line.parentNode.appendChild(line); // redraw them on top
            }
        });
        const circles_min = document.querySelectorAll(".circle-min.data");
        const circles_max = document.querySelectorAll(".circle-max.data");
        const circles = [...circles_min, ...circles_max];
        circles.forEach((circle) => {
            if (selected_countries.length == 0) {
                circle.setAttribute("opacity", "1");
                circle.setAttribute("stroke-width", "1")
            }
            else if (!selected_countries.includes(circle.getAttribute("country"))) {
                circle.setAttribute("opacity", "0.3");
            }
            else if (selected_countries.includes(circle.getAttribute("country"))) {
                circle.setAttribute("opacity", "1");
                circle.setAttribute("stroke-width", "2");
                circle.parentNode.appendChild(circle); // redraw them on top
            }
        });
    }
    // Year changes
    if (minYear != prevMinYear || maxYear != prevMaxYear) {

        // Get the values of height and width
        const width = +svg.attr("width") - 25;
        const height = +svg.attr("height") - 25;
        // Set new min and max year
        svg.attr("minYear", minYear);
        svg.attr("maxYear", maxYear);

        // Recalculate values for axes scales
        const cd_vehicles = d_vehicles.filter((d) => d.YEAR >= minYear && d.YEAR <= maxYear);
        const maxX = d3.max(cd_vehicles, (d) => {
            const air = d_air.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
            const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
            return (air.VALUE / pop.VALUE) * 1000;
        });
        const countryYearGroup = d3.group(cd_vehicles, (d) => d.COUNTRY, (d) => d.YEAR);
        const maxY = d3.max(countryYearGroup.entries(), ([country, countryData]) => {
            return d3.max(countryData.entries(), ([year, yearData]) => {
                const units = d3.sum(yearData, (d) => d.UNITS);
                const pop = d_population.find((d) => d.COUNTRY === country && d.YEAR === year);
                return (units / pop.VALUE) * 1000;
            });
        });
        const minR = d3.min(cd_vehicles, (d) => {
            const gdp = d_gdp.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
            const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
            return (gdp.VALUE / pop.VALUE) * 1000;
        });
        const maxR = d3.max(cd_vehicles, (d) => {
            const gdp = d_gdp.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
            const pop = d_population.find((o) => o.COUNTRY === d.COUNTRY && o.YEAR === d.YEAR);
            return (gdp.VALUE / pop.VALUE) * 1000;
        });
        // Create x, y and r scales for the scatter plot
        const xScale = d3
            .scaleLinear()
            .domain([0, maxX*1.05])
            .range([width-12.5, 25]);
        const yScale = d3
            .scaleLinear()
            .domain([0, maxY*1.05])
            .range([height-12.5, 25]);
        const rScale = d3
            .scaleRadial()
            .domain([minR, maxR])
            .range([5, 15]);

        // Update lines connecting circles
        {
            svg.selectAll(".line.data")
                .transition()
                .duration(500)
                .attr("x1", function() {
                    const c = d3.select(this).attr("country");
                    const air = d_air.find((o) => o.COUNTRY === c && o.YEAR === minYear);
                    const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === minYear);
                    return xScale((air.VALUE / pop.VALUE) * 1000);
                })
                .attr("y1", function() {
                    const c = d3.select(this).attr("country");
                    const units = d3.sum(d_vehicles.filter((o) => o.COUNTRY === c && o.YEAR === minYear), (d) => d.UNITS);
                    const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === minYear);
                    return yScale((units / pop.VALUE) * 1000);
                })
                .attr("x2", function() {
                    const c = d3.select(this).attr("country");
                    const air = d_air.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
                    const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
                    return xScale((air.VALUE / pop.VALUE) * 1000);
                })
                .attr("y2", function() {
                    const c = d3.select(this).attr("country");
                    const units = d3.sum(d_vehicles.filter((o) => o.COUNTRY === c && o.YEAR === maxYear), (d) => d.UNITS);
                    const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
                    return yScale((units / pop.VALUE) * 1000);
                });
        }
        // Update circles for min year
        {
            svg.selectAll(".circle-min.data")
                .transition()
                .duration(500)
                .attr("cx", function() {
                    const c = d3.select(this).attr("country");
                    const air = d_air.find((o) => o.COUNTRY === c && o.YEAR === minYear);
                    const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === minYear);
                    return xScale((air.VALUE / pop.VALUE) * 1000);
                })
                .attr("cy", function() {
                    const c = d3.select(this).attr("country");
                    const units = d3.sum(d_vehicles.filter((o) => o.COUNTRY === c && o.YEAR === minYear), (d) => d.UNITS);
                    const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === minYear);
                    return yScale((units / pop.VALUE) * 1000);
                })
                .attr("r", function() {
                    const c = d3.select(this).attr("country");
                    const gdp = d_gdp.find((o) => o.COUNTRY === c && o.YEAR === minYear);
                    const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === minYear);
                    return rScale((gdp.VALUE / pop.VALUE) * 1000);
                });
        }
        // Update circles for max year
        {
            svg.selectAll(".circle-max.data")
                .transition()
                .duration(500)
                .attr("cx", function() {
                    const c = d3.select(this).attr("country");
                    const air = d_air.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
                    const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
                    return xScale((air.VALUE / pop.VALUE) * 1000);
                })
                .attr("cy", function() {
                    const c = d3.select(this).attr("country");
                    const units = d3.sum(d_vehicles.filter((o) => o.COUNTRY === c && o.YEAR === maxYear), (d) => d.UNITS);
                    const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
                    return yScale((units / pop.VALUE) * 1000);
                })
                .attr("r", function() {
                    const c = d3.select(this).attr("country");
                    const gdp = d_gdp.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
                    const pop = d_population.find((o) => o.COUNTRY === c && o.YEAR === maxYear);
                    return rScale((gdp.VALUE / pop.VALUE) * 1000);
                });
        }
        // Update tick marks and labels
        {
            var xTicks = [], yTicks = []; // Ticks
            for (let index = 0; index <= 1; index += 0.25) {
                xTicks.push(Math.round(xScale.invert(30 + index * (width - 37.5))));
                yTicks.push(Math.round(yScale.invert(30 + index * (height - 37.5))));
            }
            svg.select(".x-axis")
                .transition()
                .duration(500)
                .call(d3.axisBottom(xScale).tickFormat((d) => d).tickValues(xTicks).tickSizeOuter(0));
            svg.select(".y-axis")
                .transition()
                .duration(500)
                .call(d3.axisRight(yScale).tickFormat((d) => d).tickValues(yTicks).tickSizeOuter(0));
        }
        // Update Year Legend
        {
            const yearLegendData = [
                { cx: 20, r: 10, color: "#CC6521", label: minYear },
                { cx: 70, r: 10, color: "#663210", label: maxYear },
            ];
            svg.select(".year-legend").selectAll("text").remove();
            svg.select(".year-legend").selectAll("text")
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
        // Update GDP Legend
        {
            const gdpLegendData = [
                { cx: 0, r: 5, label: rScale.invert(5).toFixed(0) },
                { cx: 15 + 25, r: 10, label: rScale.invert(10).toFixed(0) },
                { cx: 40 + 50, r: 15, label: rScale.invert(15).toFixed(0) }
            ];
            svg.select(".gdp-legend").selectAll("text").remove();
            svg.select(".gdp-legend").selectAll("test")
                .data(gdpLegendData)
                .enter()
                .append("text")
                .text((d) => d.label)
                .attr("x", (d) => d.cx + d.r + 5)
                .attr("y", 22)
                .attr("font-size", "12px");
            svg.select(".gdp-legend").append("text")
                .text("GDP")
                .attr("font-weight", "500")
                .attr("x", -6)
                .attr("y", 0);
            svg.select(".gdp-legend").append("text")
                .text("(mill. € per th. people)")
                .attr("font-size", "12px")
                .attr("x", 30)
                .attr("y", -1.5);

        }
    }
}

function updateDotPlot() {
    const dots = document.querySelectorAll(".dot");
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

    svg = d3.select("#idiom2").select("svg");
    const t = d3.transition().duration(1000); // Transition duration in milliseconds
    const margin = { top: 40, right: 40, bottom: 30, left: 80 };
    const container = d3.select("#idiom2");
    const height = container.node().clientHeight - margin.bottom - margin.top;
    const width = container.node().clientWidth - margin.left - margin.right;

    // Update the Indexes values using minYear and maxYear
    // Function to calculate the average value for each index type for each country for selected years
    function calculateAverageValues(data, minYear, maxYear) {
        const countryIndexAverages = {}

        data.forEach((d) => {
        const year = +d.YEAR;
        if (year >= minYear && year <= maxYear) {
            const key = d.COUNTRY;
            if (!countryIndexAverages[key]) {
            countryIndexAverages[key] = {};
            }
            if (!countryIndexAverages[key][d.INDEX]) {
            countryIndexAverages[key][d.INDEX] = { sum: 0, count: 0 };
            }
            countryIndexAverages[key][d.INDEX].sum += +d.VALUE;
            countryIndexAverages[key][d.INDEX].count += 1;
        }
        });

        const averages = [];

        for (const country in countryIndexAverages) {
        for (const index in countryIndexAverages[country]) {
            const avg = countryIndexAverages[country][index].sum / countryIndexAverages[country][index].count;
            averages.push({ COUNTRY: country, INDEX: index, VALUE: avg });
        }
        }

        return averages;
    }

    const averageData = calculateAverageValues(gd_indexes, minYear, maxYear);

    const filteredAverageData = averageData.filter((d) => !deactivatedIndexes.includes(d.INDEX));

    // Create a scale for the x-axis (index values)
    const xScale = d3
        .scaleLinear()
        .domain([0, d3.max(filteredAverageData, (d) => +d.VALUE)])
        .range([0, width]);

    // Update y-axis with transition
    svg.select(".x-axis")
        .transition(t)
        .call(d3.axisBottom(xScale));

    // Update the position of dots with transition
    dots.forEach((dot) => {
        const index = dot.getAttribute("index");
        if (deactivatedIndexes.includes(index)){
            dot.setAttribute("opacity", "0");
            return;
        }
        else {
            dot.setAttribute("opacity", "1");
        }
        const country = dot.getAttribute("country");
        function findDataPointByCountryAndIndex(country, index) {
            return filteredAverageData.find((dataPoint) => dataPoint.COUNTRY === country && dataPoint.INDEX === index);
        }
        const value = findDataPointByCountryAndIndex(country, index)
        const x = xScale(value.VALUE);

        d3.select(dot)
            .transition(t)
            .attr("cx", x);
    });

    // Update the y-axis scale with the new order of selectedCountries
    const yScale = d3
        .scaleBand()
        .domain(all_countries)
        .range([height, margin.top])
        .padding(0.2);

    // Update y-axis with transition
    svg.select(".y-axis")
        .transition(t)
        .call(d3.axisLeft(yScale));

    // Update the position of dots with transition
    dots.forEach((dot) => {
        const country = dot.getAttribute("country");
        const y = yScale(country) + yScale.bandwidth() / 2;

        d3.select(dot)
            .transition(t)
            .attr("cy", y);
    });
}

function update5() {
    svg = d3.select("#idiom5").select("svg");
    const prevMinYear = +svg.attr("minYear");
    const prevMaxYear = +svg.attr("maxYear");
    const prevCountries = svg.attr("countries").split(",");

    if (minYear == prevMinYear && maxYear == prevMaxYear && selected_countries == prevCountries) {
        return;
    }
    // If there have been changes, update the rectangles of heatmap
    console.log(gd_vehicles);
    const cd_vehicles = gd_vehicles.filter((d) => d.YEAR >= minYear && d.YEAR <= maxYear && (selected_countries.includes(d.COUNTRY) || selected_countries.length == 0));
    console.log("cd_vehicles", cd_vehicles);
    // Group data by vehicle and fuel type
    const groupByVehicleFuel = d3.group(cd_vehicles, d => d.VEHICLE, d => d.FUEL);
    // For each vehicle and fuel, sum the units
    const vehicleFuelUnits = [];
    groupByVehicleFuel.forEach((fuelMap, vehicle) => {
        fuelMap.forEach((units, fuel) => {
        vehicleFuelUnits.push({ vehicle, fuel, units: d3.sum(units, d => d.UNITS) });
        });
    });
    // Compute total units sold across all vehicles and fuels
    const totalUnits = d3.sum(vehicleFuelUnits, d => d.units);

    const fuelUnits = {};
    vehicleFuelUnits.forEach(d => {
        if (!fuelUnits[d.fuel]) {
        fuelUnits[d.fuel] = 0;
        }
        fuelUnits[d.fuel] += d.units;
    });
    const vehicleUnits = {};
    vehicleFuelUnits.forEach(d => {
        if (!vehicleUnits[d.vehicle]) {
        vehicleUnits[d.vehicle] = 0;
        }
        vehicleUnits[d.vehicle] += d.units;
    });
    console.log("vehicleUnits", vehicleUnits);
    console.log("fuelUnits", fuelUnits);

    // update each square with transition of 500ms to new values (attr units, attr share attr share-vehicle attr share-fuel attr fill)
    const rects = svg.selectAll(".rect.rect");
    //change data
    rects.data(vehicleFuelUnits).enter();
    console.log(rects);
    rects.each(function() {
        const rect = d3.select(this);
        /* console.log(rect);
        const vehicle = rect.attr("vehicle");
        const fuel = rect.attr("fuel");
        const units = vehicleFuelUnits.find(d => d.vehicle === vehicle && d.fuel === fuel).units;
        const share = units / totalUnits;
        const shareVehicle = units / d3.sum(vehicleFuelUnits.filter(d => d.vehicle === vehicle), d => d.units);
        const shareFuel = units / d3.sum(vehicleFuelUnits.filter(d => d.fuel === fuel), d => d.units); */
        rect
            .transition()
            .duration(500)
            .attr("units", d => d.units)
            .attr("share", d => d.units / totalUnits)
            .attr("share-vehicle", d => ((d.units/vehicleUnits[d.vehicle])*100).toFixed(1))
            .attr("share-fuel", d => ((d.units/fuelUnits[d.fuel])*100).toFixed(1))
            .attr("fill", d => {
                // create color scale with domain going from 0 to max share for each fuel type
                const colorScale = d3.scaleLinear()
                  .domain([0, d3.max(vehicleFuelUnits.filter(o => o.fuel === d.fuel), d => d.units/fuelUnits[d.fuel])])
                  .range([0, 1]);
                console.log(d.units/fuelUnits[d.fuel], d.units, fuelUnits[d.fuel]);
                const color = d3.interpolateGreens(colorScale(d.units/fuelUnits[d.fuel]));
                return color;
              });
    });
        
}