<script>
    import {onMount} from "svelte";
    import * as d3 from "d3";
    import {join} from "$lib/utils";
    import {interpolatePoints} from "$lib/utils";
    import {parseDate} from "$lib/utils";
    import eventInfo from '$lib/data/dados.json';
    import Timebar from "$lib/timebar.svelte";
    import eventsDate from "$lib/data/eventsDate.json";
    import army from "$lib/data/adjusted_army.json";
    import temperature from "$lib/data/original/temperature.json";
    import TemperatureBar from "$lib/TemperatureBar.svelte";
    import Description from '$lib/Description.svelte';

    var joinedData = join(army, temperature, eventsDate);
    joinedData = joinedData.filter(d => parseDate(d.date));

    // Pegando todas as datas ordenadas
    const times = [...new Set(joinedData.map(d => parseDate(d.date)))].sort((a, b) => a - b);
    // Pegando as datas mínima e máxima (para os limites do time scroller)
    const minTime = times[0];
    const maxTime = times.at(-1);

    // Tempo selecionado no time scroller
    let currentTime;
    // Começa o tempo no time scroller como o mínimo
    currentTime = minTime;
    
    

    // Elementos do svg
    let x, y;
    let svgElement;
    let svg;
    let tooltip;

    let chartWidth = 800;

    // Configurações do gráfico
    onMount(() => {
        const width = chartWidth;
        const height = 400;
        const margin = {top: 20, right: 30, bottom: 60, left: 170};

        svg = d3.select(svgElement)
            .attr("width", width)
            .attr("height", height);

        tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "white")
            .style("border", "solid 1px #ccc")
            .style("padding", "5px")
            .style("border-radius", "5px")
            .style("pointer-events", "none");

        const xExtent = d3.extent(army, d => d.lon);
        const yExtent = d3.extent(army, d => d.lat);

        const xPadding = (xExtent[1] - xExtent[0]) * 0.15;
        const yPadding = (yExtent[1] - yExtent[0]) * 0.1;
        
        x = d3.scaleLinear()
            .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
            .range([margin.left, width - margin.right]);

        y = d3.scaleLinear()
            .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
            .range([height - margin.bottom, margin.top]);

        svg.append("g")
            .attr("transform", `translate(0, ${height - margin.bottom})`)
            .call(d3.axisBottom(x))
            .selectAll(".tick text")
            .style("font-size", "12px");

        svg.append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(y))
            .selectAll(".tick text")
            .style("font-size", "12px");

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("x", width / 2 + 75)
            .attr("y", height - 15) // um pouco abaixo do eixo X
            .text("Longitude (°)")
            .style("font-size", "16px");

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", `rotate(-90)`)
            .attr("x", -height / 2 + 20)
            .attr("y", 120) // um pouco à esquerda do eixo Y
            .text("Latitude (°)")
            .style("font-size", "16px");
    });

  let selectedEvent = null;
  
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
        setTimeout(() => currentTime = newTime, 0);
      }
    }
  }
  
  function handleTimeUpdate(event) {
        currentTime = event.detail.time;
        selectedEvent = null; // Deselect any selected event when time changes
    }

  // Se um evento está selecionado, filtre os dados para mostrar apenas aquele ponto
  $: interpolatedData = interpolatePoints(currentTime, 
        selectedEvent && eventInfo[selectedEvent] 
            ? joinedData.filter(d => parseDate(d.date) === (parseDate(eventInfo[selectedEvent].date +1)))
            : joinedData
    );

    const formatDate = d3.timeFormat("%m/%d/%Y");

    // Atualiza o gráfico interativamente
    $: if (svg && interpolatedData && typeof x === "function" && typeof y === "function") {
        const circles = svg.selectAll(".army-circle")
            .data(interpolatedData, d => d.size);

        const circlesUpdate = circles.enter()
                .append("circle")
                .attr("class", "army-circle")
                .on("mouseover", (event, d) => {
                    tooltip.transition()
                          .duration(200)
                          .style("opacity", 0.9);
                    tooltip.html(`
                        ${interpolatedData.length > 1 ? `<strong>Division:</strong> ${d.division}<br/>` : ""}
                        <strong>Platoon size:</strong> ~${Math.round(d.size/100)*100} soldiers<br/>
                        <strong>Direction:</strong> ${d.direction === "A" ? "Advance" : "Retreat"}<br/>
                        <strong>Date:</strong> ~${formatDate(parseDate(d.date))}<br/>
                        ${!isNaN(d.temp) ? `<strong>Temp:</strong> ~(${Math.round(d.temp)} °C)` : ""}
                    `);
                })
                .on("mousemove", (event) => {
                    tooltip.style("left", (event.pageX + 10) + "px")
                            .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseleave", () => {
                    tooltip.transition()
                            .duration(500)
                            .style("opacity", 0)
                })
                .merge(circles);

        circlesUpdate.attr("cx", d => x(d.lon))
                .attr("cy", d => y(d.lat))
                .attr("r", d => Math.sqrt(d.size / Math.PI) * 0.2)
                .attr("fill", d => d.direction === "A" ? "#cf9e96" : "#030303")
                .attr("stroke", d => d.direction === "A" ? "#030303" : "#cf9e96")
                .attr("stroke-width", 0.5);

        circlesUpdate.sort((a, b) => d3.descending(a.size, b.size));

        circles.exit().remove();
    }
        // Cria os pontos no mapa de evento
        $: if (svg && typeof x === 'function' && typeof y === 'function' && Object.keys(eventInfo).length > 0) {
    const eventPoints = Object.entries(eventInfo).map(([id, info]) => ({
      id,
      ...info
    }));

    const markers = svg.selectAll(".event-marker")
      .data(eventPoints, d => d.id);

      console.log(selectedEvent);

    // Criar marcadores se ainda não existem
    const enter = markers.enter()
    .append("circle")
    .attr("class", "event-marker")
    .attr("r", 5)
    .attr("fill", d => d.id === selectedEvent ? "red" : "gold") // Destaque o selecionado
    .attr("stroke", "black")
    .attr("stroke-width", d => d.id === selectedEvent ? "2" : "1");

    enter.append("title").text(d => d.id);

    // Atualizar posição sempre que x/y mudarem
    markers.merge(enter)
    .attr("cx", d => x(d.lon))
    .attr("cy", d => y(d.lat))
    .attr("fill", d => d.id === selectedEvent ? "red" : "gold")
    // .attr("stroke-width", d => d.id === selectedEvent ? "2" : "1");

    // Remover os que não estão mais presentes
    markers.exit().remove();

  }

</script>

<h1>Interactive Minard</h1>
<Timebar 
    events={eventInfo} 
    minTime={minTime}
    maxTime={maxTime}
    currentTime={currentTime}
    chartWidth={chartWidth}
    on:eventclick={handleEventClick}
    on:timeupdate={handleTimeUpdate}
/>
<!-- Gráfico -->
<div class="chart-container">
    <!-- Gráfico -->
    <svg bind:this={svgElement} id="chart" width="800" height="500">
        <TemperatureBar {svgElement} data={interpolatedData} {x} {y} />
    </svg>
    
    <!-- Add the Description component -->
    <Description {selectedEvent} {eventInfo} />
</div>


<!-- Time scroller -->
<!-- <input type="range" min={minTime} max={maxTime} step={1} bind:value={currentTime} style="width: {chartWidth}px;"/> -->
<p>Data: {new Date(currentTime).toLocaleDateString()}</p>

<style>
    #chart {
        display: block;
        margin-bottom: 8px;
    }
    .tooltip {
        font-size: 12px;
        font-family: sans-serif;
        position: absolute;
        text-align: left;
        padding: 6px;
        background: white;
        border: 1px solid #ccc;
        border-radius: 5px;
        pointer-events: none;
    }
    .chart-container {
        display: flex;
        gap: 20px;
        margin-bottom: 20px;
    }
</style>
