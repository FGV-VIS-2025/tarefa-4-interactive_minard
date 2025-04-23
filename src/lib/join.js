// Função que faz o join das tabelas de exército e temperatura
// fazendo interpolação linear para os dados exatos inexistentes
export function join(army, temperature)
{
    // Filtrando a direção de retorno
    const filteredArmy = army.filter(d => d.direction === "R");
    // Ordenando as temperaturas
    const sortedTemp = temperature.slice().sort((a, b) => a.lon - b.lon);

    // Função auxiliar para interpolar valores entre dois pontos
    function interpolate(previousValue, nextValue, pathPercentage)
    {
        return previousValue + (nextValue - previousValue) * pathPercentage;
    }

    // Função auxiliar para interpolar datas
    function interpolateDate(date1, date2, pathPercentage)
    {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const interpolatedTime = interpolate(d1.getTime(), d2.getTime(), pathPercentage);
        return new Date(interpolatedTime).toDateString();
    }

    // Fazendo o join
    const result = filteredArmy.map(d => 
    {
        const lon = d.lon;

        // Verificando se existe longitude exata em temperature
        const exact = sortedTemp.find(t => t.lon === lon);
        // Se existir, retorna esses valores
        if (exact)
        {
            return {...d, temp: exact.temp, date: exact.date};
        }

        // Encontrando as longitudes anterior e posterior para interpolar
        const before = [...sortedTemp].reverse().find(t => t.lon < lon);
        const after = sortedTemp.find(t => t.lon > lon);

        if (before && after)
        {
            // Interpolando a temperatura e a data
            const pathPercentage = (lon - before.lon)/(after.lon - before.lon);
            const interpolatedTemp = interpolate(before.temp, after.temp, pathPercentage);
            const interpolatedDate = interpolateDate(before.date, after.date, pathPercentage);

            return {...d, temp: interpolatedTemp, date: interpolatedDate};
        }
        else
        {
            // A longitude está fora do range dos dados
            return {...d, temp: null, temp: null};
        }
    }
    );

    return result;
}