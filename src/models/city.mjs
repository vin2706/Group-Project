export default class City {
    id;
    name;
    countryName;
    district;
    population;

    constructor(id, name, countryCode, countryName, district, population) {
        this.id = id;
        this.name = name;
        this.countryName = countryName;
        this.district = district;
        this.population = population;
    }

    print(){
        console.log('${id} ${name}, ${countryName} has ${population} people');
    }
}
