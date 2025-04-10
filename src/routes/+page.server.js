import minard from '@stdlib/datasets-minard-napoleons-march';

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

    return {
        army: army,
        cities: cities,
        labels: labels,
        rivers: rivers,
        temperature: temperature
    };
}