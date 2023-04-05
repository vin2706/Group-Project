export default class City {
    id;
    name;
    countryCode;
    district;
    population;

    constructor(id, name, countryCode, district, population) {
        this.id = id;
        this.name = name;
        this.countryCode = countryCode;
        this.district = district;
        this.population = population;
    }

    print(){
        console.log('${id} ${name} has ${population} people');
    }
}