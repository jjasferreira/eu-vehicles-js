function handleMouseOverChoropleth(event, item) {
    this.setAttribute("stroke-width", "1.5");
    this.setAttribute("stroke", "rgb(240, 70, 70)");
    this.parentNode.appendChild(this); // move country to end of parent's child nodes
    // find circles in idiom4
    const circles_min = document.querySelectorAll(".circle-min.data");
    const circles_max = document.querySelectorAll(".circle-max.data");
    
    const circles = [...circles_min, ...circles_max];

    circles.forEach((circle) => {
        if (circle.textContent === item.properties.NAME) {
            circle.setAttribute("stroke-width", "1.5");
            circle.setAttribute("stroke", "rgb(240, 70, 70)");
            circle.parentNode.appendChild(circle); // move circle to end of parent's child nodes
        }
    });
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
}

function handleClickChoropleth(event, item) {
    if (!euCountriesMap.includes(item.properties.NAME)) {
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

}

function handleMouseOverIdiom4(event, item) {
    
    const countries = document.querySelectorAll(".country.data");
    countries.forEach((country) => {
        if (country.textContent === item.COUNTRY) {
            country.setAttribute("stroke", "rgb(240, 70, 70)");
            country.setAttribute("stroke-width", "1.5");
        }
    });

    //select corresponding circle. If it is a circlemin, select the circlemax with the same .COUNTRY

    const circles_min = document.querySelectorAll(".circle-min.data");
    const circles_max = document.querySelectorAll(".circle-max.data");

    circles = [...circles_min, ...circles_max];

    circles.forEach((circle) => {
        if (circle.textContent === item.COUNTRY) {
            circle.setAttribute("stroke-width", "1.5");
            circle.setAttribute("stroke", "rgb(240, 70, 70)");
            circle.parentNode.appendChild(circle); // move circle to end of parent's child nodes
        }
    });

    tooltip4.transition().duration(200).style("opacity", 0.9);
    tooltip4
        .html(`<strong>Country: </strong> ${item.COUNTRY} <br>}`)
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 30) + "px");
}

function handleMouseOutIdiom4(event, item) {
    if (!selected_countries.includes(item.COUNTRY)) {        
        this.setAttribute("stroke-width", "0.5");
    }
    this.setAttribute("stroke", "black");

    const countries = document.querySelectorAll(".country.data");
    countries.forEach((country) => {
        if (country.textContent === item.COUNTRY) {
            if (!selected_countries.includes(country.textContent)) {
                country.setAttribute("stroke-width", "0.5");
            }
            country.setAttribute("stroke", "black");
        }
    });

    const circles_min = document.querySelectorAll(".circle-min.data");
    const circles_max = document.querySelectorAll(".circle-max.data");

    circles = [...circles_min, ...circles_max];

    circles.forEach((circle) => {
        if (circle.textContent === item.COUNTRY) {
            circle.setAttribute("stroke-width", "0.5");
            circle.setAttribute("stroke", "black");
            circle.parentNode.appendChild(circle); // move circle to end of parent's child nodes
        }
    });
}

function handleClickIdiom4(event, item) {
    if (selected_countries.includes(item.COUNTRY)) {
        selected_countries.splice(selected_countries.indexOf(item.COUNTRY), 1);
    } else {
        selected_countries.push(item.COUNTRY);
    }
    console.log("I'm here")
    updateChoropleth();
    updateIdiom4();
}