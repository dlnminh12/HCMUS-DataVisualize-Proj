const svg = d3.select("#bar-chart-gender-heart-status"),
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
        d.Gender = d.Gender.trim();
    });

    const keys = ["Yes", "No"];
    const genderOrder = ["Male", "Female"];

    const grouped = d3.rollup(
        data,
        v => v.length,
        d => d.Gender,
        d => d["Heart Disease Status"]
    );

    const chartData = Array.from(grouped, ([gender, values]) => {
        const row = { Gender: gender };
        keys.forEach(k => {
            row[k] = values.get(k) || 0;
        });
        return row;
    }).sort((a, b) => genderOrder.indexOf(a.Gender) - genderOrder.indexOf(b.Gender));

    const x0 = d3.scaleBand()
        .domain(genderOrder)
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

    // Animate axes from 0
    const yAxis = chart.append("g")
        .call(d3.axisLeft(d3.scaleLinear().domain([0, 0]).range([chartHeight, chartHeight])));

    const xAxis = chart.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(d3.scaleBand().domain(genderOrder).range([0, 0])));

    setTimeout(() => {
        yAxis.transition().duration(1000).ease(d3.easeCubicOut).call(d3.axisLeft(y));
        xAxis.transition().duration(1000).ease(d3.easeCubicOut).call(d3.axisBottom(x0));
    }, 100);

    setTimeout(() => {
        const bars = chart.append("g")
            .selectAll("g")
            .data(chartData)
            .join("g")
            .attr("transform", d => `translate(${x0(d.Gender)},0)`);

        bars.selectAll("rect")
            .data(d => keys.map(key => ({ key, value: d[key], gender: d.Gender })))
            .join("rect")
            .attr("x", d => x1(d.key))
            .attr("y", y(0))
            .attr("width", x1.bandwidth())
            .attr("height", 0)
            .attr("fill", d => color(d.key))
            .on("mouseover", function (event, d) {
                tooltip.style("display", "block")
                    .html(`<strong>Gender:</strong> ${d.gender}<br><strong>Heart Disease ${d.key}:</strong> ${d.value}`);
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

    // Axis Labels
    chart.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight + 40)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#ffffff")
        .text("Gender");

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
