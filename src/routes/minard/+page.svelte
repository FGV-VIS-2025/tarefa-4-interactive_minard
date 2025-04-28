<script>
    let image = "/images/Minard.png"; // ajuste o caminho da sua imagem aqui
</script>

<div class="container">
    <div class="content">
        <h1>Charles Minard's Map of Napoleon's Russian Campaign</h1>
        <p class="description">
            This famous flow map, created by Charles Minard in 1869, illustrates
            the losses suffered by Napoleon's army during the Russian campaign
            of 1812. It is often cited as one of the best examples of data
            visualization.
        </p>
        <img src={image} alt="Original Minard" class="responsive-image" />
    </div>
</div>

<style>
    .container {
        text-align: center;
        max-width: 800px;
        margin: 0 auto;
        padding-top: 0;
        position: relative;
        top: 0;
    }

    .container img,
    .container p {
        display: inline-block;
        vertical-align: top;
    }

    .content {
        text-align: center;
        max-width: 900px;
    }

    h1 {
        font-size: 2rem;
        margin-bottom: 1rem;
    }

    .description {
        font-size: 1.2rem;
        color: #555;
        margin-bottom: 1rem;
    }

    .responsive-image {
        max-width: 100%;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        object-fit: contain;
    }
</style>
