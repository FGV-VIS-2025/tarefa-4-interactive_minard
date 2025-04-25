import minard from '@stdlib/datasets-minard-napoleons-march';
import fs from 'fs';

export function load() {
    var opts = {};
    
    opts.data = "army";
    var army = minard( opts );

    opts.data = "cities";
    var cities = minard( opts );

    opts.data = "labels";
    var labels = minard( opts );

    opts.data = "rivers";
    var rivers = minard( opts );

    opts.data = "temperature";
    var temperature = minard( opts );

    // fs.writeFileSync('./army.json', JSON.stringify(army, null, 2));
    // fs.writeFileSync('./temperature.json', JSON.stringify(temperature, null, 2));
    // fs.writeFileSync('./cities.json', JSON.stringify(cities, null, 2));
    // fs.writeFileSync('./labels.json', JSON.stringify(labels, null, 2));
    // fs.writeFileSync('./rivers.json', JSON.stringify(rivers, null, 2));

    return {
        army: army,
        cities: cities,
        labels: labels,
        rivers: rivers,
        temperature: temperature
    };
}