function updateChoropleth() {

   /*  // Recompute data for selected countries
    const totalCountrySales = d3.group(gd_vehicles, (d) => d.COUNTRY);
    const selectedCountrySales = d3.group(d_vehicles, (d) => d.COUNTRY);

    // Initialize an empty object to store the aggregated data
    var currentData = {};

    totalCountrySales.forEach((sales, country) => {
        const totalSales = d3.sum(sales, (d) => +d.UNITS);
        const selectedSales = d3.sum(selectedCountrySales.get(country), (d) => +d.UNITS);
        currentData[country] = selectedSales / totalSales;
    });

    // Get color scale 
    const colorScale = d3
        .scaleLog()
        .domain([
            d3.min(Object.values(currentData)),
            d3.max(Object.values(currentData)),
        ])
        .range([0, 1]);

    // Transition not selected
    d3.selectAll(".country")
        .filter(d => !selected_countries.includes(d.properties.NAME))
        .transition()
        .duration(300)
        // set opacity to 0.5
        .attr("opacity", 0.5)


    console.log(d3.selectAll(".country"));
    // Transition selected
    d3.selectAll(".country")
        .filter(d => selected_countries.includes(d.properties.NAME))
        .transition()
        .duration(300)
        // set opacity to 1
        .attr("opacity", 1)
        // set fill to colorScale
        .attr("fill", d => d3.interpolateBlues(colorScale(currentData[d.properties.NAME]))) */

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


function updateIdiom4() {
    const circles_min = document.querySelectorAll(".circle-min.data");
    const circles_max = document.querySelectorAll(".circle-max.data");

    const circles = [...circles_min, ...circles_max];

    circles.forEach((circle) => {
        console.log("bro");
        // if textContent is in selected_countries
        if (selected_countries.length == 0) {
            circle.setAttribute("opacity", "1");
            circle.setAttribute("stroke-width", "0.5")
        }
        else if (!selected_countries.includes(circle.textContent)) {
            circle.setAttribute("opacity", "0.5");
            circle.setAttribute("stroke-width", "0.5")
        }
        else if (selected_countries.includes(circle.textContent)) {
            circle.setAttribute("opacity", "1");
            circle.setAttribute("stroke-width", "1.5");
            console.log("yeet");
            // redraw them on top
            circle.parentNode.appendChild(circle);
        }
    });
}