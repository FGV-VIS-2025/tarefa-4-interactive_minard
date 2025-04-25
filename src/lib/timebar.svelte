<script>
    export let events; // pass in the array from above

    // Transformando objeto em array
    let eventList = Object.entries(events).map(([id, info]) => ({
    id,
    ...info
    }));
  </script>
  
  <style>
    .timeline-container {
      display: flex;
      align-items: center;
      border: 3px solid black;
      border-radius: 50px;
      padding: 0.5rem;
      overflow-x: auto;
      background: white;
    }
  
    .event-box {
      flex: 0 0 auto;
      padding: 1rem;
      border-right: 1px solid black;
      text-align: center;
      min-width: 100px;
    }
  
    .event-box:last-child {
      border-right: none;
    }
  
    .timeline-container::before,
    .timeline-container::after {
      content: '';
      width: 30px;
      height: 100%;
      background: white;
      border: 3px solid black;
      border-radius: 50%;
      margin: 0 0.25rem;
    }
  
    /* .event-title {
      font-weight: bold;
    } */
  
    .event-date {
      font-size: 0.8rem;
      color: gray;
    }
  </style>
  
  <div class="timeline-container">
    {#each eventList as event (event.id)}
      <div class="event-box" title={event.info}>
        <!-- <div class="event-title">{event.id}</div> -->
        <div class="event-date">{event.date}</div>
      </div>
    {/each}
  </div>
  