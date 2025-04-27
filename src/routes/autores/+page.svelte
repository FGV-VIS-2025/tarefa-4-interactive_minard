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
    import TemperatureBar from "$lib/temperaturebar.svelte";
    import Description from '$lib/description.svelte';
    import Doughnut from "$lib/doughnut.svelte";
    import PlayButton from "$lib/PlayButton.svelte";

    var joinedData = join(army, temperature, eventsDate);
    joinedData = joinedData.filter(d => parseDate(d.date));

    // Pegando todas as datas ordenadas
    const times = [...new Set(joinedData.map(d => parseDate(d.date)))].sort((a, b) => a - b);
    // Pegando as datas mínima e máxima (para os limites do time scroller)
    const minTime = times[0] - 1;
    var maxTime = times.at(-1);
    maxTime = new Date(maxTime);
    maxTime.setDate(maxTime.getDate() + 1);
    maxTime = maxTime.getTime();

  // Tempo selecionado no time scroller
  let currentTime;
  // Começa o tempo no time scroller como o mínimo
  currentTime = minTime;



  // Elementos do svg
  let x, y;
  let svgElement;
  let svg;
  let tooltip;
  let colorScale;
  let sizeScale;
  let height;

  let chartWidth = 800;

  // Configurações do gráfico
  onMount(() => {
      const width = chartWidth;
      height = 300;
      const margin = {top: 20, right: 30, bottom: 60, left: 170};

      colorScale = d3.scaleOrdinal()
          .domain(["A", "R"])
          .range(["#cf9e96", "#030303"]);

      sizeScale = d3.scaleLinear()
          .domain([0, d3.max(joinedData, d => d.size)])
          .range([5, 12000]);

      svg = d3.select(svgElement)
          .attr("width", width)
          .attr("height", 1.3*height);

      const colorLegend = svg.append("g")
          .attr("transform", "translate(20, 20)");

      colorLegend.selectAll("rect")
          .data(colorScale.domain())
          .enter()
          .append("rect")
          .attr("x", 160)
          .attr("y", (d, i) => i * 20)
          .attr("width", 20)
          .attr("height", 20)
          .attr("fill", colorScale);

      colorLegend.selectAll("text")
          .data(colorScale.domain())
          .enter()
          .append("text")
          .attr("x", 185)
          .attr("y", (d, i) => i * 20 + 15)
          .text(d => d === "A" ? "Advance" : "Retreat")
          .style("font-size", "14px");

      // Legenda de tamanhos
      const sizeLegend = svg.append("g")
          .attr("transform", "translate(20, 150)");

      const sizeLegendScale = d3.scaleLinear()
          .domain([0, d3.max(joinedData, d => d.size)])
          .range([5, 12000]);

      const sizeLegendRect = sizeLegend.append("g")
          .attr("transform", "translate(550, 180)");

      sizeLegendRect.append("rect")
          .attr("x", -60)    // ajusta para cobrir a legenda
          .attr("y", -30)
          .attr("width", 250)
          .attr("height", 80)
          .attr("fill", "white")    // cor de fundo
          .attr("stroke", "black")  // borda
          .attr("stroke-width", 0.7)
          .attr("rx", 5)            // bordas arredondadas (opcional)
          .attr("ry", 5);

      sizeLegend.selectAll("circle")
          .data([1000, 50000, 100000])
          .enter()
          .append("circle")
          .attr("cx", (d, i) => i * (10*i + 30) + 600)
          .attr("cy", 190)
          .attr("r", d => Math.sqrt(sizeLegendScale(d) / Math.PI))
          .attr("fill", "lightgray")
          .attr("stroke", "#030303")
          .attr("stroke-width", 0.2);

      sizeLegend.selectAll("text")
          .data([1000, 50000, 100000])
          .enter()
          .append("text")
          .attr("x", (d, i) => i * (10*i + 30) + 600)
          .attr("y", 195)
          .attr("text-anchor", "middle")
          .text(d => d/1000)
          .style("font-size", "13px");

      sizeLegend.append("text")
          .attr("x", 540)
          .attr("y", 187)
          .attr("text-anchor", "middle")
          .text("Platton size")
          .style("font-size", "14px");
      sizeLegend.append("text")
          .attr("x", 540)
          .attr("y", 203)
          .attr("text-anchor", "middle")
          .text("(in thousands)")
          .style("font-size", "14px");

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
          .call(d3.axisLeft(y).ticks((y.domain()[1] - y.domain()[0]) * 2))
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
      setTimeout(() => currentTime = newTime, 0);
    }
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
  $: if (svg && interpolatedData && typeof x === "function" && typeof y === "function") {
        tooltip.style("opacity", 0);

      const circles = svg.select(".armies-group").selectAll(".army-circle")
          .data(interpolatedData, d => d.size);

        const circlesUpdate = circles.enter()
                .append("circle")
                .attr("class", "army-circle")
                .on("mouseover", (event, d) => {
                    tooltip.style("opacity", 0.9);
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
                    tooltip.style("opacity", 0)
                })
                .merge(circles);

    circlesUpdate
        .attr("cx", d => x(d.lon))
        .attr("cy", d => y(d.lat))
        .attr("r", d => Math.sqrt(sizeScale(d.size) / Math.PI))
        .attr("fill", d => colorScale(d.direction))
        .attr("stroke", d => d.direction === "A" ? "#030303" : "#cf9e96")
        .attr("stroke-width", 0.5);

        circlesUpdate.sort((a, b) => d3.descending(a.size, b.size));

    circles.exit().remove();
}

// Atualiza os marcadores de eventos
$: if (svg && typeof x === 'function' && typeof y === 'function' && Object.keys(eventInfo).length > 0) {
    const eventPoints = Object.entries(eventInfo).map(([id, info]) => ({
        id,
        ...info
    }));

    const markers = svg.select(".events-group").selectAll(".event-marker")
        .data(eventPoints, d => d.id);

    // Create new markers if they don't exist
    const enter = markers.enter()
        .append("foreignObject")
        .attr("class", "event-marker")
        .attr("width", 20)
        .attr("height", 20)
        .html(d => markerHtml(d));

    markers.merge(enter)
        .attr("x", d => x(d.lon) - 10)
        .attr("y", d => y(d.lat) - 10)
        .html(d => markerHtml(d));

    markers.exit().remove();
}

// Função para gerar o SVG do marcador
function markerHtml(d) {
    return `
        <svg viewBox="0 0 24 24" width="20" height="20">
            <path d="M12 21C15.5 17.4 19 14.1764 19 10.2C19 6.22355 15.866 3 12 3C8.13401 3 5 6.22355 5 10.2C5 14.1764 8.5 17.4 12 21Z"
                fill="${d.id === selectedEvent ? 'red' : 'lightblue'}"
                stroke="#000000"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"></path>
            <path d="M12 13C13.6569 13 15 11.6569 15 10C15 8.34315 13.6569 7 12 7C10.3431 7 9 8.34315 9 10C9 11.6569 10.3431 13 12 13Z"
                fill="white"
                stroke="#000000"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"></path>
        </svg>
    `;
}

    let playing = false;
    let playInterval = null;
    let step = 4_000_000;

    function togglePlay()
    {
        if (!playing)
        {
            playing = true;
            if (currentTime >= maxTime - step)
            {
                currentTime = minTime;
            }
            playInterval = setInterval(() =>
            {
                if (currentTime < maxTime - step)
                {
                    currentTime += step;
                }
                else
                {
                    clearInterval(playInterval);
                    playing = false;
                }
            }, 10)
        }
        else
        {
            playing = false;
            clearInterval(playInterval);
        }
    }


</script>

<div class="page-container">
  <h1>Interactive Minard: a new perspective on Napoleon's march</h1>

  <div class="main-container">
      <div class="chart-container">

            <div class="top-bar">
                <PlayButton id="playButton" class="play-button" {playing} onTogglePlay = {togglePlay} />

                <p class="date-text">
                    {formatDate(parseDate(currentTime))}
                </p>

              <div class="timebar-wrapper">
                  <Timebar
                      class="time-slider"
                      events={eventInfo}
                      minTime={minTime}
                      maxTime={maxTime}
                      currentTime={currentTime}
                      chartWidth={chartWidth - 100}
                      on:eventclick={handleEventClick}
                      on:timeupdate={handleTimeUpdate}
                  />
              </div>
          </div>

          <svg bind:this={svgElement} id="chart" width="800" height="500">
              <TemperatureBar {svgElement} data={interpolatedData} {x} {y} chartHeight={300} />
              <!-- Aqui dentro fica o scatter também -->
          </svg>

          <div class="doughnut-container">
              <Doughnut data={interpolatedData} />
          </div>
      </div>

      <div class="text-container">
          <Description {selectedEvent} {eventInfo} />
      </div>
  </div>
</div>

<style>
  .page-container {
      display: flex;
      flex-direction: column;
      align-items: center;  /* centraliza tudo horizontalmente */
      gap: 20px;  /* espaço fixo entre o título e o resto */
      height: 100vh;
      justify-content: center; /* opcional: centraliza o conjunto verticalmente */
      text-align: center;
      margin-top: 0px;
      justify-content: center;
      margin-left: -20px;
  }

    .main-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
        flex-wrap: wrap;
    }

    .chart-container {
        position: relative;
        width: 800px;
        max-width: 100%;  /* Garante que o gráfico seja responsivo */
        margin-left: -100px;  /* Reduz a margem à esquerda, ajustando esse valor */
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
    }

    .top-bar {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 20px;
        width: 800px;
        margin-bottom: 10px;
        position: relative;
        /* justify-content: space-between; */
    }

  svg#chart {
      align-self: flex-start;
  }

    .date-text {
        font-size: 16px;
        font-weight: bold;
        width: 90px;
        text-align: center;
        margin-top: -20px;
    }

  #chart {
      display: block;
  }

  .timebar-wrapper {
      position: relative;
      top: 0;  /* Define a posição relativa em relação ao contêiner */
      margin-bottom: 10px;  /* Espaço entre o Timebar e o gráfico */
      width: 100%;  /* Faz o timebar ocupar toda a largura disponível */
      flex-grow: 1;
      min-width: 600px;
      max-height: 600px;
  }

  .text-container {
      width: 250px;  /* Largura fixa para a caixa de texto */
      padding-left: 10px;
      max-width: 100%;  /* Garante que a largura não ultrapasse 100% */
      box-sizing: border-box;  /* Inclui o padding na largura total */
  }

  h1 {
      margin: 0;  /* tira margens automáticas que podem bagunçar */
      font-size: 30px;
  }

  .doughnut-container {
    position: relative;
    bottom: 85px;    /* move para baixo */
    right: 80px;   /* move para a direita */
    }
</style>
