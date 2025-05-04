# Interactive Minard: a new perspective on Napoleon's march

A ideia dessa visualização foi criar uma versão interativa e mais facilmente compreensível do famoso gráfico do Minard sobre o ataque de Napoleão à Rússia em 1812 (mostrado abaixo), de modo que fossem melhor transmitidas algumas informações, principalmente os movimentos realizados pelas tropas.

![Gráfico do Minard](https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Minard.png/960px-Minard.png)

A principal inspiração para o projeto foi esta [versão interativa](https://www.masswerk.at/minard/) criada por Norbert Landsteiner em 2013.

Com relação aos dados, utilizamos principalmente as informações já extraídas do gráfico original e disponíveis nas seguintes fontes:

- [Biblioteca](https://github.com/stdlib-js/datasets-minard-napoleons-march) com os conjuntos de dados da marcha de Napoleão exibidos no gráfico;
- A visualização de inspiração citada acima, da qual foram utilizados principalmente os dados sobre os eventos cadastrados.

Além disso, as imagens exibidas foram retiradas das páginas da [Wikipedia](https://www.google.com/url?sa=t&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwjo5NHdr_uMAxVjrpUCHewfFNUQFnoECAoQAQ&url=https%3A%2F%2Fpt.wikipedia.org%2Fwiki%2FWikip%25C3%25A9dia%3AP%25C3%25A1gina_principal&usg=AOvVaw1jX7me8DvQCKg5opjM-YpV&opi=89978449) sobre os respectivos eventos exibidos.

Já vale destacar que os dados de temperatura, de posição e de tamanho do pelotão exibidos na visualização foram **interpolados** linearmente com base nas informações presentes nessas bases de dados e na visualização original. Portanto, a maioria dos dados mostrados é apenas aproximada e pode não representar o que de fato aconteceu. Dado isso, destacamos por meio da tooltip dos pontos a existência de tal aproximação.

## Deciões de design

- Nosso elemento principal é um **scatter plot** com os eixos correspondendo à latitude e à longitude de modo a representar explicitamente uma área geográfica e mostrar as posições das tropas no território ao longo do tempo, que é controlado por um slider. Dessa forma, cada ponto exibido representa um pelotão do exército em sua correspondente posição no tempo selecionado. Além disso, temos os seguintes elementos gráficos:
  - Com relação à **cor** dos pontos, foi utilizada a mesma paleta do gráfico original, com uma cor para os momentos de avanço da tropa e outra para os momentos de retorno. No canto superior esquerdo, exibimos a legenda dessas cores.
  - O **tamanho** dos pontos foi mapeado para o tamanho das tropas, semelhantemente ao gráfico original, com o objetivo de mostrar sua consistente diminuição ao longo do tempo. Vale ressaltar que a relação foi feita com a área dos círculos, e não com seus raios. Assim, uma redução da tropa pela metade consiste em uma redução proporcional na área do círculo. Temos também uma legenda para esse mapeamento, exibida logo abaixo do eixo x. Isso foi necessário pois não havia espaço suficiente para posicioná-la em seu interior.
  - A **tooltip** dos pontos é exibida ao sobrepôr o mouse a eles. Ela exibe algumas das informações já mostradas visualmente pela visualização, mas de forma mais detalhada para caso seja de interesse do usuário. Nela, mostramos a divisão desse ponto (qual dos grupos em que a armada se dividiu ele representa), a direção (avanço ou retorno) e o tamanho, a data e a temperatura (quando existente) aproximados para aquele momento.
  - Por fim, temos **marcadores** que indicam as posições de determinados eventos que ocorreram durante essa jornada, que podem ser selecionados e ficam destacados quando isso acontece, além de levar automaticamente a linha do tempo para a data desse evento. Adicionalmente, eles informam o nome do evento correspondente ao sobrepôr o mouse a eles.
- A seguir, temos um **slider** representando uma linha do tempo, com a qual o usuário pode interagir (seja movendo-o manualmente ou apenas apertando o botão de "play/pause") e observar os demais gráficos se movimentando simultaneamente e exibindo as informações correspondentes à data selecionada nele. Isso fornece uma maneira bem conhecida e intuitiva de interação com dados temporais, de modo que é facilmente compreendido seu funcionamento. 
  - Esse slider possui também **indicadores** dos eventos presentes na visualização (os mesmos exibidos como marcadores no scatter plot), nos quais o usuário pode clicar para ser levado ao momento específico daquele evento. Cada um possui um símbolo indicando a categoria do evento e cada um está posicionado na linha do tempo de acordo justamente com a data de sua ocorrência. Com isso, conseguimos transmitir eficientemente a informação da ordenação cronológica desse eventos, que possuiam até agora apenas uma representação visual para sua posição geográfica.
  - Por último, exibimos próxima ao botão de "play/pause" a data exata em que o slider se encontra, com o objetivo de fornecer facilmente ao usuário essa informação.
- Em seguida, temos um **gráfico de barra** que indica a temperatura na data atual. Fizemos ela verticalmente para se assemelhar a um termômetro e com o eixo começando em 0° C no limite superior e diminuindo seu valor à medida que ele desce. Com a animação fornecida por esse gráfico à medida que o tempo é avançado, mostramos ao usuário a importância da queda consistente da temperatura na derrota do exército de Napoleão.
  - Um problema enfrentado foi a questão da inexistência desses dados para grande parte do período exibido. Para amenizar seu impacto, optamos por manter esse gráfico com uma certa transparência e com um aviso sobre ele informando que não há dados para exibir. Com isso, conseguimos deixar claro o motivo de esse gráfico não ser exibido o tempo todo. Consideramos também a possibilidade de desaparecer completamente com sua estrutura nesses momentos, mas concluimos que um espaço completamente vazio ficaria menos apropriado que com o gráfico parcialmente escondido.
- O próximo elemento presente em nossa visualização é um **gráfico de donut**, que indica a proporção aproximada da tropa sobrevivente em relação ao seu contingente inicial em uma determinada data. Optamos por essa codificação pois ela é capaz de transmitir muito bem a informação de proporção entre 2 elementos (nesse caso, soldados sobreviventes e total), além de ser facilmente interpretada pelos usuários em geral.
- Por fim, temos breves **descrições** à direita do gráfico. O texto inicial, antes do início das interações, explica ao usuário a origem da visualização e as possíveis interações que ele pode realizar. Com a seleção de eventos, esses textos passam a fornecer informações a respeito do último evento existente na linha do tempo, aparecendo também quando um evento recebe um clique, seja em seu marcador no scatter plot, seja em seu indicador na linha do tempo. O objetivo desses textos e imagens é transmitir a informação da trajetória dessa armada por meio de um storytelling, no qual o usuário pode ir avançando na linha do tempo e pausando para ler e compreender o que ocorreu naquele momento específico.

## Desenvolvimento do projeto

Abaixo estão os desenvolvedores desse projeto e suas respectivas principais participações:

- **Pedro Henrique Coterli**
  - Partes desenvolvidas:
    - Geração dos dados utilizados por meio de interpolação;
    - Scatter plot, com as atribuições de cor e tamanho e suas respectivas legendas;
    - Gráfico de barra da temperatura.
  - A parte mais trabalhosa foi a primeira, pois exigiu um entendimento profundo dos dados que estavam disponíveis de modo a aproveitá-los o máximo possível para realizar os cálculos de informações aproximadas e obter estimativas tão precisas quanto fosse permitido.
  - Tempo estimado de desenvolvimento (até o momento): 23 horas.

- **Kauan Mariani Ferreira**
  - Partes Desenvolvidas:
      - Adição dos Pins no plot
      - Desenvolvimento da timebar por completa e garantindo a interatividade com o plot
      - Adição dos ícones na timebar
      - Adição dos detalhes sobre cada batalha, bem como as imagens 
      - Reatividade dos pin points na timebar
  - A parte mais trabalhosa foi integrar o timeCurrent com a descrição dos eventos. Nossa ideia era que, ao entrar na página, a pessoa recebesse uma introdução sobre o projeto. No entanto, assim que ela clicasse em um evento ou interagisse com o seletor de tempo, a descrição exibida deveria passar a mostrar o último evento anterior ao currentTime. Para isso, precisei pensar em uma lógica usando variáveis booleanas e lidar com vários bugs. Até conseguir deixar tudo bem integrado e funcionando de forma fluida, levou um bom tempo.
  - Tempo estimado de desenvolvimento: 17 horas.

- **Gustavo Tironi**
  - Partes Desenvolvidas:
      - Implementação do doughnut plot com iteratividade
      - Desenvolvimento do sistema de paginação e páginas para organizar o conteúdo exibido
      - Legendas e descrições para a visualização
      - Implementação do background (mapa) para o gráfico
 - A parte mais desafiadora foi lidar com o mapa e a implementação da interatividade no gráfico de doughnut. Trabalhar com mapas, especialmente no contexto que precisávamos, foi complicado, pois havia pouca documentação sobre como fazer o clipping de uma região específica. Além disso, foi necessário um esforço para sincronizar as projeções do mapa (que utilizam Mercator) com a transformação das coordenadas de latitude e longitude usadas no gráfico de dispersão (que usavam uma transformação linear).
  - Tempo estimado de desenvolvimento: 16 horas.

## Uso de IA

Ao longo do desenvolvimento do projeto, foi usada IA generativa como suporte e orientação para a codificação das ideias e processos planejados pela equipe, sendo aplicada principalmente para a compreensão e utilização de uma linguagem de programação (JavaScript) à qual fomos apenas recentemente introduzidos e com a qual não tínhamos tanta experiência. Além disso, ela foi utilizada também para a geração dos textos-resumo dos eventos apresentados na visualização.
