<script>
    import { createEventDispatcher } from 'svelte';
    const dispatch = createEventDispatcher();
  
    export let events;
  
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
  
          {#if selectedId === event.id}
            <div class="event-details" style="margin-top: 0.5rem; font-size: 0.9rem; background: #f9f9f9; border: 1px solid #ccc; padding: 0.5rem;">
              {event.info}
            </div>
          {/if}
        </div>
      {/if}
    {/each}
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
  </style>
  