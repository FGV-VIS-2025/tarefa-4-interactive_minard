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

    let chartWidth = 800;

    // Configurações do gráfico
    onMount(() => {
        const width = chartWidth;
        const height = 400;
        const margin = {top: 20, right: 30, bottom: 60, left: 70};

        svg = d3.select(svgElement)
            .attr("width", width)
            .attr("height", height);

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
            .attr("x", width / 2)
            .attr("y", height - 15) // um pouco abaixo do eixo X
            .text("Longitude (°)")
            .style("font-size", "16px");

        svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", `rotate(-90)`)
            .attr("x", -height / 2)
            .attr("y", 20) // um pouco à esquerda do eixo Y
            .text("Latitude (°)")
            .style("font-size", "16px");
    });

    // Adicione esta variável para armazenar o evento selecionado
  let selectedEvent = null;
  
  // Função para lidar com o clique na timebar
  function handleEventClick(event) {
    selectedEvent = event.detail.eventId;
    if (selectedEvent && eventInfo[selectedEvent]) {
      console.log("selectedEvent", selectedEvent);
      console.log("eventInfo[selectedEvent]", eventInfo[selectedEvent]);
      console.log("eventInfo[selectedEvent].date", eventInfo[selectedEvent]?.date);

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
  
  function handleTimeChange() {
        // Quando o tempo muda manualmente, deseleciona o evento
        selectedEvent = null;
    }

  // Se um evento está selecionado, filtre os dados para mostrar apenas aquele ponto
  $: interpolatedData = interpolatePoints(currentTime, 
        selectedEvent && eventInfo[selectedEvent] 
            ? joinedData.filter(d => parseDate(d.date) === parseDate(eventInfo[selectedEvent].date))
            : joinedData
    );

    // Atualiza o gráfico interativamente
    $: if (svg && interpolatedData && typeof x === "function" && typeof y === "function") {
        const circles = svg.selectAll(".army-circle")

            .data(interpolatedData, d => d.division);

            circles.enter()
                  .append("circle")
                  .attr("class", "army-circle")
                  .merge(circles)
                  .attr("cx", d => x(d.lon))
                  .attr("cy", d => y(d.lat))
                  .attr("r", d => Math.sqrt(d.size / Math.PI) * 0.2)
                  .attr("fill", d => d.direction === "R" ? "tomato" : "steelblue");

circles.exit().remove();


        circles.exit().remove();
    }

    // let 
    $: if (svg && typeof x === 'function' && typeof y === 'function' && Object.keys(eventInfo).length > 0) {
    const eventPoints = Object.entries(eventInfo).map(([id, info]) => ({
      id,
      ...info
    }));

    const markers = svg.selectAll(".event-marker")
      .data(eventPoints, d => d.id);

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
    .attr("stroke-width", d => d.id === selectedEvent ? "2" : "1");

    // Remover os que não estão mais presentes
    markers.exit().remove();

    
  }
</script>

<h1>Interactive Minard</h1>

<!-- Gráfico -->
<svg bind:this={svgElement} id="chart" width="800" height="500"></svg>

<Timebar events = {eventInfo} on:eventclick={handleEventClick}></Timebar>
<!-- Time scroller -->
<input type="range" min={minTime} max={maxTime} step={1} bind:value={currentTime} style="width: {chartWidth}px;"/>
<p>Data: {new Date(currentTime).toLocaleDateString()}</p>

<h2>Dados do gráfico</h2>
<table border="1">
  <thead>
    <tr>
      <th>Divisão</th>
      <th>Latitude</th>
      <th>Longitude</th>
      <th>Tamanho</th>
      <th>Direção</th>
      <th>Data</th>
      <th>Temperatura</th>
    </tr>
  </thead>
  <tbody>
    {#each interpolatedData as d}
      <tr>
        <td>{d.division}</td>
        <td>{d.lat}</td>
        <td>{d.lon}</td>
        <td>{d.size}</td>
        <td>{d.direction}</td>
        <td>{d.date}</td>
        <td>{d.temp}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#if joinedData.length > 0}
  <table border="1">
    <thead>
      <tr>
        <th>Divisão</th>
        <th>Latitude</th>
        <th>Longitude</th>
        <th>Tamanho</th>
        <th>Direção</th>
        <th>Data</th>
        <th>Temperatura</th>
      </tr>
    </thead>
    <tbody>
      {#each joinedData as d}
        <tr>
          <td>{d.division}</td>
          <td>{d.lat}</td>
          <td>{d.lon}</td>
          <td>{d.size}</td>
          <td>{d.direction}</td>
          <td>{d.date}</td>
          <td>{d.temp}</td>
        </tr>
      {/each}
    </tbody>
  </table>
{:else}
  <p>Carregando dados da tabela...</p>
{/if}

<!-- <h2>Dados no gráfico</h2>
<table border="1">
  <thead>
    <tr>
      <th>Divisão</th>
      <th>Latitude</th>
      <th>Longitude</th>
      <th>Tamanho</th>
      <th>Direção</th>
      <th>Data</th>
      <th>Temperatura</th>
    </tr>
  </thead>
  <tbody>
    {#each interpolatedData as d}
      <tr>
        <td>{d.division}</td>
        <td>{d.lat}</td>
        <td>{d.lon}</td>
        <td>{d.size}</td>
        <td>{d.direction}</td>
        <td>{d.date}</td>
        <td>{d.temp}</td>
      </tr>
    {/each}
  </tbody>
</table> -->

<style>
  #chart {
      display: block;
      margin-bottom: 8px;
  }

  input[type="range"] {
      display: block;
      height: 6px;
      background: #ddd;
      border-radius: 5px;
      appearance: none;
      outline: none;
      margin-bottom: 0.5rem;
  }

  input[type="range"]::-webkit-slider-thumb {
      appearance: none;
      width: 16px;
      height: 16px;
      background: #444;
      border-radius: 50%;
      cursor: pointer;
  }

  input[type="range"]::-moz-range-thumb {
      width: 16px;
      height: 16px;
      background: #444;
      border-radius: 50%;
      cursor: pointer;
  }
</style>
