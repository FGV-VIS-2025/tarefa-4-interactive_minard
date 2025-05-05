<script>
    import { onMount } from "svelte";
    import * as d3 from "d3";
    import { feature } from "topojson-client";
    import worldTopojson from "$lib/data/world-atlas-50m.json";
    import { join } from "$lib/utils";
    import { interpolatePoints } from "$lib/utils";
    import { parseDate } from "$lib/utils";
    import eventInfo from "$lib/data/dados.json";
    import Timebar from "$lib/timebar.svelte";
    import eventsDate from "$lib/data/eventsDate.json";
    import army from "$lib/data/adjusted_army.json";
    import temperature from "$lib/data/original/temperature.json";
    import TemperatureBar from "$lib/temperaturebar.svelte";
    import Description from "$lib/description.svelte";
    import Doughnut from "$lib/doughnut.svelte";
    import PlayButton from "$lib/PlayButton.svelte";
    import Icon from "$lib/icon.svelte";

    var joinedData = join(army, temperature, eventsDate);
    joinedData = joinedData.filter((d) => parseDate(d.date));

    // Pegando todas as datas ordenadas
    const times = [...new Set(joinedData.map((d) => parseDate(d.date)))].sort(
        (a, b) => a - b,
    );
    // Pegando as datas mínima e máxima (para os limites do time scroller)
    const minTime = times[0] - 1;
    var maxTime = times.at(-1);
    maxTime = new Date(maxTime);
    maxTime.setDate(maxTime.getDate() + 1);
    maxTime = maxTime.getTime();

    // Tempo selecionado no time scroller
    let currentTime;
    // Começa o tempo no time scroller como o mínimo
    $: currentTime = minTime;

    // Elementos do svg
    let x, y;
    let svgElement;
    let svg;
    let tooltip;
    let colorScale;
    let sizeScale;
    let height;
    let projection;

    let chartWidth = 800;

    const minLat = 54.05;
    const maxLat = 56;
    const minLong = 22;
    const maxLong = 40;

    // Configurações do gráfico
    onMount(() => {
        const width = chartWidth;
        height = 300;
        const margin = { top: 20, right: 30, bottom: 60, left: 170 };

        colorScale = d3
            .scaleOrdinal()
            .domain(["A", "R"])
            .range(["#cf9e96", "#030303"]);

        sizeScale = d3
            .scaleLinear()
            .domain([0, d3.max(joinedData, (d) => d.size)])
            .range([5, 8000]);

        svg = d3
            .select(svgElement)
            .attr("width", width)
            .attr("height", 1.3 * height);

        // Legenda de tamanhos
        const sizeLegend = svg
            .append("g")
            .attr("transform", "translate(-115, 120)");

        const sizeLegendScale = d3
            .scaleLinear()
            .domain([0, d3.max(joinedData, (d) => d.size)])
            .range([5, 8000]);

        const sizeLegendRect = sizeLegend
            .append("g")
            .attr("transform", "translate(550, 180)");

        sizeLegendRect
            .append("rect")
            .attr("x", -60) // ajusta para cobrir a legenda
            .attr("y", -25)
            .attr("width", 250)
            .attr("height", 70)
            .attr("fill", "white") // cor de fundo
            .attr("stroke", "black") // borda
            .attr("stroke-width", 0.7)
            .attr("rx", 5) // bordas arredondadas
            .attr("ry", 5);

        sizeLegend
            .selectAll("circle")
            .data([1000, 50000, 100000])
            .enter()
            .append("circle")
            .attr("cx", (d, i) => i * (10 * i + 30) + 600)
            .attr("cy", 190)
            .attr("r", (d) => Math.sqrt(sizeLegendScale(d) / Math.PI))
            .attr("fill", "lightgray")
            .attr("stroke", "#030303")
            .attr("stroke-width", 0.2);

        sizeLegend
            .selectAll("text")
            .data([1000, 50000, 100000])
            .enter()
            .append("text")
            .attr("x", (d, i) => i * (10 * i + 30) + 600)
            .attr("y", 195)
            .attr("text-anchor", "middle")
            .text((d) => d / 1000)
            .style("font-size", "13px");

        sizeLegend
            .append("text")
            .attr("x", 540)
            .attr("y", 187)
            .attr("text-anchor", "middle")
            .text("Platoon size")
            .style("font-size", "14px");
        sizeLegend
            .append("text")
            .attr("x", 540)
            .attr("y", 203)
            .attr("text-anchor", "middle")
            .text("(in thousands)")
            .style("font-size", "14px");

        tooltip = d3
            .select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "solid 1px #ccc")
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("pointer-events", "none")
            .style("font-family", "sans-serif")
            .style("font-size", "14px");

        const xExtent = d3.extent(army, (d) => d.lon);
        const yExtent = d3.extent(army, (d) => d.lat);

        const xPadding = (xExtent[1] - xExtent[0]) * 0.15;
        const yPadding = (yExtent[1] - yExtent[0]) * 0.1;

        x = d3
            .scaleLinear()
            .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
            .range([margin.left, width - margin.right]);

        y = d3
            .scaleLinear()
            .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
            .range([height - margin.bottom, margin.top]);

        // ------------------------------------------------------ Start of map background ------------------------------------------------------


        // Define capital coordinates
        const moscowCoords = [37.518, 55.751];
        const vilniusCoords = [25.279, 54.487];
        const minskCoords = [27.567, 53.893];

        // Create the backgroundmap
        projection = d3.geoMercator()
            .translate([x(minLong + (maxLong - minLong)/2), y(minLat + (maxLat - minLat)/2)])
            .scale(2000)
            .center([(minLong + maxLong)/2, (minLat + maxLat)/2]);
        const geoPath = d3.geoPath().projection(projection);

        const countries = feature(worldTopojson, worldTopojson.objects.countries);

        const countryData = [
            { id: "643", name: "Russia", color: "#e9e9e9" },
            { id: "440", name: "Lithuania", color: "#808080" },
            { id: "428", name: "Latvia", color: "#708090" },
            { id: "112", name: "Belarus", color: "#bdbebd" }
        ];

        const countryIds = countryData.map(d => d.id);
        const filteredCountries = countries.features.filter(d => countryIds.includes(d.id));

        // Add country information to each feature
        filteredCountries.forEach(feature => {
            const countryInfo = countryData.find(d => d.id === feature.id);
            feature.properties = feature.properties || {};
            feature.properties.name = countryInfo.name;
            feature.properties.color = countryInfo.color;
        });

        // Create a clip path to limit the map to our region of interest
        svg.append("defs")
            .append("clipPath")
            .attr("id", "map-clip")
            .append("rect")
            .attr("x", x(minLong))
            .attr("y", y(maxLat))
            .attr("width", x(maxLong) - x(minLong))
            .attr("height", y(minLat) - y(maxLat));

        const mapGroup = svg.insert("g", ".armies-group")
            .attr("class", "map-group")
            .attr("clip-path", "url(#map-clip)");

        mapGroup.append("rect")
            .attr("x", x(minLong))
            .attr("y", y(maxLat))
            .attr("width", x(maxLong) - x(minLong))
            .attr("height", y(minLat) - y(maxLat))
            .attr("fill", "none")
            .attr("stroke", "#000000")
            .attr("stroke-width", 2);

        // Draw the countries
        mapGroup.selectAll(".country")
            .data(filteredCountries)
            .enter()
            .append("path")
            .attr("class",  d => "country ${d.properties.name.toLowerCase()}")
            .attr("d", geoPath)
            .attr("fill", d => d.properties.color)
            .attr("stroke",  "#000000")
            .attr("stroke-width", 0.6)
            .attr("opacity", 0.4);

        if (!svg.select(".landmarks-group").node()) {
            svg.append("g").attr("class", "landmarks-group");
        }

        // Add Moscow -----
        svg.select(".landmarks-group")
            .append("circle")
            .attr("class", "moscow-dot")
            .attr("cx", projection(moscowCoords)[0])
            .attr("cy", projection(moscowCoords)[1])
            .attr("r", 6)
            .attr("fill", "red")
            .attr("stroke-width", 1.5);

        svg.select(".landmarks-group")
            .append("text")
            .attr("class", "moscow-label")
            .attr("x", projection(moscowCoords)[0] - 15)
            .attr("y", projection(moscowCoords)[1] + 15)
            .text("Moscow")
            .attr("font-size", "8px")
            .attr("font-weight", "bold")
            .attr("fill", "#000000")
            .attr("text-anchor", "start");

        // Add Minsk -----
        svg.select(".landmarks-group")
            .append("circle")
            .attr("class", "minsk-dot")
            .attr("cx", projection(minskCoords)[0])
            .attr("cy", projection(minskCoords)[1])
            .attr("r", 4)
            .attr("fill", "red")
            .attr("stroke-width", 1.5);

        svg.select(".landmarks-group")
            .append("text")
            .attr("class", "minsk-label")
            .attr("x", projection(minskCoords)[0] - 11)
            .attr("y", projection(minskCoords)[1] + 15)
            .text("Minsk")
            .attr("font-size", "8px")
            .attr("font-weight", "bold")
            .attr("fill", "#000000")
            .attr("text-anchor", "start");

        // Add Vilnus -----
        svg.select(".landmarks-group")
            .append("circle")
            .attr("class", "vilnius-dot")
            .attr("cx", projection(vilniusCoords)[0])
            .attr("cy", projection(vilniusCoords)[1])
            .attr("r", 4)
            .attr("fill", "red")
            .attr("stroke-width", 1.5);

        svg.select(".landmarks-group")
            .append("text")
            .attr("class", "vilnius-label")
            .attr("x", projection(vilniusCoords)[0] - 25)
            .attr("y", projection(vilniusCoords)[1] + 11)
            .text("Vilnius")
            .attr("font-size", "8px")
            .attr("font-weight", "bold")
            .attr("fill", "#000000")
            .attr("text-anchor", "start");
        // ------------------------------------------------------ End of map background ------------------------------------------------------

        // Legenda paises
        const countryLegend = svg
            .append("g")
            .attr("class", "legend-group")
            .attr("transform", "translate(170,  120)");

        const countryLegendRects = countryLegend
            .append("g")
            .attr("transform", "translate(550, 180)");

        countryLegendRects
            .append("rect")
            .attr("x", -60)
            .attr("y", -25)
            .attr("width", 100)
            .attr("height", 70)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 0.7)
            .attr("rx", 5)
            .attr("ry", 5);

        // Quadrados coloridos
        countryLegendRects
            .selectAll("rect.color-box")
            .data(countryData)
            .enter()
            .append("rect")
            .attr("class", "color-box")
            .attr("x", -50)
            .attr("y", (d, i) => i * 14 - 15)
            .attr("width", 10)
            .attr("height", 10)
            .attr("fill", d => d.color)
            .attr("stroke", "black")
            .attr("stroke-width", 0.5);

        // Nomes
        countryLegendRects
            .selectAll("text.country-name")
            .data(countryData)
            .enter()
            .append("text")
            .attr("class", "country-name")
            .attr("x", -35)
            .attr("y", (d, i) => i * 14 - 5.5)
            .text(d => d.name)
            .attr("font-size", "11px")
            .attr("text-anchor", "start");

        // legenda de cores
        const colorLegend = svg
            .append("g")
            .attr("transform", "translate(21, 22)");

        colorLegend
            .append("rect")
            .attr("x", 154)
            .attr("y", -4)
            .attr("width", 95)
            .attr("height", 50)
            .attr("fill", "white")
            .attr("fill-opacity", 0.9)
            .attr("stroke", "#ccc")
            .attr("rx", 4);

        colorLegend
            .selectAll("rect.color")
            .data(colorScale.domain())
            .enter()
            .append("rect")
            .attr("x", 160)
            .attr("y", (d, i) => i * 20)
            .attr("width", 20)
            .attr("height", 20)
            .attr("fill", colorScale);

        colorLegend
            .selectAll("text")
            .data(colorScale.domain())
            .enter()
            .append("text")
            .attr("x", 185)
            .attr("y", (d, i) => i * 20 + 15)
            .text((d) => (d === "A" ? "Advance" : "Retreat"))
            .style("font-size", "14px");
    });

    let selectedEvent = null;

    // Cria os grupos apenas uma vez
    $: if (svg && !svg.select(".armies-group").node()) {
        svg.append("g").attr("class", "armies-group");
        svg.append("g").attr("class", "events-group");
    }

    // Função para lidar com o clique na timebar
    function handleEventClick(event) {
        selectedEvent = event.detail.eventId;
        if (selectedEvent && eventInfo[selectedEvent]) {
            const newTime = parseDate(eventInfo[selectedEvent].date);
            if (currentTime !== newTime) {
                currentTime = newTime;
            } else {
                // Force reactivity in case same value
                currentTime = newTime + 1;
                setTimeout(() => (currentTime = newTime), 0);
            }
            if (playing) {togglePlay();}
        }
    }

    function handleTimeUpdate(event) {
        currentTime = event.detail.time;
        selectedEvent = null; // Deselect any selected event when time changes
    }

    // Se um evento está selecionado, filtre os dados para o current time atual
    $: interpolatedData = interpolatePoints(currentTime, joinedData);

    const formatDate = (date) => {
        // Adiciona 1 dia à data
        const newDate = d3.timeDay.offset(date, 1);
        return d3.timeFormat("%d/%m/%Y")(newDate);
    };

    // Atualiza os círculos de exércitos
    $: if (
        svg &&
        interpolatedData &&
        typeof x === "function" &&
        typeof y === "function"
    ) {
        tooltip.style("opacity", 0);

        const circles = svg
            .select(".armies-group")
            .selectAll(".army-circle")
            .data(interpolatedData, (d) => d.size);

        const circlesUpdate = circles
            .enter()
            .append("circle")
            .attr("class", "army-circle")
            .on("mouseover", (event, d) => {
                if (!playing) {
                    tooltip.style("opacity", 0.9);
                }
                tooltip.html(`
                        ${interpolatedData.length > 1 ? `<strong>Division:</strong> ${d.division}<br/>` : ""}
                        <strong>Platoon size:</strong> ~${Math.round(d.size / 100) * 100} soldiers<br/>
                        <strong>Direction:</strong> ${d.direction === "A" ? "Advance" : "Retreat"}<br/>
                        <strong>Date:</strong> ~${formatDate(parseDate(d.date))}<br/>
                        ${!isNaN(d.temp) ? `<strong>Temp:</strong> ~(${Math.round(d.temp)} °C)` : ""}
                    `);
            })
            .on("mousemove", (event) => {
                tooltip
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY - 28 + "px");
            })
            .on("mouseleave", () => {
                tooltip.style("opacity", 0);
            })
            .merge(circles);

        circlesUpdate
            .attr("cx", (d) => projection([d.lon, d.lat])[0])
            .attr("cy", (d) => projection([d.lon, d.lat])[1])
            .attr("r", (d) => Math.sqrt(sizeScale(d.size) / Math.PI))
            .attr("fill", (d) => colorScale(d.direction))
            .attr("stroke", (d) =>
                d.direction === "A" ? "#030303" : "#cf9e96",
            )
            .attr("stroke-width", 0.5);

        circlesUpdate.sort((a, b) => d3.descending(a.size, b.size));

        circles.exit().remove();
    }

    // Atualiza os marcadores de eventos
    $: if (svg && typeof x === "function" && typeof y === "function" && Object.keys(eventInfo).length > 0) {
        const eventPoints = Object.entries(eventInfo).map(([id, info]) => ({
            id,
            ...info,
        }));
        selectedEvent = selectedEvent;

        const markers = svg
            .select(".events-group")
            .selectAll(".event-marker")
            .data(eventPoints, (d) => d.id);

        // Create new markers if they don't exist
        const enter = markers
            .enter()
            .append("foreignObject")
            .attr("class", "event-marker")
            .style("cursor", "pointer")
            .attr("width", 20)
            .attr("height", 20)
            .html((d) => markerHtml(d))
            .on("mouseover", (event, d) => {
                if (!playing) {
                    tooltip.style("opacity", 0.9);
                }
                tooltip.html(`
                <div style="max-width: 200px;">
                    <strong>${d.title}</strong><br/>
                </div>
            `);
            })
            .on("mousemove", (event) => {
                tooltip
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY - 28 + "px");
            })
            .on("mouseleave", () => {
                tooltip.style("opacity", 0);
            })
            .on("click", (event, d) => {
                currentTime = parseDate(d.date); // <- Atualiza o currentTime no clique
                if (playing) {togglePlay();}

            });

        markers
            .merge(enter)
            .attr("x", (d) => projection([d.lon, d.lat])[0] - 10)
            .attr("y", (d) => projection([d.lon, d.lat])[1] - 10)
            .style("cursor", "pointer")
            .html((d) => markerHtml(d));

        markers.exit().remove();
    }

    // Função para gerar o SVG do marcador
    function markerHtml(d) {
        return `
        <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M12 21C15.5 17.4 19 14.1764 19 10.2C19 6.22355 15.866 3 12 3C8.13401 3 5 6.22355 5 10.2C5 14.1764 8.5 17.4 12 21Z"
                fill="#616170"
                stroke="#000000"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="${d.id === selectedEvent ? 1 : 0.3}"></path>
            <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                fill="white"
                stroke="#000000"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                opacity="${d.id === selectedEvent ? 1 : 0.3}"></path>
        </svg>
    `;
    }

    let playing = false;
    let playInterval = null;
    let step = 4_000_000;

    function togglePlay() {
        if (!playing) {
            playing = true;
            if (currentTime >= maxTime - step) {
                currentTime = minTime;
            }
            playInterval = setInterval(() => {
                if (currentTime < maxTime - step) {
                    currentTime += step;
                } else {
                    clearInterval(playInterval);
                    playing = false;
                }
            }, 10);
        } else {
            playing = false;
            clearInterval(playInterval);
        }
    }

    let highlightTarget = null;
    let highlightBox = null;

    let mapEl;
    let timelineEl;
    let playEl;
    let eventEl;
    let markersEl;
    let circlesEl;

    const elementRefs = {
        map: () => mapEl,
        timeline: () => timelineEl,
        play_button: () => playEl,
        event_buttons: () => eventEl,
        markers: () => markersEl,
        circles: () => circlesEl
    };

    const highlightOffsets = {
        timeline: { top: 50, left: -20, width: 55, height: -105 },
        map: { top: 160, left: 95, width: -120, height: -265 },
        play_button: { top: -45, left: 5, width: -15, height: 65 },
        event_buttons: { top: -10, left: 100, width: -65, height: -90 },
        markers: { top: 220, left: 485, width: -840, height: -480 },
        circles: { top: -200, left: -23, width: -685, height: 40 },
    };

    function handleHighlight(event) {
        const id = event.detail.id;
        highlightTarget = id;

        if (id && elementRefs[id]) {
            const el = elementRefs[id]();
            if (el) {
                const rect = el.getBoundingClientRect();
                const offset = highlightOffsets[id] || { top: 0, left: 0, width: 0, height: 0 };

                highlightBox = {
                    top: rect.top + window.scrollY + offset.top,
                    left: rect.left + window.scrollX + offset.left,
                    width: rect.width + offset.width,
                    height: rect.height + offset.height
                };
            }
        } else {
            highlightBox = null;
        }
    }
</script>

{#if highlightBox}
    <div
        class="highlight-rect"
        style="
            top: {highlightBox.top}px;
            left: {highlightBox.left}px;
            width: {highlightBox.width}px;
            height: {highlightBox.height}px;
        "
    ></div>
{/if}

<div class="page-container">
    <h1>Interactive Minard: a new perspective on Napoleon's march</h1>

    <div class="description-container">
        <p class="text-description">
            This interactive visualization offers a modern reinterpretation of <a href="./minard" class="no-style">Charles Minard's 1869 iconic infographic</a> , which depicts Napoleon’s Russian campaign of 1812.
            At the top, the event timeline highlights key moments of the campaign. Each symbol represents a specific type of event:
        </p>
        <div style="display: flex; gap: 20px; justify-content: center; flex-wrap: wrap; margin-top: 1em;">
            <div style="text-align: center;">
                <div><Icon name="river" width_icon={20} height_icon={20}/></div>
                <div>River Crossing</div>
            </div>
            <div style="text-align: center;">
                <div><Icon name="burned" width_icon={20} height_icon={20}/></div>
                <div>City Capture</div>
            </div>
            <div style="text-align: center;">
                <div><Icon name="battle" width_icon={20} height_icon={20}/></div>
                <div>Battle</div>
            </div>
            <div style="text-align: center;">
                <div><Icon name="artillery" width_icon={20} height_icon={20}/></div>
                <div>Preparing for War</div>
            </div>
            <div style="text-align: center;">
                <div><Icon name="out" width_icon={20} height_icon={20}/></div>
                <div>Retreat</div>
            </div>
            <div style="text-align: center;">
                <div><Icon name="napoleon" width_icon={20} height_icon={20}/></div>
                <div>Napoleon Retreats</div>
            </div>
            <div style="text-align: center;">
                <div><Icon name="depot" width_icon={20} height_icon={20}/></div>
                <div>Supply Depot </div>
            </div>
        </div>
    </div>
    
    <div class="main-container" bind:this={markersEl}>
        <div class="chart-container" bind:this={mapEl}>
            <div class="top-bar" bind:this={eventEl}>
                <div class="left-info" bind:this={playEl}>
                    <p class="date-name">Date</p>
                    <p class="date-text">{formatDate(parseDate(currentTime))}</p>
                    <PlayButton
                        {playing}
                        onTogglePlay={togglePlay}
                    />
                </div>

                <div class="timebar-wrapper" bind:this={timelineEl}>
                    <Timebar
                        events={eventInfo}
                        {minTime}
                        {maxTime}
                        {currentTime}
                        chartWidth={chartWidth - 100}
                        on:eventclick={handleEventClick}
                        on:timeupdate={handleTimeUpdate}
                    />
                </div>
            </div>

            <svg bind:this={svgElement} id="chart" width="800" height="500">
                <TemperatureBar
                    {svgElement}
                    data={interpolatedData}
                    chartHeight={300}
                />
                <!-- Aqui dentro fica o scatter também -->
            </svg>

            <div class="doughnut-container" bind:this={circlesEl}>
                <Doughnut data={interpolatedData} />
            </div>
        </div>

        <div class="text-container">
            <Description
                bind:selectedEvent
                bind:currentTimeInput={currentTime}
                onTogglePlay={togglePlay}
                bind:playing={playing}
                minTime = {minTime}
                on:highlight={handleHighlight}
            />
        </div>
    </div>
</div>

<style>
    .page-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 20px;
        height: 80vh;
        text-align: center;
        margin-left: -20px;
        position: relative;
        top: 0;
    }

    .main-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        margin-top: 30px;
        flex-wrap: wrap;
    }

    .chart-container {
        position: relative;
        width: 800px;
        max-width: 100%;
        margin-left: -100px;
        /* display: flex; */
        flex-direction: column;
        align-items: center;
        flex: 1;
        height: 550px;
    }

    .top-bar {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 20px;
        width: 800px;
        margin-bottom: 10px;
    }

    .left-info {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        min-width: 100px;
        flex-shrink: 0;
    }

    svg#chart {
        align-self: flex-start;
    }

    .date-text {
        font-size: 16px;
        /* font-weight: bold; */
        width: 100px;
        text-align: center;
        margin-top: -20px;
    }

    .date-name {
        font-weight: bold;
        width: 100px;
        text-align: center;
        margin-top: -40px;
    }

    #chart {
        display: block;
    }

    .timebar-wrapper {
        position: relative;
        top: 0;
        margin-bottom: 10px;
        width: 100%;
        flex-grow: 1;
        min-width: 600px;
        max-height: 600px;
    }

    .text-container {
        width: 250px;
        padding-left: 10px;
        max-width: 100%;
        box-sizing: border-box;
        margin-top: 70px;
    }

    h1 {
        margin-top: 10px;
        font-size: 30px;
        margin-bottom: -5px;
    }

    .doughnut-container {
        position: relative;
        bottom: 120px;
        right: -195px;
    }

    .highlight-rect {
        position: absolute;
        border: 3px dashed black;
        opacity: 0.5;
        background-color: rgba(255, 255, 0, 0.1);
        border-radius: 8px;
        z-index: 1000;
        pointer-events: none;
        transition: all 0.2s ease;
    }
    .text-description {
    font-size: 1.2rem;
        color: #555;
        margin-bottom: 1rem;
        text-align: justify;

    }

    .no-style {
    color: inherit;
    text-decoration: underline;
}

    


</style>
