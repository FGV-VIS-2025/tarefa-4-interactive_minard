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

// Função para converter string para timestamp
export function parseDate(dateStr)
{
    return new Date(dateStr).getTime();
}


// Função para obter pontos interpolados
export function interpolatePoints(time, data)
{
    // Inicializa a lista de pontos
    let points = [];

    // Função auxiliar para interpolar data de dados de uma divisão
    function interpolateDateWithDivisions(dataDivision, division)
    {
        // Verificando se existe data exata no dado
        const exact = dataDivision.find(d => parseDate(d.date) === time);
        // Se existir, retorna esses valores
        if (exact) 
        {
            points.push(exact);
            return;
        };

        // Pega o anterior e o seguinte ao tempo atual
        const prev = [...dataDivision].reverse().find(d => parseDate(d.date) <= time);
        const next = dataDivision.find(d => parseDate(d.date) > time);

        // Se tiver anterior e próximo...
        if (prev && next)
        {
            // Aplica a interpolação
            const t0 = parseDate(prev.date);
            const t1 = parseDate(next.date);
            const pathPercentage = (time - t0)/(t1 - t0);

            // Tamanho do ponto
            let size;

            // Definição especial para ter o salto no tamanho quando as divisões se juntam
            if (time > parseDate("1812-11-18") && time < parseDate("1812-11-24") && division === 1)
            {
                size = 20000;
            }
            // Em outros casos, apenas interpola normalmente
            else
            {
                size = interpolate(prev.size, next.size, pathPercentage);
            }

            // Adiciona o ponto interpolado à lista
            points.push({
                lat: interpolate(prev.lat, next.lat, pathPercentage),
                lon: interpolate(prev.lon, next.lon, pathPercentage),
                size: size,
                temp: interpolate(prev.temp, next.temp, pathPercentage),
                division: +division,
                direction: prev.direction,
                date: new Date(time).toDateString()
            });
        }
        else if (next && !prev)
        {
            console.log("Teste");
            // Adiciona o ponto seguinte à lista
            points.push({
                lat: next.lat,
                lon: next.lon,
                size: next.size,
                temp: next.temp,
                division: +division,
                direction: next.direction,
                date: new Date(time).toDateString()
            });
        }
    }

    // Se for no período de avanço...
    if (time < parseDate("1812-10-18"))
    {
        // Filtra para os dados de avanço
        const filteredData = data.filter(d => d.direction === "A");

        // Para cada divisão...
        for (let division = 1; division < 3; division++)
        {
            // Filtra para os dados dessa divisão e faz a interpolação
            var filteredDataDivision = filteredData.filter(d => d.division === division);
            filteredDataDivision = filteredDataDivision.sort((a, b) => parseDate(a.date) - parseDate(b.date));
            interpolateDateWithDivisions(filteredDataDivision, division);
        }
    }
    // Se for no período de retorno...
    else
    {
        // Filtra para os dados de retorno
        const filteredData = data.filter(d => d.direction === "R");

        // Para cada divisão...
        for (let division = 1; division < 3; division++)
        {
            // Filtra para os dados dessa divisão e faz a interpolação
            var filteredDataDivision = filteredData.filter(d => d.division === division);
            filteredDataDivision = filteredDataDivision.sort((a, b) => parseDate(a.date) - parseDate(b.date));
            interpolateDateWithDivisions(filteredDataDivision, division);
        }
    }

    return points;
}

// Função para interpolar a temperatura e os dados nos pontos
function interpolateTempAndDate(baseData, point)
{
    // Definindo os valores
    var interpolatedTemp = undefined;
    var interpolatedDate = undefined;

    // Verificando se existe longitude exata no dado
    const exact = baseData.find(d => d.lon === point.lon);
    // Se existir, pega os valores desse ponto
    if (exact)
    {
        if ("temp" in exact)
        {
            interpolatedTemp = exact.temp;
        }
        interpolatedDate = exact.date;
    }
    // Se não...
    else
    {
        // Pega o anterior e o seguinte à longitude atual
        const prev = [...baseData].reverse().find(d => d.lon < point.lon);
        const next = baseData.find(d => d.lon > point.lon);

        // Se tiver anterior e próximo...
        if (prev && next)
        {
            // Interpola a data e, se existir, a temperatura
            const pathPercentage = (point.lon - prev.lon)/(next.lon - prev.lon);
            if ("temp" in prev)
            {
                interpolatedTemp = interpolate(prev.temp, next.temp, pathPercentage);
            }
            interpolatedDate = interpolateDate(prev.date, next.date, pathPercentage);
        }
        // Se tiver só próximo, pega os dados dele
        else if (next && !prev)
        {
            if ("temp" in next)
            {
                interpolatedTemp = next.temp;
            }
            interpolatedDate = next.date;
        }
        // Se tiver só anterior, pega os dados dele
        else if (prev && !next)
        {
            if ("temp" in prev)
            {
                interpolatedTemp = prev.temp;
            }
            interpolatedDate = prev.date;
        }
    }

    // Salva os novos dados no ponto
    if (point)
    {
        point.temp = interpolatedTemp;
        point.date = interpolatedDate;
    }

    return point;
}

// Função que faz o join com eventos e dados de temperatura
export function join(army, temperature, events) {
    // Ordenando os dados de temperatura
    const sortedTemp = temperature.slice().sort((a, b) => a.lon - b.lon);
    const eventsArray = Object.values(events);

    return army.map(d => {
        // Se o ponto já tiver data definida, retorna ele mesmo
        if (d.date != undefined)
        {
            return d;
        }

        // Se ele for da divisão 1...
        if (d.division === 1)
        {
            // Se for de avanço...
            if (d.direction === "A")
            {
                // Interpola com os dados de evento filtrados
                const currentEvents = eventsArray.filter(e => e.direction === "A" && e.division === 1);
                const sortedEvents = currentEvents.sort((a, b) => a.lon - b.lon);

                return interpolateTempAndDate(sortedEvents, d);
            }
            // Se for de retorno...
            else if (d.direction === "R")
            {
                // Se tiver dados de temperatura, interpola com a base de temperaturas
                if (d.lon >= 26.4)
                {
                    return interpolateTempAndDate(sortedTemp, d);
                }
                // Se não, interpola com os eventos filtrados
                else
                {
                    const currentEvents = eventsArray.filter(e => e.direction === "R" && e.division === 1);
                    const sortedEvents = currentEvents.sort((a, b) => a.lon - b.lon);

                    return interpolateTempAndDate(sortedEvents, d);
                }
            }
        }
        // Se for da divisão 2, apenas interpola com os eventos filtrados pra cada direção
        else if (d.division === 2)
        {
            const currentEvents = eventsArray.filter(e => e.direction === d.direction && e.division === 2);
            const sortedEvents = currentEvents.sort((a, b) => a.lon - b.lon);

            return interpolateTempAndDate(sortedEvents, d);
        }

        return d;
    });
}