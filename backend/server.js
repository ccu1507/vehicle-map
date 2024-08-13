const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const port = 5000;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'vehicle_motorq',
    password: 'gaurav@123',
    port: 5432,
});

app.use(cors());
app.use(bodyParser.json());

// Routes
app.get('/drivers', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM drivers');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/drivers', async (req, res) => {
    const { name, email, phone, location, latitude, longitude, work_start, work_end } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO drivers (name, email, phone, location, latitude, longitude, work_start, work_end) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
            [name, email, phone, location, latitude, longitude, work_start, work_end]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating driver:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/vehicles', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM vehicles');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching vehicles:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/assignments', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM assignments');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching assignments:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/assignments', async (req, res) => {
    const { driver_id, vehicle_id, start_time, end_time } = req.body;
    try {
        const driver = await pool.query('SELECT * FROM drivers WHERE driver_id = $1', [driver_id]);
        const driverWorkHours = driver.rows[0];
        const driverStartHour = new Date(start_time).getHours();
        const driverEndHour = new Date(end_time).getHours();
        const workStartHour = new Date(driverWorkHours.work_start).getHours();
        const workEndHour = new Date(driverWorkHours.work_end).getHours();

        if (driverStartHour < workStartHour || driverEndHour > workEndHour) {
            return res.status(400).send('Driver is not available during the requested hours.');
        }

        const result = await pool.query(
            'INSERT INTO assignments (driver_id, vehicle_id, start_time, end_time) VALUES ($1, $2, $3, $4) RETURNING *',
            [driver_id, vehicle_id, start_time, end_time]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating assignment:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.delete('/assignments/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM assignments WHERE assignment_id = $1', [id]);
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting assignment:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/driver-requests', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM driver_requests');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching driver requests:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/driver-requests', async (req, res) => {
    const { driver_id, vehicle_id, start_time, end_time } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO driver_requests (driver_id, vehicle_id, start_time, end_time, status) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [driver_id, vehicle_id, start_time, end_time, 'pending']
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creating driver request:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.patch('/driver-requests/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await pool.query(
            'UPDATE driver_requests SET status = $1 WHERE request_id = $2',
            [status, id]
        );
        res.status(200).send();
    } catch (error) {
        console.error('Error updating driver request:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/search-drivers', async (req, res) => {
    const { lat, lon, radius } = req.query;
    try {
        const result = await pool.query(
            `
            SELECT *, (
                6371 * acos (
                    cos ( radians($1) )
                    * cos( radians( latitude ) )
                    * cos( radians( longitude ) - radians($2) )
                    + sin ( radians($1) )
                    * sin( radians( latitude ) )
                )
            ) AS distance
            FROM drivers
            HAVING distance < $3
            `,
            [lat, lon, radius]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error searching drivers:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Dashboard Metrics
app.get('/dashboard', async (req, res) => {
    try {
        // Count total drivers, vehicles, and assignments
        const driversCount = await pool.query('SELECT COUNT(*) FROM drivers');
        const vehiclesCount = await pool.query('SELECT COUNT(*) FROM vehicles');
        const assignmentsCount = await pool.query('SELECT COUNT(*) FROM assignments');

        // Top N Booked Vehicles
        const topBookedVehicles = await pool.query(`
            SELECT v.make_and_model, v.license_plate, COUNT(a.vehicle_id) AS bookings
            FROM vehicles v
            JOIN assignments a ON v.vehicle_id = a.vehicle_id
            GROUP BY v.vehicle_id
            ORDER BY bookings DESC
            LIMIT 5
        `);

        res.json({
            totalDrivers: parseInt(driversCount.rows[0].count),
            totalVehicles: parseInt(vehiclesCount.rows[0].count),
            totalAssignments: parseInt(assignmentsCount.rows[0].count),
            topBookedVehicles: topBookedVehicles.rows,
        });
    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Maps UI Data
app.get('/map-data', async (req, res) => {
    try {
        const result = await pool.query('SELECT driver_id, name, latitude, longitude FROM drivers');
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching map data:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
