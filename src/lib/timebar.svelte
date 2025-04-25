<script>
    export let events;  // Default empty object
    export let minTime;      // Required prop
    export let maxTime;      // Required prop
    export let currentTime;  // Required prop
    export let chartWidth = 800; // Optional prop with default
    import { createEventDispatcher } from 'svelte';
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
  </script>
  
  <svelte:window on:click={() => handleClick(null)} />
  
  <div class="timeline-container">
    {#each eventList as event (event.id)}
      {#if event.label !== "None"}
        <div style="margin-bottom: 1rem;">
          <button
            class="event-button"
            on:click|stopPropagation={() => handleClick(event.id)}
            on:keydown={(e) => handleKeyDown(e, event.id)}
            tabindex="0"
            title={event.info}
          >
            <div class="event-date">{event.label}</div>
          </button>
        </div>
      {/if}
    {/each}
  
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

<!-- Time labels -->
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
  