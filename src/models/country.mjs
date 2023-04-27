export default class Country {
  code;
  name;
  continent;
  region;
  population;
  capital;
  totalPopulation; // Add this line
  
  constructor(code, name, continent, region, population, capital) {
    this.code = code;
    this.name = name;
    this.continent = continent;
    this.region = region;
    this.population = population;
    this.capital = capital;
    this.totalPopulation = 0; // Initialize the property to 0
  }
}
