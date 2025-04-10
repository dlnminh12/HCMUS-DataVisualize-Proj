// ------------------ Chart for Heart Disease by Age Group ------------------ //
const svg4 = d3.select("#grouped-bar-chart-age-heart-status"),
    width4 = +svg4.attr("width"),
    height4 = +svg4.attr("height"),
    margin4 = { top: 40, right: 30, bottom: 50, left: 60 },
    chartWidth4 = width4 - margin4.left - margin4.right,
    chartHeight4 = height4 - margin4.top - margin4.bottom;

const chart4 = svg4.append("g")
    .attr("transform", `translate(${margin4.left},${margin4.top})`);

// Age grouping function
function getAgeGroup(age) {
    age = +age;
    if (age < 30) return "<30";
    else if (age <= 40) return "30-40";
    else if (age <= 50) return "41-50";
    else if (age <= 60) return "51-60";
    else return ">60";
}

d3.csv("../data/project_heart_disease.csv").then(function(data) {
    data.forEach(d => {
        d["Heart Disease Status"] = d["Heart Disease Status"].trim();
        d.Age = +d.Age;
        d.AgeGroup = getAgeGroup(d.Age);
    });

    // Group → Compare → Count
    const grouped = d3.rollup(
        data,
        v => v.length,
        d => d.AgeGroup,
        d => d["Heart Disease Status"]
    );

    const keys = ["Yes", "No"];
    const chartData = Array.from(grouped, ([ageGroup, values]) => {
        const row = { AgeGroup: ageGroup };
        keys.forEach(k => {
            row[k] = values.get(k) || 0;
        });
        return row;
    });

    // Scales
    const x0 = d3.scaleBand()
        .domain(chartData.map(d => d.AgeGroup))
        .range([0, chartWidth4])
        .padding(0.4);

    const x1 = d3.scaleBand()
        .domain(keys)
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d3.max(keys, key => d[key]))])
        .nice()
        .range([chartHeight4, 0]);

    const color = d3.scaleOrdinal()
        .domain(keys)
        .range(["#4daf4a", "#e41a1c"]);

    // Tooltip
    const tooltip = d3.select("#tooltip");

    chart4.append("g")
        .selectAll("g")
        .data(chartData)
        .join("g")
        .attr("transform", d => `translate(${x0(d.AgeGroup)},0)`)
        .selectAll("rect")
        .data(d => keys.map(key => ({ key, value: d[key], total: d["Yes"] + d["No"], ageGroup: d.AgeGroup })))
        .join("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => chartHeight4 - y(d.value))
        .attr("fill", d => color(d.key))
        .on("mouseover", function (event, d) {
            tooltip.style("display", "block")
                .html(`
                    <strong>Age Group:</strong> ${d.ageGroup}<br>
                    <strong>Heart Disease ${d.key}:</strong> ${d.value}
                `);
            d3.select(this).style("opacity", 0.8);
        })
        .on("mousemove", function (event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function () {
            tooltip.style("display", "none");
            d3.select(this).style("opacity", 1);
        });

    // Axes
    chart4.append("g")
        .attr("transform", `translate(0,${chartHeight4})`)
        .call(d3.axisBottom(x0));

    chart4.append("g")
        .call(d3.axisLeft(y));

    // X-Y Axis Labels
    chart4.append("text")
        .attr("x", chartWidth4 / 2)
        .attr("y", chartHeight4 + 40)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#ffffff")
        .text("Age Group");

    chart4.append("text")
        .attr("x", -(chartHeight4 / 2))
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .style("font-size", "14px")
        .style("fill", "#ffffff")
        .text("Records");

    // Legend
    const legend = svg4.append("g")
        .attr("transform", `translate(${width4 - 200}, 20)`);

    keys.forEach((key, i) => {
        const g = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
        g.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(key));
        g.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .text(`Heart Disease: ${key}`)
            .style("fill", "#ffffff");
    });
});
