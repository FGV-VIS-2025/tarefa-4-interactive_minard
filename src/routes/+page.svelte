<script>
    import {onMount} from "svelte";
    import * as d3 from "d3";
    import {join} from "$lib/join";
    import {interpolatePoints} from "$lib/join";
    import {parseDate} from "$lib/join";

    export let data;

    var army = data.army;
    var temperature = data.temperature;

    var armyWithTemp = join(army, temperature);
    // console.log(armyWithTemp);

    let currentTime;

    armyWithTemp = armyWithTemp.filter(d => parseDate(d.date));

    const times = [...new Set(armyWithTemp.map(d => parseDate(d.date)))].sort((a, b) => a - b);
    const minTime = times[0];
    const maxTime = times.at(-1);
    currentTime = minTime;

    $: interpolatedData = interpolatePoints(currentTime, armyWithTemp);

    let x, y;

    let svgElement;
    let svg;

    onMount(() => {
        const width = 600;
        const height = 400;
        const margin = {top: 20, right: 30, bottom: 30, left: 40};

        svg = d3.select(svgElement)
            .attr("width", width)
            .attr("height", height);

        x = d3.scaleLinear()
            .domain(d3.extent(army, d => d.lon))
            .range([margin.left, width - margin.right]);

        y = d3.scaleLinear()
            .domain(d3.extent(army, d => d.lat))
            .range([height - margin.bottom, margin.top]);

        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(x));

        svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(y));
    });

    $: if (svg && interpolatedData && typeof x === "function" && typeof y === "function") {
        const circles = svg.selectAll("circle")
            .data(interpolatedData, d => d.division);

        circles.enter()
            .append("circle")
            .merge(circles)
            .attr("cx", d => x(d.lon))
            .attr("cy", d => y(d.lat))
            .attr("r", d => Math.sqrt(d.size)/10)
            .attr("fill", d => d.direction === "R" ? "tomato" : "steelblue");

        circles.exit().remove();
    }

</script>

<h1>Interactive Minard</h1>

<input type="range" min={minTime} max={maxTime} step={86400000} bind:value={currentTime} />
<p>Data: {new Date(currentTime).toLocaleDateString()}</p>

<svg bind:this={svgElement} id="chart" width="800" height="500"></svg>