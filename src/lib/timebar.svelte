<script>
    export let events;
    export let minTime;
    export let maxTime;
    export let currentTime;
    export let chartWidth = 800;

    import { createEventDispatcher } from 'svelte';
    import { parseDate} from "$lib/utils";
    import Icon from '$lib/Icon.svelte';

    const dispatch = createEventDispatcher();
    let selectedId = null;

    let eventList = Object.entries(events).map(([id, info]) => ({
      id,
      ...info
    }));

    function handleClick(eventId) {
      selectedId = eventId;
      dispatch('eventclick', { eventId });
    }

    function handleKeyDown(e, eventId) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        handleClick(eventId);
      }
    }

    function handleTimeChange(e) {
      const time = Number(e.target.value);
      dispatch('timeupdate', { time });
    }

    function calculateProportions() {
      return eventList.map(event => {
        let date = parseDate(event.date);
        let proportion = (date - minTime) / (maxTime - minTime);
        let x = chartWidth * proportion;
        return { ...event, x };
      });
    }
    
    function getIcon(name) {
        switch (name) {
        case 'river': return /* river SVG */;
        case 'burned': return /* burned SVG */;
        case 'depot': return /* depot SVG */;
        case 'battle': return /* battle SVG */;
        case 'artillery': return /* artillery SVG */;
        case 'camp': return /* camp SVG */;
        case 'napoleon': return /* napoleon SVG */;
        case 'cossacks': return /* cossacks SVG */;
        default: return '';
        }
    }

    $: eventsWithPositions = calculateProportions();
    console.log(eventsWithPositions)
</script>

<svelte:window on:click={() => handleClick(null)} />

<div class="timeline-container">
  <div class="events-bar" style="position: relative; width: {chartWidth}px; height: 50px; background: #eee;">
    {#each eventsWithPositions as event (event.id)}
      {#if event.label !== "None"}
        <button
          class="event-button"
          on:click|stopPropagation={() => handleClick(event.id)}
          on:keydown={(e) => handleKeyDown(e, event.id)}
          style="position: absolute; left: {event.x}px; top: 10px;"
          tabindex="0"
          title={event.info}
        >
        <Icon name={event.icon} />
        </button>
      {/if}
    {/each}
  </div>

  {#if selectedId}
    {#each eventList as event (event.id)}
      {#if selectedId === event.id}
        <div class="event-details">
          {@html event.info}
        </div>
      {/if}
    {/each}
  {/if}

  <input 
    type="range" 
    min={minTime} 
    max={maxTime} 
    step={1} 
    bind:value={currentTime}
    on:input={handleTimeChange}
    class="time-slider"
    style="width: {chartWidth}px;"
  />

  <div class="time-labels">
    <span>{new Date(minTime).toLocaleDateString()}</span>
    <span>{new Date(maxTime).toLocaleDateString()}</span>
  </div>
</div>

  
  <style>
    .timeline-container {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
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
  