/* Import dependencies */
import express from "express";
import mysql from "mysql2/promise";
import DatabaseService from "./services/database.service.mjs";

/* Create express instance */
const app = express();
const port = 3000;

/* Add form data middleware */
app.use(express.urlencoded({ extended: true }));

// Integrate Pug with Express
app.set("view engine", "pug");

// Serve assets from 'static' folder
app.use(express.static("static"));

const db = await DatabaseService.connect();
const { conn } = db;

/* Landing route */
app.get("/", (req, res) => {
  res.render("index");
});

// Sample API route
app.get("/ping", (req, res) => {
  res.send("pong");
});

// Landing route
app.get("/", (req, res) => {
  res.render("index");
});

// Gallery route
app.get("/gallery", (req, res) => {
  res.render("gallery");
});

// About route
app.get("/about", (req, res) => {
  res.render("about", { title: "Boring about page" });
});

app.get('/cities', async (req, res) => {
  let limit = req.query.limit || Number.MAX_SAFE_INTEGER;
  let sortBy;
  switch (req.query['sort-by']) {
    case 'name':
      sortBy = 'Name ASC';
      break;
    case 'population':
      sortBy = 'Population DESC';
      break;
    case 'continent':
      sortBy = 'Continent ASC, Population DESC';
      break;
    case 'region':
      sortBy = 'Region ASC, Population DESC';
      break;
    case 'district':
      sortBy = 'District ASC, Population DESC';
      break;
    default:
      sortBy = 'Name ASC';
  }

  const [rows, fields] = await db.conn.execute(`
    SELECT city.ID, city.Name, country.Name AS Country, country.Continent AS Continent, country.Region AS Region, city.District, city.Population
    FROM city
    JOIN country ON city.CountryCode = country.Code
    ORDER BY ${sortBy}
    LIMIT ${limit} 
  `);

  res.render('cities', { rows, fields, sortBy });
});


app.get('/cities/:id', async (req, res) => {
  const cityId = req.params.id;
  const city = await db.getCity(cityId);
  return res.render('city', { city });
})

/* Update a city by ID */
app.post('/cities/:id', async (req, res) => {
  const cityId = req.params.id;
  const { name } = req.body;
  const sql = `
    UPDATE city
    SET Name = '${name}'
    WHERE ID = '${cityId}';
  `
  await conn.execute(sql);
  return res.redirect(`/cities/${cityId}`);
})

// Returns JSON array of cities
app.get("/api/cities", async (req, res) => {
  const [rows, fields] = await db.getCities();
  return res.send(rows);
});

app.get('/countries', async (req, res) => {
  let limit = req.query.limit || Number.MAX_SAFE_INTEGER;
  let sortBy;
  switch (req.query['sort-by']) {
    case 'name':
      sortBy = 'Name ASC';
      break;
    case 'population':
      sortBy = 'Population DESC';
      break;
    case 'continent':
      sortBy = 'Continent ASC, Population DESC';
      break;
    case 'region':
      sortBy = 'Region ASC, Population DESC';
      break;
    default:
      sortBy = 'Name ASC';
  }

  try {
    const [rows, fields] = await db.conn.execute(`
      SELECT country.Code, country.Name, country.Continent, country.Region, country.Population, city.Name AS Capital
      FROM country
      JOIN city ON country.Capital = city.ID
      ORDER BY ${sortBy}
      LIMIT ${limit} 
    `);
    res.render('countries', { rows, fields, sortBy });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


app.get('/countries/:id', async (req, res) => {
  const countryCode = req.params.id;
  const country = await db.getCountry(countryCode);
  return res.render('country', { country });
})

app.post('/countries/:id', async (req, res) => {
  const countryCode = req.params.id;
  const { name } = req.body;
  const sql = `
    UPDATE country
    SET Name = '${name}'
    FROM city c
    JOIN country co ON c.CountryCode = co.Code
    WHERE c.ID = Capital
  `
  await conn.execute(sql);
  return res.redirect(`/countries/${countryCode}`);
})

app.get("/api/countries", async (req, res) => {
  const [rows, fields] = await db.getCountries();
  return res.send(rows);
});


app.get('/capital-city-report', async (req, res) => {
  let limit = req.query.limit || Number.MAX_SAFE_INTEGER;
  let sortBy;
  switch (req.query['sort-by']) {
    case 'name':
      sortBy = 'City ASC';
      break;
    case 'population':
      sortBy = 'Population DESC';
      break;
    case 'continent':
      sortBy = 'Continent ASC, Population DESC';
      break;
    case 'region':
      sortBy = 'Region ASC, Population DESC';
      break;
    default:
      sortBy = 'City ASC';
  }

  try {
    const [rows, fields] = await db.conn.execute(`
      SELECT c.Name AS City, co.Name AS Country, co.Continent AS Continent, co.Region AS Region, c.Population
      FROM city c
      JOIN country co ON c.CountryCode = co.Code
      WHERE c.ID = co.Capital
      ORDER BY ${sortBy}
      LIMIT ${limit} 
    `);
    res.render('capital-city-report', { rows, fields, sortBy });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/capital-city-report', async (req, res) => {
  const { continent } = req.body;
  let sortBy;
  switch (req.query['sort-by']) {
    case 'name':
      sortBy = 'City ASC';
      break;
    case 'population':
      sortBy = 'Population DESC';
      break;
    case 'continent':
      sortBy = 'Continent ASC, Population DESC';
      break;
    case 'region':
      sortBy = 'Region ASC, Population DESC';
      break;
    default:
      sortBy = 'City ASC';
  }

  try {
    const [rows, fields] = await db.conn.execute(`
      SELECT c.Name AS City, co.Name AS Country, co.Continent AS Continent, co.Region AS Region, c.Population
      FROM city c
      JOIN country co ON c.CountryCode = co.Code
      WHERE c.ID = co.Capital AND co.Continent = '${continent}'
      ORDER BY ${sortBy}
    `);
    res.render('capital-city-report', { rows, fields, sortBy });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});


// Population report route
app.get('/population', async (req, res) => {
  const { continent, region, country } = req.query;

  let sql = `
    SELECT country.Name, SUM(country.Population) as total_population, SUM(CASE WHEN city.Population > 0 THEN city.Population ELSE 0 END) as urban_population
    FROM country
    LEFT JOIN city ON country.Code = city.CountryCode
    WHERE 1=1
  `;

  if (continent) {
    sql += ` AND country.Continent = '${continent}'`;
  }
  if (region) {
    sql += ` AND country.Region = '${region}'`;
  }
  if (country) {
    sql += ` AND country.Name = '${country}'`;
  }

  sql += `
    GROUP BY country.Name
  `;

  console.log(sql);

  const [[{ Name, total_population, urban_population } = {}]] = await db.conn.execute(sql);

  const rural_population = total_population - urban_population;
  const urban_percentage = ((urban_population / total_population) * 100).toFixed(2);
  const rural_percentage = ((rural_population / total_population) * 100).toFixed(2);

  const data = { Name, total_population, urban_population, urban_percentage, rural_population, rural_percentage };

  res.render('population', { data });
});





// Run server!
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});