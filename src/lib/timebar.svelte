<script>
  export let events;
  export let minTime;
  export let maxTime;
  export let currentTime;
  export let chartWidth = 800;

  import { onMount } from "svelte";
  import * as d3 from "d3";
  import { createEventDispatcher } from "svelte";
  import { parseDate } from "$lib/utils";
  import Icon from "$lib/icon.svelte";

  const dispatch = createEventDispatcher();
  const buttonWidth = 40;
  let diameter_circle = 16;
  let selectedId = null;

  let tooltipElement;

  let eventList = Object.entries(events).map(([id, info]) => ({
    id,
    ...info,
  }));

  function handleClick(eventId) {
    selectedId = eventId;
    dispatch("eventclick", { eventId });
  }

  function handleKeyDown(e, eventId) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      handleClick(eventId);
    }
  }

  function handleTimeChange(e) {
    const time = Number(e.target.value);
    dispatch("timeupdate", { time });
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }
  function calculateProportions() {
    return eventList
      .map((event, index) => {
        if (event.date !== "None") {
          let date = parseDate(event.date);
          let proportion = (date - minTime) / (maxTime - minTime);
          proportion = clamp(proportion, 0, 1); // <-- aqui: garante que fica entre 0 e 1
          let x =
            (chartWidth - diameter_circle) * proportion + diameter_circle / 2;
          let top = index % 2 === 0;
          return { ...event, x, top };
        }
        return null;
      })
      .filter((event) => event !== null);
  }

  $: eventsWithPositions = calculateProportions();
  function calculateLeftPositions(eventsWithPositions) {
    const offsets = {
      gjatsk: -15,
      borodino: 5,
      shevardino: -5,
      moscow1: 10,
      moscow2: -15,
      maloyaroslavets: 10,
    };

    const positions = {};
    for (let event of eventsWithPositions) {
      const offset = offsets[event.id] ?? 0; // Se não estiver no dicionário, usa 0
      positions[event.id] = event.x - buttonWidth / 2 + offset;
    }
    return positions;
  }

  $: dictionary_position = calculateLeftPositions(eventsWithPositions);
</script>

<svelte:window on:click={() => handleClick(null)} />

<div
  class="timeline-container"
  style="position: relative; width: {chartWidth}px;"
>
  <!-- Camada dos ícones de CIMA -->
  <div class="icons-top" style="position: relative; width: 100%; height: 50px;">
    {#each eventsWithPositions as event (event.id)}
      {#if event.label !== "None" && event.top}
        <!-- Linha de conexão -->
        <div
          class="connection-line"
          style="position: absolute;
                     left: {event.x}px;
                     top: 40px;
                     height: 30px;
                     width: 1px;
                     background-color: #000;
                     transform: translateX(-0.5px);"
        ></div>

        <button
          class="event-button"
          on:click|stopPropagation={() => handleClick(event.id)}
          on:keydown={(e) => handleKeyDown(e, event.id)}
          style="position: absolute; left: {dictionary_position[event.id]}px;"
          on:mouseenter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const containerRect =
              e.currentTarget.offsetParent.getBoundingClientRect();

            const tooltipWidth = tooltipElement.offsetWidth;
            const tooltipHeight = tooltipElement.offsetHeight;

            const x =
              rect.left -
              containerRect.left +
              rect.width / 2 -
              tooltipWidth / 2 +
              50;
            const y = rect.top - containerRect.top - tooltipHeight - 20;

            tooltipElement.innerHTML = `<div><strong>${event.title}</strong></div>`;
            tooltipElement.style.opacity = 0.9;
            tooltipElement.style.left = `${x}px`;
            tooltipElement.style.top = `${y}px`;
          }}
          on:mouseleave={() => {
            tooltipElement.style.opacity = 0;
          }}
          tabindex="0"
        >
          <Icon name={event.icon} />
        </button>
      {/if}
    {/each}
  </div>

  <input
    type="range"
    min={minTime}
    max={maxTime}
    step={1}
    bind:value={currentTime}
    on:input={handleTimeChange}
    class="time-slider transparent-slider"
    style="width: 100%; margin: 0;"
  />

  <!-- Camada dos ícones de BAIXO -->
  <div
    class="icons-bottom"
    style="position: relative; width: 100%; height: 50px;"
  >
    {#each eventsWithPositions as event (event.id)}
      {#if event.label !== "None" && !event.top}
        <!-- Linha de conexão -->
        <div
          class="connection-line"
          style="position: absolute;
                     left: {event.x}px;
                     bottom: 40px;
                     height: 30px;
                     width: 1px;
                     background-color: #000;
                     transform: translateX(-0.5px);"
        ></div>

        <button
          class="event-button"
          on:click|stopPropagation={() => handleClick(event.id)}
          on:keydown={(e) => handleKeyDown(e, event.id)}
          on:mouseenter={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const containerRect =
              e.currentTarget.offsetParent.getBoundingClientRect();

            const tooltipWidth = tooltipElement.offsetWidth;
            const tooltipHeight = tooltipElement.offsetHeight;

            const x =
              rect.left -
              containerRect.left +
              rect.width / 2 -
              tooltipWidth / 2 +
              50;
            const y = rect.top - containerRect.top - tooltipHeight + 10;

            tooltipElement.innerHTML = `<div><strong>${event.title}</strong></div>`;
            tooltipElement.style.opacity = 0.9;
            tooltipElement.style.left = `${x}px`;
            tooltipElement.style.top = `${y}px`;
          }}
          on:mouseleave={() => {
            tooltipElement.style.opacity = 0;
          }}
          style="position: absolute; left: {dictionary_position[
            event.id
          ]}px; bottom: 0;"
          tabindex="0"
        >
          <Icon name={event.icon} />
        </button>
      {/if}
    {/each}

    <div
      id="tooltip"
      bind:this={tooltipElement}
      style="
        position: absolute;
        pointer-events: none;
        opacity: 0;
        z-index: 999;
        background: white;
        border: 1px solid #ccc;
        border-radius: 4px;
        padding: 8px;
        font: 14px sans-serif;
        max-width: 200px;
      "
    ></div>
  </div>
</div>

<style>
  :root {
    --radius_circle: 16px;
  }
  .timeline-container {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    width: 100%;
    pointer-events: all;
  }

  .event-button {
    cursor: pointer;
    padding: 0.5rem;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
  }

  .event-button:focus {
    outline: 2px solid blue;
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
    width: var(--radius_circle);
    height: var(--radius_circle);
    background: #000;
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
  .transparent-slider {
    background: none;
    position: relative;
    z-index: 2;
  }
</style>
