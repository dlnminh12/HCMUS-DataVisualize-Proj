d3.csv("../data/project_heart_disease.csv").then(function(data) {
    // Lọc và nhóm dữ liệu
    const filtered = data.filter(d => d["Family Heart Disease"] && d["Heart Disease Status"]);
    const nested = d3.rollup(
        filtered,
        v => v.length,
        d => d["Family Heart Disease"],
        d => d["Heart Disease Status"]
    );

    const svg = d3.select('#task7-chart')
        .append('svg')
        .attr('width', 1000)
        .attr('height', 500);

    const margin = { top: 50, right: 30, bottom: 60, left: 60 },
          width = +svg.attr('width') - margin.left - margin.right,
          height = +svg.attr('height') - margin.top - margin.bottom;

    const chart = svg.append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

    const families = Array.from(nested.keys());
    const statuses = ["Yes", "No"];

    const chartData = families.map(family => {
        const inner = nested.get(family) || new Map();
        return {
            family,
            Yes: inner.get("Yes") || 0,
            No: inner.get("No") || 0
        };
    });

    const x0 = d3.scaleBand()
        .domain(families)
        .range([0, width])
        .paddingInner(0.2);

    const x1 = d3.scaleBand()
        .domain(statuses)
        .range([0, x0.bandwidth()])
        .padding(0.05);

    const y = d3.scaleLinear()
        .domain([0, d3.max(chartData, d => Math.max(d.Yes, d.No)) + 500])
        .nice()
        .range([height, 0]);

    const color = d3.scaleOrdinal()
        .domain(statuses)
        .range(["#4daf4a", "#e41a1c"]); // Xanh & đỏ

    // Vẽ trục
    chart.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x0));

    chart.append("g")
        .call(d3.axisLeft(y));

    // Nhãn trục
    chart.append("text")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#ffffff")
        .text("Family Heart Disease Status");

    chart.append("text")
        .attr("x", -height / 2)
        .attr("y", -40)
        .attr("transform", "rotate(-90)")
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("fill", "#ffffff")
        .text("Number of Records");

    // Vẽ cột
    const familyGroups = chart.selectAll(".family-group")
        .data(chartData)
        .join("g")
        .attr("class", "family-group")
        .attr("transform", d => `translate(${x0(d.family)},0)`);

    familyGroups.selectAll("rect")
        .data(d => statuses.map(key => ({ key, value: d[key] })))
        .join("rect")
        .attr("x", d => x1(d.key))
        .attr("y", d => y(d.value))
        .attr("width", x1.bandwidth())
        .attr("height", d => height - y(d.value))
        .attr("fill", d => color(d.key));

    // Chú thích
    const legend = svg.append("g")
        .attr("transform", `translate(${width - 150}, 20)`);

    statuses.forEach((key, i) => {
        const g = legend.append("g").attr("transform", `translate(0, ${i * 25})`);
        g.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", color(key));
        g.append("text")
            .attr("x", 25)
            .attr("y", 14)
            .style("fill", "#ffffff")
            .text(`Heart Disease: ${key}`);
    });

    // Tiêu đề
    chart.append("text")
        .attr("x", width / 2)
        .attr("y", -20)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-weight", "bold")
        .style("fill", "#ffffff")
        .text("Family Heart Disease vs Heart Disease Status");
});
