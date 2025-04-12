const svg = d3.select("#bar-chart-family-heart-status"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    margin = { top: 40, right: 30, bottom: 50, left: 60 },
    chartWidth = width - margin.left - margin.right,
    chartHeight = height - margin.top - margin.bottom;

const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("../data/project_heart_disease.csv").then(function (data) {
    data.forEach(d => {
        d["Heart Disease Status"] = d["Heart Disease Status"].trim();
        d["Family Heart Disease"] = d["Family Heart Disease"].trim();
    });

    const keys = ["Yes", "No"];
    const historyOrder = ["Yes", "No"];

    const grouped = d3.rollup(
        data.filter(d => d["Family Heart Disease"] && d["Heart Disease Status"]),
        v => v.length,
        d => d["Family Heart Disease"],
        d => d["Heart Disease Status"]
    );

    const chartData = Array.from(grouped, ([history, values]) => {
        const row = { History: history };
        keys.forEach(k => {
            row[k] = values.get(k) || 0;
        });
        return row;
    }).sort((a, b) => historyOrder.indexOf(a.History) - historyOrder.indexOf(b.History));

    const x0 = d3.scaleBand()
        .domain(historyOrder)
        .range([0, chartWidth])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain(keys)
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => d3.max(keys, key => d[key]))])
        .nice()
        .range([chartHeight, 0]);

    const color = d3.scaleOrdinal()
        .domain(keys)
        .range(["#4daf4a", "#e41a1c"]);

    const tooltip = d3.select("#tooltip");

    // Axis transition from zero
    const yAxis = chart.append("g")
        .call(d3.axisLeft(d3.scaleLinear().domain([0, 0]).range([chartHeight, chartHeight])));
    const xAxis = chart.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(d3.scaleBand().domain(historyOrder).range([0, 0])));

    setTimeout(() => {
        yAxis.transition().duration(1000).ease(d3.easeCubicOut).call(d3.axisLeft(y));
        xAxis.transition().duration(1000).ease(d3.easeCubicOut).call(d3.axisBottom(x0));
    }, 100);

    setTimeout(() => {
        const bars = chart.append("g")
            .selectAll("g")
            .data(chartData)
            .join("g")
            .attr("transform", d => `translate(${x0(d.History)},0)`);

        bars.selectAll("rect")
            .data(d => keys.map(key => ({ key, value: d[key], history: d.History })))
            .join("rect")
            .attr("x", d => x1(d.key))
            .attr("y", y(0))
            .attr("width", x1.bandwidth())
            .attr("height", 0)
            .attr("fill", d => color(d.key))
            .on("mouseover", function (event, d) {
                tooltip.style("display", "block")
                    .html(`<strong>Family History:</strong> ${d.history}<br><strong>Heart Disease ${d.key}:</strong> ${d.value}`);
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
            .attr("height", d => chartHeight - y(d.value));

        bars.selectAll("text")
            .data(d => keys.map(key => ({
                key,
                value: d[key],
                x: x1(key) + x1.bandwidth() / 2,
                y: y(d[key]) - 5
            })))
            .join("text")
            .attr("x", d => d.x)
            .attr("y", chartHeight)
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

    // Axis labels
    chart.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight + 40)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#ffffff")
        .text("Family History");

    chart.append("text")
        .attr("x", -chartHeight / 2)
        .attr("y", -45)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#ffffff")
        .text("Records");

    // Legend
    const legend = svg.append("g").attr("transform", `translate(${width - 180}, 20)`);
    keys.forEach((key, i) => {
        const g = legend.append("g").attr("transform", `translate(0, ${i * 20})`);
        g.append("rect").attr("width", 15).attr("height", 15).attr("fill", color(key));
        g.append("text").attr("x", 20).attr("y", 12).style("fill", "#ffffff").text(`Heart Disease: ${key}`);
    });
});
