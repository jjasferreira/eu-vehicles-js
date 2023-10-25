function handleMouseOverChoropleth(event, item) {
    if (all_countries.includes(item.properties.NAME)) {
        this.setAttribute("stroke-width", "1.5");
        this.setAttribute("stroke", "rgb(240, 70, 70)");
        this.parentNode.appendChild(this); // move country to end of parent's child nodes
        // find circles in idiom4
        const circles_min = document.querySelectorAll(".circle-min.data");
        const circles_max = document.querySelectorAll(".circle-max.data");
        
        const circles = [...circles_min, ...circles_max];

        circles.forEach((circle) => {
            if (circle.textContent === item.properties.NAME) {
                circle.setAttribute("stroke", "yellow");
                circle.setAttribute("stroke-width", "1.5");
                circle.parentNode.appendChild(circle); // move circle to end of parent's child nodes
            }
        });
        // tooltip already exists

        tooltip3
            .style("left", event.pageX + "px")
            .style("top", event.pageY + "px")
            
        // select tooltip div and update its text
        tooltip3
            .select("div")
            // Add a rectangle behind the tooltip text
            .html(`Country: ${item.properties.NAME} <br> Ratio of selected vehicle sales to total: ${(100*this.getAttribute("data")).toFixed(2)}% <br>`);
        
        // Show the tooltip
        tooltip3.transition()
            .duration(200)
            .style("opacity", 0.9)
            .style("visibility", "visible");
    }
}

function handleMouseOutChoropleth(event, item) {
    if (!selected_countries.includes(item.properties.NAME)) {
        this.setAttribute("stroke-width", "0.5");
    }
    this.setAttribute("stroke", "black");

    const circles_min = document.querySelectorAll(".circle-min.data");
    const circles_max = document.querySelectorAll(".circle-max.data");
    circles_min.forEach((circle) => {
        if (circle.textContent === item.properties.NAME) {
            if (!selected_countries.includes(circle.textContent)) {
                circle.setAttribute("stroke-width", "0.5");
            }
            circle.setAttribute("stroke", "black");
        }
    });
    circles_max.forEach((circle) => {
        if (circle.textContent === item.properties.NAME) {
            if (!selected_countries.includes(circle.textContent)) {
                circle.setAttribute("stroke-width", "0.5");
            }
            circle.setAttribute("stroke", "black");
        }
    });
    tooltip3.transition()
        .duration(200)
        .style("opacity", 0)
        .style("visibility", "hidden");
        
}

function handleClickChoropleth(event, item) {
    if (!all_countries.includes(item.properties.NAME)) {
        return;
    } // make sure it's an EU country
    if (selected_countries.includes(item.properties.NAME)) {
        selected_countries.splice(selected_countries.indexOf(item.properties.NAME), 1);
        updateIdiom4();
        updateChoropleth();
        return;
    }
    selected_countries.push(item.properties.NAME);
    updateIdiom4();
    updateChoropleth();
}

function deselectAll() {
    // clear selected_countries
    selected_countries = [];
    // clear clones
    const clones = document.querySelectorAll(".clone");
    clones.forEach((clone) => clone.remove());
    updateChoropleth();
    updateIdiom4();

}

function handleMouseOver4(event, item) {
    // Changes on Idiom 3
    const countries = document.querySelectorAll(".country.data");
    countries.forEach((country) => {
        if (country.textContent === item) {
            country.setAttribute("stroke", "rgb(240, 70, 70)");
            country.setAttribute("stroke-width", "1.5");
        }
    });
    // Changes on Idiom 4
    document.querySelectorAll(".line.data").forEach((line) => {
        if (line.textContent === item) {
            line.setAttribute("stroke", "yellow");
            line.setAttribute("opacity", "1");
            line.parentNode.appendChild(line);
        }
    });
    const circles_min = document.querySelectorAll(".circle-min.data");
    const circles_max = document.querySelectorAll(".circle-max.data");
    circles = [...circles_min, ...circles_max];
    circles.forEach((circle) => {
        if (circle.textContent === item) {
            circle.setAttribute("stroke", "yellow");
            circle.setAttribute("stroke-width", "1.5");
            circle.parentNode.appendChild(circle);
        }
    });
    // Show the tooltip
    tooltip4
        .transition()
        .duration(250)
        .style("opacity", 0.9);
    tooltip4
        .html(`<strong> ${item} </strong> <br>
        <i>Air pollutants: </i> ${(this.getAttribute("x-data"))} kg <br>
        <i>Selected vehicles sold: </i> ${(this.getAttribute("y-data"))} <br>
        <i>GDP: </i> €${(this.getAttribute("r-data"))}M`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 30) + "px")
        .style("visibility", "visible");
}

function handleMouseOut4(event, item) {
    if (!selected_countries.includes(item)) {        
        this.setAttribute("stroke-width", "0.5");
    }
    this.setAttribute("stroke", "black");
    // Changes on Idiom 3
    const countries = document.querySelectorAll(".country.data");
    countries.forEach((country) => {
        if (country.textContent === item) {
            if (!selected_countries.includes(country.textContent)) {
                country.setAttribute("stroke-width", "0.5");
            }
            country.setAttribute("stroke", "black");
        }
    });
    // Changes on Idiom 4
    document.querySelectorAll(".line.data").forEach((line) => {
        if (line.textContent === item) {
            line.setAttribute("stroke", "url(#line-gradient)");
            line.setAttribute("opacity", "0.65");
            line.parentNode.appendChild(line);
        }
    });
    const circles_min = document.querySelectorAll(".circle-min.data");
    const circles_max = document.querySelectorAll(".circle-max.data");
    circles = [...circles_min, ...circles_max];
    circles.forEach((circle) => {
        if (circle.textContent === item) {
            circle.setAttribute("stroke", "black");
            circle.setAttribute("stroke-width", "1");
            circle.parentNode.appendChild(circle);
        }
    });
    // Hide the tooltip
    tooltip4
        .transition()
        .duration(500)
        .style("opacity", 0)
        .style("visibility", "hidden");
}

function handleClick4(event, item) {
    if (selected_countries.includes(item.COUNTRY)) {
        selected_countries.splice(selected_countries.indexOf(item.COUNTRY), 1);
    } else {
        selected_countries.push(item.COUNTRY);
    }
    console.log("I'm here")
    updateChoropleth();
    updateIdiom4();
}


// Cleveland dot Plot Mouse over interactions
function handleMouseOver2(event, item) {
    // Show the tooltip
    tooltip4
        .transition()
        .duration(250)
        .style("opacity", 0.9);
    tooltip4
        .html(`<strong> ${item.COUNTRY} </strong> <br>
        <i>${item.INDEX}: </i> ${parseFloat(item.VALUE).toFixed(2)}<br>`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 30) + "px")
        .style("visibility", "visible");
}
// Cleveland dot Plot Mouse out interactions
function handleMouseOut2(event, item) {
    // Hide the tooltip
    tooltip4
        .transition()
        .duration(500)
        .style("opacity", 0)
        .style("visibility", "hidden");
}