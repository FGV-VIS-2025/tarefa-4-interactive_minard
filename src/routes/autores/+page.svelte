<script>
    const items = [
      {
        src: '/images/Kauan.jpeg',
        name: 'Kauan Mariani Ferreira',
        description: 'Graduando em Ciencia de Dados e Inteligencia Irtificila pela FGV',
        contact: { linkedin: 'https://www.linkedin.com/in/kauanmferreira/', github: 'https://github.com/kauanmaf' }
      },
      {
        src: '/images/Pedro.png',
        name: 'Pedro Henrique Coterli',
        description: 'Graduando em Ciencia de Dados e Inteligencia Irtificila pela FGV',
        contact: { linkedin: 'https://www.linkedin.com/in/pedro-henrique-coterli-8b05562b2/', github: 'https://github.com/PedroPHC25' }
      },
      {
        src: '/images/Gustavo.jpeg',
        name: 'Gustavo Tironi',
        description: 'Graduando em Ciencia de Dados e Inteligencia Irtificila pela FGV',
        contact: { linkedin: 'https://www.linkedin.com/in/gustavotironi/', github: 'https://github.com/gtironi' }
      }
    ];
</script>

<div class="gallery">
    {#each items as item}
        <div class="item">
            <img src={item.src} alt={item.name} />
            <p class="name">{item.name}</p>
            <p class="description">{item.description}</p>
            <div class="contacts">
                <a href={item.contact.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
                <a href={item.contact.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            </div>
        </div>
    {/each}
</div>

<style>
    .gallery {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-top: 2rem;
        flex-wrap: wrap;
    }

    .item {
        text-align: center;
        max-width: 250px;
    }

    .item img {
        width: 200px;
        height: auto;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    .item .name {
        margin-top: 0.5rem;
        font-size: 1.2rem;
        font-weight: 600;
    }

    .item .description {
        margin-top: 0.3rem;
        font-size: 1rem;
        color: #555;
    }

    .item .contacts {
        margin-top: 0.5rem;
    }

    .item .contacts a {
        margin: 0 0.5rem;
        text-decoration: none;
        color: #0073e6;
        font-weight: 500;
    }

    .item .contacts a:hover {
        text-decoration: underline;
    }
</style>
