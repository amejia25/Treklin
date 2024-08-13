// database_runtime_scripts.js
const { Pool } = require('pg');

// Define the schema name here
const schemaName = 'RoutesSchema';

const pool = new Pool({
  user: 'AsuAdmin',  // Admin username for development
  host: 'localhost',
  database: 'CustomRoutesDatabase',
  password: 'AsuPassword',  // Admin password for development
  port: 5432,
});

async function insertGpxFile(fileData) {
  const { filename, filepath, uploadTime } = fileData;
  const query = `
    INSERT INTO "${schemaName}".gpx_files (file_name, file_path, upload_time)
    VALUES ($1, $2, $3)
    RETURNING gpx_id;
  `;
  const values = [filename, filepath, uploadTime];
  return pool.query(query, values);
}

async function insertWaypoint(waypoint) {
  const query = `
    INSERT INTO "${schemaName}".waypoints (track_id, route_id, name, latitude, longitude, elevation, time, description, image1, image2, image3, rating, gpx_id)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING waypoint_id;
  `;
  const values = [waypoint.track_id, waypoint.route_id, waypoint.name, waypoint.latitude, waypoint.longitude, waypoint.elevation, waypoint.time, waypoint.description, waypoint.image1, waypoint.image2, waypoint.image3, waypoint.rating, waypoint.gpx_id];
  return pool.query(query, values);
}

async function insertTrack(track) {
  const query = `
    INSERT INTO "${schemaName}".tracks (name, type, description, gpx_id)
    VALUES ($1, $2, $3, $4)
    RETURNING track_id;
  `;
  const values = [track.name, track.type, track.description, track.gpx_id];
  return pool.query(query, values);
}

async function insertSegment(trackId, segment) {
    const insertSegmentQuery = `
        INSERT INTO "${schemaName}".track_segments (track_id, sequence)
        VALUES ($1, $2)
        RETURNING segment_id;
    `;
    const segmentResult = await pool.query(insertSegmentQuery, [trackId, segment.sequence]);

    const segmentId = segmentResult.rows[0].segment_id;
    for (const point of segment.points) {
        await insertTrackPoint(segmentId, point);
    }
}

async function insertTrackPoint(segmentId, point) {
    const insertPointQuery = `
        INSERT INTO "${schemaName}".track_points (segment_id, latitude, longitude, elevation, time)
        VALUES ($1, $2, $3, $4, $5);
    `;
    const pointValues = [segmentId, point.latitude, point.longitude, point.elevation, point.time];
    await pool.query(insertPointQuery, pointValues);
}

async function insertRoute(route) {
    const query = `
        INSERT INTO "${schemaName}".routes (name, description, gpx_id)
        VALUES ($1, $2, $3)
        RETURNING route_id;
    `;
    const values = [route.name, route.description, route.gpx_id];
    const res = await pool.query(query, values);
    return res;
}
async function insertRoutePoint(route_id, point) {
  const query = `
    INSERT INTO "${schemaName}".route_points (route_id, name, latitude, longitude)
    VALUES ($1, $2, $3, $4);
  `;
  const values = [route_id, point.name, point.latitude, point.longitude];
  return pool.query(query, values);
}

module.exports = {
  insertGpxFile,
  insertWaypoint,
  insertTrack,
  insertSegment,
  insertTrackPoint,
  insertRoute,
  insertRoutePoint
};
