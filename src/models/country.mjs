export default class Country {
    code;
    name;
    continent;
    region;
    population;
    capital;
  
    constructor(code, name, continent, region, population, capital) {
      this.code = code;
      this.name = name;
      this.continent = continent;
      this.region = region;
      this.population = population;
      this.capital = capital;
    }
  }