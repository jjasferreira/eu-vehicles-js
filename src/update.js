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
    const prevMinYear = +svg.attr("minYear");
    const prevMaxYear = +svg.attr("maxYear");

    // Selection changes
    {
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
    }
    // Year changes
    if (minYear != prevMinYear) {
        svg.attr("minYear", minYear);
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
            });
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
    const margin = { top: 40, right: 40, bottom: 40, left: 80 };
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

    const filteredAverageData = averageData.filter((d) => d.INDEX !== "Quality of Life");
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