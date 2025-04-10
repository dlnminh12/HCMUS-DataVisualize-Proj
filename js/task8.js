const svg = d3.select("#grouped-bar-chart-cholesterol"),
    width = +svg.attr("width"),
    height = +svg.attr("height"),
    margin = { top: 40, right: 30, bottom: 50, left: 60 },
    chartWidth = width - margin.left - margin.right,
    chartHeight = height - margin.top - margin.bottom;

const chart = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

d3.csv("../data/project_heart_disease.csv").then(function(data) {
    // Xử lý dữ liệu đầu vào
    data.forEach(d => {
        d.Gender = d.Gender?.trim();
        d["Cholesterol Level"] = +d["Cholesterol Level"];
        if (d["Cholesterol Level"] < 200) {
            d.CholesterolCategory = "Low";
        } else if (d["Cholesterol Level"] <= 239) {
            d.CholesterolCategory = "Normal";
        } else {
            d.CholesterolCategory = "High";
        }
    });

    const genders = ["Male", "Female"];
    const levels = ["Low", "Normal", "High"];

    // Gom nhóm CholesterolCategory → Gender → Count
    const grouped = d3.rollup(
        data,
        v => v.length,
        d => d.CholesterolCategory,
        d => d.Gender
    );

    const chartData = levels.map(level => {
        const values = grouped.get(level) || new Map();
        return {
            Level: level,
            Male: values.get("Male") || 0,
            Female: values.get("Female") || 0
        };
    });

    const x0 = d3.scaleBand()
        .domain(levels)
        .range([0, chartWidth * 0.7])
        .padding(0.2);

    const x1 = d3.scaleBand()
        .domain(genders)
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => Math.max(d.Male, d.Female))])
        .nice()
        .range([chartHeight, 0]);

    const color = d3.scaleOrdinal()
        .domain(genders)
        .range(["#1f77b4", "#e754b0"]);

    const tooltip = d3.select("#tooltip");

    const xAxis = chart.append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .attr("opacity", 0);

    const yAxis = chart.append("g")
        .attr("opacity", 0);

    const barGroups = chart.selectAll(".group")
        .data(chartData)
        .join("g")
        .attr("class", "group")
        .attr("transform", d => `translate(${x0(d.Level)},0)`);

    const bars = barGroups.selectAll("rect")
        .data(d => genders.map(gender => ({
            key: gender,
            value: d[gender],
            level: d.Level
        })))
        .join("rect")
        .attr("x", d => x1(d.key))
        .attr("y", chartHeight)
        .attr("width", x1.bandwidth())
        .attr("height", 0)
        .attr("fill", d => color(d.key))
        .on("mouseover", function(event, d) {
            tooltip.style("display", "block")
                .html(`
                    <strong>Cholesterol:</strong> ${d.level}<br>
                    <strong>Gender:</strong> ${d.key}<br>
                    <strong>Count:</strong> ${d.value}
                `);
            d3.select(this).style("opacity", 0.8);
        })
        .on("mousemove", function(event) {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 20) + "px");
        })
        .on("mouseout", function() {
            tooltip.style("display", "none");
            d3.select(this).style("opacity", 1);
        });

    const labels = barGroups.selectAll("text")
        .data(d => genders.map(gender => ({
            key: gender,
            value: d[gender],
            x: x1(gender) + x1.bandwidth() / 2,
            level: d.Level
        })))
        .join("text")
        .attr("x", d => d.x)
        .attr("y", chartHeight)
        .attr("text-anchor", "middle")
        .style("fill", "#ffffff")
        .style("font-size", "12px")
        .text(0);

    // Trục animate
    setTimeout(() => {
        xAxis.transition().duration(1000).attr("opacity", 1).call(d3.axisBottom(x0));
        yAxis.transition().duration(1000).attr("opacity", 1).call(d3.axisLeft(y));
    }, 100);

    // Cột + label animate
    setTimeout(() => {
        bars.transition()
            .duration(1000)
            .attr("y", d => y(d.value))
            .attr("height", d => chartHeight - y(d.value));

        labels.transition()
            .duration(1000)
            .attr("y", d => y(d.value) - 5)
            .tween("text", function(d) {
                const i = d3.interpolateNumber(0, d.value);
                return function(t) {
                    d3.select(this).text(Math.round(i(t)));
                };
            });
    }, 1200);

    // Trục label
    chart.append("text")
        .attr("x", chartWidth / 2)
        .attr("y", chartHeight + 40)
        .attr("text-anchor", "middle")
        .style("fill", "#ffffff")
        .style("font-size", "14px")
        .text("Cholesterol Level");

    chart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", -chartHeight / 2)
        .attr("y", -45)
        .attr("text-anchor", "middle")
        .style("fill", "#ffffff")
        .style("font-size", "14px")
        .text("Number of Individuals");

    // Legend
    const legend = svg.append("g")
    .attr("transform", `translate(${width - 250}, 20)`);


    // Giới tính
    legend.append("text")
        .attr("x", 0)
        .attr("y", 0)
        .text("Gender:")
        .style("fill", "#ffffff")
        .style("font-weight", "bold");

    genders.forEach((gender, i) => {
        const g = legend.append("g").attr("transform", `translate(0, ${20 + i * 20})`);
        g.append("rect")
            .attr("width", 15)
            .attr("height", 15)
            .attr("fill", color(gender));
        g.append("text")
            .attr("x", 20)
            .attr("y", 12)
            .style("fill", "#ffffff")
            .text(gender);
    });

    // Chú thích cholesterol
    const explanationData = {
        "Low": "< 200 mg/dL",
        "Normal": "200–239 mg/dL",
        "High": "≥ 240 mg/dL"
    };

    legend.append("text")
        .attr("x", 0)
        .attr("y", 70)
        .text("Cholesterol Levels:")
        .style("fill", "#ffffff")
        .style("font-weight", "bold");

    levels.forEach((level, i) => {
        legend.append("text")
            .attr("x", 20)
            .attr("y", 90 + i * 18)
            .style("fill", "#ffffff")
            .style("font-size", "12px")
            .text(`${level}: ${explanationData[level]}`);
    });
});
