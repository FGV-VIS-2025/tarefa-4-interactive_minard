<script>
    export let playing = false;
    export let onTogglePlay;

    function handleClick()
    {
        onTogglePlay();
    }
</script>

<button on:click={handleClick}>
    {playing ? "Pause" : "Play"}
</button>

<style>
    button {
        padding: 5px 10px;
        font-size: 14px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        position: absolute;
        top: 40px;
        left: 15px;
        cursor: pointer;
    }
  
    button:hover {
        background-color: #45a049;
    }
  </style>