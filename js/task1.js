// ------------------ Chart for Task 1 ------------------- //
const svg4 = d3.select("#grouped-bar-chart-age-heart-status"),
    width4 = +svg4.attr("width"),
    height4 = +svg4.attr("height"),
    margin4 = { top: 40, right: 30, bottom: 50, left: 60 },
    chartWidth4 = width4 - margin4.left - margin4.right,
    chartHeight4 = height4 - margin4.top - margin4.bottom;

const chart4 = svg4.append("g")
    .attr("transform", `translate(${margin4.left},${margin4.top})`);

d3.csv("../data/project_heart_disease.csv").then(function (data) {
    data.forEach(d => {
        d.Age = +d.Age;
        d["Heart Disease Status"] = d["Heart Disease Status"].trim();
    });

    const ageGroups = [
        { label: "<20", min: 0, max: 19 },
        { label: "20-30", min: 20, max: 30 },
        { label: "31-40", min: 31, max: 40 },
        { label: "41-50", min: 41, max: 50 },
        { label: "51-60", min: 51, max: 60 },
        { label: "61-70", min: 61, max: 70 },
        { label: "71+", min: 71, max: Infinity }
    ];

    data.forEach(d => {
        const group = ageGroups.find(g => d.Age >= g.min && d.Age <= g.max);
        d.AgeGroup = group ? group.label : "Unknown";
    });

    const keys = ["Yes", "No"];

    const grouped = d3.rollup(
        data,
        v => v.length,
        d => d.AgeGroup,
        d => d["Heart Disease Status"]
    );

    const ageGroupOrder = ageGroups.map(g => g.label);

    const chartData = Array.from(grouped, ([ageGroup, values]) => {
        const row = { AgeGroup: ageGroup };
        keys.forEach(k => {
            row[k] = values.get(k) || 0;
        });
        return row;
    }).sort((a, b) => ageGroupOrder.indexOf(a.AgeGroup) - ageGroupOrder.indexOf(b.AgeGroup));

    const x0 = d3.scaleBand()
        .domain(ageGroupOrder)
        .range([0, chartWidth4])
        .padding(0.2);

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

    const tooltip = d3.select("#tooltip");

    // Step 1: Vẽ trục Y ban đầu tại đáy (ẩn)
    const yAxisScaleStart = d3.scaleLinear()
        .domain([0, 0])
        .range([chartHeight4, chartHeight4]);

    const yAxis = chart4.append("g")
        .call(d3.axisLeft(yAxisScaleStart).ticks(5));

    // Step 2: Vẽ trục X ban đầu với range 0 (ẩn)
    const xAxis = chart4.append("g")
        .attr("transform", `translate(0,${chartHeight4})`)
        .call(d3.axisBottom(d3.scaleBand().domain(ageGroupOrder).range([0, 0])));

    // Step 3: Animate trục XY
    setTimeout(() => {
        yAxis.transition()
            .duration(1000)
            .ease(d3.easeCubicOut)
            .call(d3.axisLeft(y));

        xAxis.transition()
            .duration(1000)
            .ease(d3.easeCubicOut)
            .call(d3.axisBottom(x0));
    }, 100);


    // Step 5: Animate các bar + text
    setTimeout(() => {
        const bars = chart4.append("g")
            .selectAll("g")
            .data(chartData)
            .join("g")
            .attr("transform", d => `translate(${x0(d.AgeGroup)},0)`);

        bars.selectAll("rect")
            .data(d => keys.map(key => ({
                key,
                value: d[key],
                ageGroup: d.AgeGroup
            })))
            .join("rect")
            .attr("x", d => x1(d.key))
            .attr("y", y(0))
            .attr("width", x1.bandwidth())
            .attr("height", 0)
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
            })
            .transition()
            .duration(1000)
            .attr("y", d => y(d.value))
            .attr("height", d => chartHeight4 - y(d.value));

        // Add value text with count-up animation
        bars.selectAll("text")
            .data(d => keys.map(key => ({
                key,
                value: d[key],
                x: x1(key) + x1.bandwidth() / 2,
                y: y(d[key]) - 5
            })))
            .join("text")
            .attr("x", d => d.x)
            .attr("y", chartHeight4)
            .attr("text-anchor", "middle")
            .style("fill", "#ffffff")
            .style("font-size", "12px")
            .text(0)
            .transition()
            .duration(1000)
            .attr("y", d => d.y)
            .tween("text", function (d) {
                const i = d3.interpolateNumber(0, d.value);
                return function (t) {
                    d3.select(this).text(Math.round(i(t)));
                };
            });
    }, 1000);


    // Axis Labels
    chart4.append("text")
        .attr("x", chartWidth4 / 2)
        .attr("y", chartHeight4 + 40)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#ffffff")
        .text("Age Group");

    chart4.append("text")
        .attr("x", -chartHeight4 / 2)
        .attr("y", -45)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#ffffff")
        .text("Records");

    // Legend
    const legend = svg4.append("g")
        .attr("transform", `translate(${width4 - 180}, 20)`);

    keys.forEach((key, i) => {
        const g = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
        g.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(key));
        g.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .style("fill", "#ffffff")
            .text(`Heart Disease: ${key}`);
    });
});
