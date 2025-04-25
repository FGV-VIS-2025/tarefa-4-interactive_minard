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
    let points = [];

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

        if (division === 1)
        {
            console.log(dataDivision);
        }

        if (prev && next)
        {
            // Aplica a interpolação
            const t0 = parseDate(prev.date);
            const t1 = parseDate(next.date);
            const pathPercentage = (time - t0)/(t1 - t0);

            if (division === 2 && time > parseDate("1812-10-18"))
            {
                console.log(prev, next, prev.date, next.date);
            }

            points.push({
                lat: interpolate(prev.lat, next.lat, pathPercentage),
                lon: interpolate(prev.lon, next.lon, pathPercentage),
                size: interpolate(prev.size, next.size, pathPercentage),
                temp: interpolate(prev.temp, next.temp, pathPercentage),
                division: +division,
                direction: prev.direction,
                date: new Date(time).toDateString()
            });
        }
    }

    if (time < parseDate("1812-10-18"))
    {
        const filteredData = data.filter(d => d.direction === "A");

        for (let division = 1; division < 3; division++)
        {
            var filteredDataDivision = filteredData.filter(d => d.division === division);
            filteredDataDivision = filteredDataDivision.sort((a, b) => parseDate(a.date) - parseDate(b.date));
            interpolateDateWithDivisions(filteredDataDivision, division);
        }
    }
    else
    {
        const filteredData = data.filter(d => d.direction === "R");

        for (let division = 1; division < 3; division++)
        {
            var filteredDataDivision = filteredData.filter(d => d.division === division);
            filteredDataDivision = filteredDataDivision.sort((a, b) => parseDate(a.date) - parseDate(b.date));
            interpolateDateWithDivisions(filteredDataDivision, division);
        }
    }

    return points;
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
        else if (next && !prev)
        {
            if ("temp" in next)
            {
                interpolatedTemp = next.temp;
            }
            interpolatedDate = next.date;
        }
        else if (prev && !next)
        {
            if ("temp" in prev)
            {
                interpolatedTemp = prev.temp;
            }
            interpolatedDate = prev.date;
        }
    }

    if (point)
    {
        point.temp = interpolatedTemp;
        point.date = interpolatedDate;
    }

    return point;
}

// Função que faz o join com eventos e dados de temperatura
export function join(army, temperature, events) {
    const sortedTemp = temperature.slice().sort((a, b) => a.lon - b.lon);
    const eventsArray = Object.values(events);

    return army.map(d => {
        if (d.date != undefined)
        {
            return d;
        }

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
                if (d.lon >= 26.4)
                {
                    return interpolateTempAndDate(sortedTemp, d);
                }
                else
                {
                    const currentEvents = eventsArray.filter(e => e.direction === "R" && e.division === 1);
                    const sortedEvents = currentEvents.sort((a, b) => a.lon - b.lon);

                    return interpolateTempAndDate(sortedEvents, d);
                }
            }
        }
        else if (d.division === 2)
        {
            const currentEvents = eventsArray.filter(e => e.direction === d.direction && e.division === 2);
            const sortedEvents = currentEvents.sort((a, b) => a.lon - b.lon);

            return interpolateTempAndDate(sortedEvents, d);
        }

        return d;
    });
}