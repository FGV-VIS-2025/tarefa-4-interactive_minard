import { path } from "d3";
import {groupBy} from "lodash";

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

// Função que faz o join das tabelas de exército e temperatura
// fazendo interpolação linear para os dados exatos inexistentes
export function join(army, temperature)
{
    // Filtrando a direção de retorno
    const filteredArmy = army.filter(d => d.direction === "R");
    // Ordenando as temperaturas
    const sortedTemp = temperature.slice().sort((a, b) => a.lon - b.lon);

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

// Função para converter string para timestamp
export function parseDate(dateStr)
{
    return new Date(dateStr).getTime();
}

// Função para obter pontos interpolados
export function interpolatePoints(time, data)
{
    // Separando por divisão
    const groups = groupBy(data, d => d.division);

    // Para cada divisão...
    return Object.entries(groups).map(([division, points]) =>
    {
        // Ordena os pontos por data
        const sorted = points.sort((a, b) => parseDate(a.date) - parseDate(b.date));

        // Verificando se existe data exata no dado
        const exact = sorted.find(p => parseDate(p.date) === time);
        // Se existir, retorna esses valores
        if (exact) return {...exact};

        // Pega o anterior e o seguinte ao tempo atual
        const prev = [...sorted].reverse().find(p => parseDate(p.date) <= time);
        const next = sorted.find(p => parseDate(p.date) > time);

        if (prev && next)
        {
            // Aplica a interpolação
            const t0 = parseDate(prev.date);
            const t1 = parseDate(next.date);
            const pathPercentage = (time - t0)/(t1 - t0);

            return {
                lat: interpolate(prev.lat, next.lat, pathPercentage),
                lon: interpolate(prev.lon, next.lon, pathPercentage),
                size: interpolate(prev.size, next.size, pathPercentage),
                temp: interpolate(prev.temp, next.temp, pathPercentage),
                division: +division,
                direction: prev.direction,
                date: new Date(time).toDateString()
            };
        }

        // Caso só exista um ponto, tenta retornar ele
        return null;

    }).filter(Boolean); // Remove divisões sem ponto próximo
}

function interpolateTempAndDate(baseData, point)
{
    var interpolatedTemp = undefined;
    var interpolatedDate = undefined;

    // Verificando se existe data exata no dado
    const exact = baseData.find(d => d.lon === point.lon);
    // Se existir, retorna esses valores
    if (exact)
    {
        if ("temp" in exact)
        {
            interpolatedTemp = exact.temp;
        }
        interpolatedDate = exact.date;
    }
    else
    {
        // Pega o anterior e o seguinte ao tempo atual
        const prev = [...baseData].reverse().find(d => d.lon < point.lon);
        const next = baseData.find(d => d.lon > point.lon);

        if (prev && next)
        {
            const pathPercentage = (point.lon - prev.lon)/(next.lon - prev.lon);
            if ("temp" in prev)
            {
                interpolatedTemp = interpolate(prev.temp, next.temp, pathPercentage);
            }
            interpolatedDate = interpolateDate(prev.date, next.date, pathPercentage);
        }
    }

    return {...point, temp: interpolatedTemp, date: interpolatedDate}
}

// Função que faz o join com eventos e dados de temperatura
export function join2(army, temperature, events) {
    const sortedTemp = temperature.slice().sort((a, b) => a.lon - b.lon);
    const eventsArray = Object.values(events);

    return army.map(d => {
        if (d.division === 1)
        {
            if (d.direction === "A")
            {
                const currentEvents = eventsArray.filter(e => e.direction === "A" && e.division === 1);
                const sortedEvents = currentEvents.sort((a, b) => a.lon - b.lon);

                return interpolateTempAndDate(sortedEvents, d);
            }
            else if (d.direction === "R")
            {
                return interpolateTempAndDate(sortedTemp, d);
            }
        }
        else if (d.division === 2)
        {
            if (d.direction === "A")
            {
                const currentEvents = eventsArray.filter(e => e.direction === "A" && e.division === 2);
                const sortedEvents = currentEvents.sort((a, b) => a.lon - b.lon);

                return interpolateTempAndDate(sortedEvents, d);
            }
            else if (d.direction === "R")
            {
                if (d.lon > 26)
                {
                    return interpolateTempAndDate(sortedTemp, d);
                }
                else
                {
                    const currentEvents = eventsArray.filter(e => e.direction === "R" && e.division === 2);
                    const sortedEvents = currentEvents.sort((a, b) => a.lon - b.lon);

                    return interpolateTempAndDate(sortedEvents, d);
                }
            }
        }

        return {...d, temp: undefined, date: undefined}
    });
}