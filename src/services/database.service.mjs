import mysql from "mysql2/promise";
import City from "../models/city.mjs";

export default class DatabaseService {
    conn;

    constructor(conn) {
        this.conn = conn;
    }

    static async connect() {
        const conn = await mysql.createConnection({
            host: process.env.DATABASE_HOST || "localhost",
            user: "user",
            password: "password",
            database: "world",
        });

        return new DatabaseService(conn);
    }

    async getCity(cityId) {
        const [rows, fields] = await this.conn.execute(`SELECT * FROM city WHERE id = ${cityId}`);
        const { ID, Name, CountryCode, District, Population } = rows[0];
        const city = new City(ID, Name, CountryCode, District, Population);
        return city;
    }

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
}