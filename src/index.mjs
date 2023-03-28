/* Import dependencies */
/* const express = require("express");
const mysql = require("mysql2/promise"); */
import express from "express";
import mysql from "mysql2/promise";
import Databaseservice from "./services/database.service.mjs";
/* Create express instance */
const app = express();
const port = 3000;

// Integrate Pug with Express
app.set("view engine", "pug");

// Serve assets from 'static' folder
app.use(express.static("static"));

const db = await Databaseservice.connect();
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

app.get("/cities", async (req, res) => {
  const [rows, fields] = await db.getCities();
  /* Render cities.pug with data passed as plain object */
  return res.render("cities", { rows, fields });
});

app.get('/cities/:id', async (req, res) => {
  const cityId = req.params.id;
  const city = await db.getCity(cityId);
  return res.render('city', { city });
})

// Returns JSON array of cities
app.get("/api/cities", async (req, res) => {
  const [rows, fields] = await db.getCities();
  return res.send(rows);
});
// Run server!
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});