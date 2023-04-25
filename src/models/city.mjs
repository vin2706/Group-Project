export default class City {
    id;
    name;
    countryName;
    continent;
    region;
    district;
    population;

    constructor(id, name, continent, region, countryName, district, population) {
        this.id = id;
        this.name = name;
        this.countryName = countryName;
        this.continent = continent;
        this.region = region;
        this.district = district;
        this.population = population;
    }

    print(){
        console.log('${id} ${name}, ${countryName} has ${population} people');
    }
}
