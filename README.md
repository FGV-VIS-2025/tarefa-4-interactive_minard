# Interactive Minard: a new perspective on Napoleon's march

A ideia dessa visualização foi criar uma versão interativa e mais facilmente compreensível do famoso gráfico do Minard sobre o ataque de Napoleão à Rússia em 1812 (mostrado abaixo), de modo que fossem melhor transmitidas algumas informações, principalmente os movimentos realizados pelas tropas.

![Gráfico do Minard](https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Minard.png/960px-Minard.png)

A principal inspiração para o projeto foi esta [versão interativa](https://www.masswerk.at/minard/) criada por Norbert Landsteiner em 2013.

Com relação aos dados, utilizamos principalmente as informações já extraídas do gráfico original e disponíveis nas seguintes fontes:

- [Biblioteca](https://github.com/stdlib-js/datasets-minard-napoleons-march) com os conjuntos de dados da marcha de Napoleão exibidos no gráfico;
- A visualização de inspiração citada acima, da qual foram utilizados principalmente os dados sobre os eventos cadastrados.

Além disso, as imagens exibidas foram retiradas das páginas da [Wikipedia](https://www.google.com/url?sa=t&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwjo5NHdr_uMAxVjrpUCHewfFNUQFnoECAoQAQ&url=https%3A%2F%2Fpt.wikipedia.org%2Fwiki%2FWikip%25C3%25A9dia%3AP%25C3%25A1gina_principal&usg=AOvVaw1jX7me8DvQCKg5opjM-YpV&opi=89978449) sobre os respectivos eventos exibidos.

## Deciões de design

- Nosso elemento principal é um **scatter plot** com os eixos correspondendo à latitude e à longitude de modo a representar explicitamente uma área geográfica e mostrar as posições das tropas no território ao longo do tempo, que é controlado por um slider. Dessa forma, cada ponto exibido representa um pelotão do exército em sua correspondente posição no tempo selecionado. Além disso, temos os seguintes elementos gráficos:
  - Com relação à **cor** dos pontos, foi utilizada a mesma paleta do gráfico original, com uma cor para os momentos de avanço da tropa e outra para os momentos de retorno. No canto superior esquerdo, exibimos a legenda dessas cores.
  - O **tamanho** dos pontos foi mapeado para o tamanho das tropas, semelhantemente ao gráfico original, com o objetivo de mostrar sua consistente diminuição ao longo do tempo. Vale ressaltar que a relação foi feita com a área dos círculos, e não com seus raios. Assim, uma redução da tropa pela metade consiste em uma redução proporcional na área do círculo. Temos também uma legenda para esse mapeamento, exibida logo abaixo do eixo x. Isso foi necessário pois não havia espaço suficiente para posicioná-la em seu interior.
  - 