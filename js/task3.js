// -----------------------Chart for task 3-------------------/
const svg3 = d3.select("#grouped-bar-chart-smoking-heart-status"),
    width3 = +svg3.attr("width"),
    height3 = +svg3.attr("height"),
    margin3 = { top: 40, right: 30, bottom: 50, left: 60 },
    chartWidth3 = width3 - margin3.left - margin3.right,
    chartHeight3 = height3 - margin3.top - margin3.bottom;

const chart3 = svg3.append("g")
    .attr("transform", `translate(${margin3.left},${margin3.top})`);

d3.csv("../data/project_heart_disease.csv").then(function (data) {
    data.forEach(d => {
        d.Smoking = d.Smoking.trim();
        d["Heart Disease Status"] = d["Heart Disease Status"].trim();
    });

    // Group data
    const grouped = d3.rollup(
        data,
        v => v.length,
        d => d.Smoking,
        d => d["Heart Disease Status"]
    );

    const keys = ["Yes", "No"]; // Heart Disease Status
    const chartData = Array.from(grouped, ([smoking, values]) => {
        const row = { Smoking: smoking };
        keys.forEach(k => {
            row[k] = values.get(k) || 0;
        });
        return row;
    });

    // Scales
    const x0 = d3.scaleBand()
        .domain(chartData.map(d => d.Smoking))
        .range([0, chartWidth3])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain(keys)
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d3.max(keys, key => d[key]))])
        .nice()
        .range([chartHeight3, 0]);

    const color = d3.scaleOrdinal()
        .domain(keys)
        .range(["#4daf4a", "#e41a1c"]);

    const tooltip = d3.select("#tooltip");

    // Draw hidden axes
    const yAxisScaleStart = d3.scaleLinear()
        .domain([0, 0])
        .range([chartHeight3, chartHeight3]);

    const yAxis = chart3.append("g")
        .call(d3.axisLeft(yAxisScaleStart).ticks(5));

    const xAxis = chart3.append("g")
        .attr("transform", `translate(0,${chartHeight3})`)
        .call(d3.axisBottom(d3.scaleBand().domain(chartData.map(d => d.Smoking)).range([0, 0])));

    // Animate axes
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

    // Animate bars
    setTimeout(() => {
        const bars = chart3.append("g")
            .selectAll("g")
            .data(chartData)
            .join("g")
            .attr("transform", d => `translate(${x0(d.Smoking)},0)`);

        bars.selectAll("rect")
            .data(d => keys.map(key => ({
                key,
                value: d[key],
                smoking: d.Smoking
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
                        <strong>Smoking Status:</strong> ${d.smoking}<br>
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
            .attr("height", d => chartHeight3 - y(d.value));
    }, 1000);

    // Add axis labels
    chart3.append("text")
        .attr("x", chartWidth3 / 2)
        .attr("y", chartHeight3 + 40)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#ffffff")
        .text("Smoking Status");

    chart3.append("text")
        .attr("x", -chartHeight3 / 2)
        .attr("y", -45)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#ffffff")
        .text("Records");

    // Add legend
    const legend = svg3.append("g")
        .attr("transform", `translate(${width3 - 180}, 20)`);

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