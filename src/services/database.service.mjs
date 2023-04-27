import mysql from "mysql2/promise";
import City from "../models/city.mjs";
import Country from "../models/country.mjs";



export default class DatabaseService {
  conn;

  constructor(conn) {
    this.conn = conn;
  }

  /* Establish database connection and return the instance */
  static async connect() {
    const conn = await mysql.createConnection({
      host: process.env.DATABASE_HOST || "localhost",
      user: "user",
      password: "password",
      database: "world",
    });

    return new DatabaseService(conn);
  }

  /* Get a list of all cities */
  async getCities() {
    try {
      // Fetch cities from database
      const data = await this.conn.execute("SELECT * FROM `city`");
      return data;
    } catch (err) {
      // Handle error...
      console.error(err);
      return undefined;
    }
  }

  /* Get a particular city by ID, including country information */
  async getCity(cityId) {
    const sql = `
      SELECT 
        city.*, 
        country.Name AS CountryName, 
        country.Region, 
        country.Continent, 
        country.Population AS CountryPopulation
      FROM 
        city
        INNER JOIN country ON country.Code = city.CountryCode
      WHERE 
        city.ID = ${cityId}
    `;
    const [rows, fields] = await this.conn.execute(sql);
  
    const data = rows[0];
    const city = new City(
      data.ID,
      data.Name,
      data.CountryCode,
      data.District,
      data.Population
    );
    const country = new Country(
      data.CountryCode,
      data.CountryName,
      data.Continent,
      data.Region,
      data.CountryPopulation
    );
    city.country = country;
    return city;
  }
  

  /* Delete a city by ID */
  async removeCity(cityId) {
    const res = await this.conn.execute(
      `DELETE FROM city WHERE id = ${cityId}`
    );
    console.log(res);
    return res;
  }

  /* Get a list of countries */
/* Get a list of all countries */
async getCountries() {
  try {
    // Fetch countries from database
    const data = await this.conn.execute("SELECT * FROM `country`");
    return data;
  } catch (err) {
    // Handle error...
    console.error(err);
    return undefined;
  }
}

/* Get population report for a continent */
async getContinentPopulationReport(continentName) {
  const sql = `
    SELECT 
      SUM(c.Population) as TotalPopulation,
      SUM(IF(ct.Population > 0, ct.Population, 0)) as UrbanPopulation,
      SUM(IF(ct.Population = 0, c.Population, 0)) as RuralPopulation
    FROM 
      country c
      LEFT JOIN city ct ON ct.CountryCode = c.Code
    WHERE 
      c.Continent = ?
  `;
  try {
    const [rows, fields] = await this.conn.execute(sql, [continentName]);
    
    const data = rows[0];
    const totalPopulation = data.TotalPopulation;
    const urbanPopulation = data.UrbanPopulation;
    const ruralPopulation = data.RuralPopulation;
    const urbanPopulationPercentage = ((urbanPopulation / totalPopulation) * 100).toFixed(2);
    const ruralPopulationPercentage = ((ruralPopulation / totalPopulation) * 100).toFixed(2);

    const report = {
      continentName,
      totalPopulation,
      urbanPopulation,
      ruralPopulation,
      urbanPopulationPercentage: `${urbanPopulationPercentage}%`,
      ruralPopulationPercentage: `${ruralPopulationPercentage}%`
    }

    return report;
  } catch (err) {
    console.error('Error executing SQL query:', err);
    throw err;
  }
}




/* Get a particular country by code, including cities information */
async getCountry(countryCode) {
  const [rows, fields] = await this.conn.execute(`
    SELECT 
      c.Code, 
      c.Name, 
      c.Continent, 
      c.Region, 
      c.Population, 
      ct.Name AS Capital
    FROM 
      country c 
      LEFT JOIN city ct ON c.Capital = ct.ID
    WHERE 
      c.Code = '${countryCode}'
  `);
  
  const data = rows[0];
  const country = new Country(
    data.Code,
    data.Name,
    data.Continent,
    data.Region,
    data.Population
  );
  country.capital = data.Capital;

  return country;
}

 
  
}