export default class Country {
    code;
    name;
    continent;
    region;
    population;
  
    constructor(code, name, continent, region, population) {
      this.code = code;
      this.name = name;
      this.continent = continent;
      this.region = region;
      this.population = population;
    }
  }