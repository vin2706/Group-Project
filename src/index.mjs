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
  let sortBy;
  switch (req.query['sort-by']) {
    case 'name':
      sortBy = 'Name ASC';
      break;
    case 'population':
      sortBy = 'Population DESC';
      break;
    default:
      sortBy = 'Name ASC';
  }

  const [rows, fields] = await db.conn.execute(`
    SELECT * FROM city
    ORDER BY ${sortBy}
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
    `);
    res.render('countries', { rows, fields, sortBy });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
  

  //res.render('countries', { rows, fields, sortBy });
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
    WHERE Code = '${countryCode}';
  `
  await conn.execute(sql);
  return res.redirect(`/countries/${countryCode}`);
})

app.get("/api/countries", async (req, res) => {
  const [rows, fields] = await db.getCountries();
  return res.send(rows);
});

app.get('/capital-city-report', async (req, res) => {
  const [rows, fields] = await db.conn.execute(`
    SELECT c.Name AS City, co.Name AS Country, c.Population
    FROM city c
    JOIN country co ON c.CountryCode = co.Code
    WHERE c.ID = Capital
    ORDER BY co.Name ASC
  `);

  res.render('capital-city-report', { rows });
});



// Run server!
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});