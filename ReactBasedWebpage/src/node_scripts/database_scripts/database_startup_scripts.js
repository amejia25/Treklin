//database_startup_scripts.js
//This is called by the node server
//Checks to see if the database exists already, if not it will create one.
//Then Checks to see if a schema exists already, if not it will create one.
//Jan Baraniecki


const { Client } = require('pg');

//VALUES
const dbName = "CustomRoutesDatabase";
const schemaName = "RoutesSchema"; // Schema name

let  adminClient = new Client({
  user: 'AsuAdmin',
  host: 'localhost',
  password: 'AsuPassword',
  port: 5432,
  database: 'postgres' // default administrative database
});

async function ensureDatabaseExists() {
  try {
    await adminClient.connect();
    console.log('Connected to PostgreSQL server with AsuAdmin.');

    // Check if the database exists
    const dbRes = await adminClient.query(`
      SELECT 1 FROM pg_database WHERE datname = $1;
    `, [dbName]);

    if (dbRes.rows.length === 0) {
      // Database does not exist, create it
      console.log(`Database ${dbName} does not exist, creating it...`);
      await adminClient.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database ${dbName} created successfully.`);
    } else {
      console.log(`Database ${dbName} already exists.`);
    }
  } catch (err) {
    console.error('Error ensuring database exists:', err.stack);
    process.exit(1);
  }
  finally {
        await adminClient.end();
  }
}

// Ensures that the schema and its tables exist
async function ensureSchemaExists() {
  adminClient = new Client({
    user: 'AsuAdmin',
    host: 'localhost',
    password: 'AsuPassword',
    port: 5432,
    database: dbName
  });

  try {
    await adminClient.connect();
    const schemaRes = await adminClient.query(`SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1;`, [schemaName]);

    if (schemaRes.rows.length === 0) {
      console.log(`Schema ${schemaName} does not exist, creating it...`);
      await adminClient.query(`CREATE SCHEMA "${schemaName}"`);
      console.log(`Creating Tables...`);

      await adminClient.query('BEGIN;');  // Start transaction for table creation

      // Creating all necessary tables
      const queries = `
        CREATE TABLE "${schemaName}".gpx_files (
          gpx_id SERIAL PRIMARY KEY,
          file_name VARCHAR(255) NOT NULL,
          file_path VARCHAR(255) NOT NULL,
          upload_time TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        CREATE TABLE "${schemaName}".tracks (
          track_id SERIAL PRIMARY KEY,
          name VARCHAR(255),
          description TEXT,
          gpx_id INT,
          FOREIGN KEY (gpx_id) REFERENCES "${schemaName}".gpx_files(gpx_id)
        );
        CREATE TABLE "${schemaName}".routes (
          route_id SERIAL PRIMARY KEY,
          name VARCHAR(255),
          description TEXT,
          gpx_id INT,
          FOREIGN KEY (gpx_id) REFERENCES "${schemaName}".gpx_files(gpx_id)
        );
        CREATE TABLE "${schemaName}".track_segments (
          segment_id SERIAL PRIMARY KEY,
          track_id INT NOT NULL,
          sequence INT,
          FOREIGN KEY (track_id) REFERENCES "${schemaName}".tracks(track_id)
        );
        CREATE TABLE "${schemaName}".track_points (
          point_id SERIAL PRIMARY KEY,
          segment_id INT NOT NULL,
          latitude NUMERIC(10, 6),
          longitude NUMERIC(10, 6),
          elevation NUMERIC,
          time TIMESTAMP WITHOUT TIME ZONE,
          sequence INT,
          image1 VARCHAR(255),
          image2 VARCHAR(255),
          image3 VARCHAR(255),
          FOREIGN KEY (segment_id) REFERENCES "${schemaName}".track_segments(segment_id)
        );
        CREATE TABLE "${schemaName}".waypoints (
          waypoint_id SERIAL PRIMARY KEY,
          track_id INT,
          route_id INT,
          name VARCHAR(255),
          latitude NUMERIC(10, 6),
          longitude NUMERIC(10, 6),
          elevation NUMERIC,
          time TIMESTAMP WITHOUT TIME ZONE,
          description TEXT,
          image1 VARCHAR(255),
          image2 VARCHAR(255),
          image3 VARCHAR(255),
          gpx_id INT,
          FOREIGN KEY (track_id) REFERENCES "${schemaName}".tracks(track_id),
          FOREIGN KEY (route_id) REFERENCES "${schemaName}".routes(route_id),
          FOREIGN KEY (gpx_id) REFERENCES "${schemaName}".gpx_files(gpx_id)
        );
        CREATE TABLE "${schemaName}".route_points (
          route_point_id SERIAL PRIMARY KEY,
          route_id INT NOT NULL,
          name VARCHAR(255),
          latitude NUMERIC(10, 6),
          longitude NUMERIC(10, 6),
          elevation NUMERIC,
          time TIMESTAMP WITHOUT TIME ZONE,
          description TEXT,
          image1 VARCHAR(255),
          image2 VARCHAR(255),
          image3 VARCHAR(255),
          FOREIGN KEY (route_id) REFERENCES "${schemaName}".routes(route_id)
        );
      `;
      await adminClient.query(queries);
      await adminClient.query('COMMIT;');  // Committing all changes
      console.log('Schema and Tables ensured successfully.');
    } else {
      console.log(`Schema ${schemaName} already exists.`);
    }
  } catch (err) {
    console.error('Error ensuring Schema and Tables exist:', err.stack);
    await adminClient.query('ROLLBACK;');  // Rollback in case of error
  } finally {
    adminClient.end();  // Always close the client
  }
}
// Call ensureDatabaseExists first, then ensureSchemaExists
async function init() {
  await ensureDatabaseExists();
  await ensureSchemaExists(); // Ensure this is called after the database has been ensured
}

module.exports = { init };
