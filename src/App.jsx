import React, { useEffect, useState } from 'react';
import './index.css'; // Tailwind CSS import
import Map from './Map'; // Import your Map component for displaying drivers on a map
import { getTopBookedVehicles } from './api'; // Import function to fetch top booked vehicles

const App = () => {
  const [drivers, setDrivers] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [requests, setRequests] = useState([]);
  const [newDriver, setNewDriver] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    latitude: '',
    longitude: '',
    work_hours: { start: '', end: '' } // Added work hours
  });
  const [newAssignment, setNewAssignment] = useState({
    driver_id: '',
    vehicle_id: '',
    start_time: '',
    end_time: ''
  });
  const [searchLocation, setSearchLocation] = useState({
    lat: '',
    lon: '',
    radius: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [topBookedVehicles, setTopBookedVehicles] = useState([]);
  const [dashboardMetrics, setDashboardMetrics] = useState({});

  useEffect(() => {
    fetchData();
    fetchTopBookedVehicles(); // Fetch top booked vehicles
  }, []);

  const fetchData = async () => {
    try {
      const driversResponse = await fetch('http://localhost:5000/drivers');
      const driversData = await driversResponse.json();
      setDrivers(driversData);

      const vehiclesResponse = await fetch('http://localhost:5000/vehicles');
      const vehiclesData = await vehiclesResponse.json();
      setVehicles(vehiclesData);

      const assignmentsResponse = await fetch('http://localhost:5000/assignments');
      const assignmentsData = await assignmentsResponse.json();
      setAssignments(assignmentsData);

      const requestsResponse = await fetch('http://localhost:5000/driver-requests');
      const requestsData = await requestsResponse.json();
      setRequests(requestsData);

      const metricsResponse = await fetch('http://localhost:5000/dashboard-metrics'); // Fetch metrics
      const metricsData = await metricsResponse.json();
      setDashboardMetrics(metricsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchTopBookedVehicles = async () => {
    try {
      const data = await getTopBookedVehicles(); // Fetch top booked vehicles data
      setTopBookedVehicles(data);
    } catch (error) {
      console.error('Error fetching top booked vehicles:', error);
    }
  };

  const handleDriverChange = (e) => {
    setNewDriver({ ...newDriver, [e.target.name]: e.target.value });
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/drivers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDriver)
      });
      const data = await response.json();
      setDrivers([...drivers, data]);
      setNewDriver({ name: '', email: '', phone: '', location: '', latitude: '', longitude: '', work_hours: { start: '', end: '' } });
    } catch (error) {
      console.error('Error creating driver:', error);
    }
  };

  const handleAssignmentChange = (e) => {
    setNewAssignment({ ...newAssignment, [e.target.name]: e.target.value });
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAssignment)
      });
      const data = await response.json();
      setAssignments([...assignments, data]);
      setNewAssignment({ driver_id: '', vehicle_id: '', start_time: '', end_time: '' });
    } catch (error) {
      console.error('Error assigning vehicle:', error);
    }
  };

  const handleUnassign = async (assignment_id) => {
    try {
      await fetch(`http://localhost:5000/assignments/${assignment_id}`, { method: 'DELETE' });
      setAssignments(assignments.filter(a => a.assignment_id !== assignment_id));
    } catch (error) {
      console.error('Error unassigning vehicle:', error);
    }
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/driver-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAssignment)
      });
      const data = await response.json();
      setRequests([...requests, data]);
      setNewAssignment({ driver_id: '', vehicle_id: '', start_time: '', end_time: '' });
    } catch (error) {
      console.error('Error creating driver request:', error);
    }
  };

  const handleRequestUpdate = async (request_id, status) => {
    try {
      await fetch(`http://localhost:5000/driver-requests/${request_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchData(); // Refresh the data
    } catch (error) {
      console.error('Error updating driver request:', error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchLocation({ ...searchLocation, [e.target.name]: e.target.value });
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    try {
      const { lat, lon, radius } = searchLocation;
      const response = await fetch(`http://localhost:5000/search-drivers?lat=${lat}&lon=${lon}&radius=${radius}`);
      const data = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Error searching drivers:', error);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Vehicle-Driver Mapping System</h1>

      {/* Dashboard Metrics */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Dashboard</h2>
        <div className="space-y-4">
          <div className="p-4 border border-gray-300 rounded">
            <h3 className="text-lg font-semibold">Total Drivers</h3>
            <p>{dashboardMetrics.totalDrivers}</p>
          </div>
          <div className="p-4 border border-gray-300 rounded">
            <h3 className="text-lg font-semibold">Total Vehicles</h3>
            <p>{dashboardMetrics.totalVehicles}</p>
          </div>
          <div className="p-4 border border-gray-300 rounded">
            <h3 className="text-lg font-semibold">Total Assignments</h3>
            <p>{dashboardMetrics.totalAssignments}</p>
          </div>
        </div>
      </div>

      {/* Create Driver Form */}
      <div className="mb-4">
        <h2 className="text-xl font-semibold mb-2">Create Driver</h2>
        <form onSubmit={handleDriverSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={newDriver.name}
            onChange={handleDriverChange}
            className="p-2 border border-gray-300 rounded w-full"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={newDriver.email}
            onChange={handleDriverChange}
            className="p-2 border border-gray-300 rounded w-full"
          />
          <input
            type="text"
            name="phone"
            placeholder="Phone"
            value={newDriver.phone}
            onChange={handleDriverChange}
            className="p-2 border border-gray-300 rounded w-full"
          />
          <input
            type="text"
            name="location"
            placeholder="Location"
            value={newDriver.location}
            onChange={handleDriverChange}
            className="p-2 border border-gray-300 rounded w-full"
          />
          <input
            type="number"
            name="latitude"
            placeholder="Latitude"
            value={newDriver.latitude}
            onChange={handleDriverChange}
            className="p-2 border border-gray-300 rounded w-full"
          />
          <input
            type="number"
            name="longitude"
            placeholder="Longitude"
            value={newDriver.longitude}
            onChange={handleDriverChange}
            className="p-2 border border-gray-300 rounded w-full"
          />
                      <input
              type="time"
              name="work_hours.start"
              placeholder="Work Hours Start"
              value={newDriver.work_hours.start}
              onChange={handleDriverChange}
              className="p-2 border border-gray-300 rounded w-full"
            />
            <input
              type="time"
              name="work_hours.end"
              placeholder="Work Hours End"
              value={newDriver.work_hours.end}
              onChange={handleDriverChange}
              className="p-2 border border-gray-300 rounded w-full"
            />
            <button type="submit" className="p-2 bg-blue-500 text-white rounded">
              Add Driver
            </button>
          </form>
        </div>

        {/* Assign Vehicle Form */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Assign Vehicle</h2>
          <form onSubmit={handleAssignmentSubmit} className="space-y-4">
            <select
              name="driver_id"
              value={newAssignment.driver_id}
              onChange={handleAssignmentChange}
              className="p-2 border border-gray-300 rounded w-full"
            >
              <option value="">Select Driver</option>
              {drivers.map(driver => (
                <option key={driver.driver_id} value={driver.driver_id}>
                  {driver.name}
                </option>
              ))}
            </select>
            <select
              name="vehicle_id"
              value={newAssignment.vehicle_id}
              onChange={handleAssignmentChange}
              className="p-2 border border-gray-300 rounded w-full"
            >
              <option value="">Select Vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                  {vehicle.make_and_model} ({vehicle.license_plate})
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              name="start_time"
              value={newAssignment.start_time}
              onChange={handleAssignmentChange}
              className="p-2 border border-gray-300 rounded w-full"
            />
            <input
              type="datetime-local"
              name="end_time"
              value={newAssignment.end_time}
              onChange={handleAssignmentChange}
              className="p-2 border border-gray-300 rounded w-full"
            />
            <button type="submit" className="p-2 bg-blue-500 text-white rounded">
              Assign Vehicle
            </button>
          </form>
        </div>

        {/* Driver Requests */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Driver Requests</h2>
          <form onSubmit={handleRequestSubmit} className="space-y-4">
            <select
              name="driver_id"
              value={newAssignment.driver_id}
              onChange={handleAssignmentChange}
              className="p-2 border border-gray-300 rounded w-full"
            >
              <option value="">Select Driver</option>
              {drivers.map(driver => (
                <option key={driver.driver_id} value={driver.driver_id}>
                  {driver.name}
                </option>
              ))}
            </select>
            <select
              name="vehicle_id"
              value={newAssignment.vehicle_id}
              onChange={handleAssignmentChange}
              className="p-2 border border-gray-300 rounded w-full"
            >
              <option value="">Select Vehicle</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.vehicle_id} value={vehicle.vehicle_id}>
                  {vehicle.make_and_model} ({vehicle.license_plate})
                </option>
              ))}
            </select>
            <input
              type="datetime-local"
              name="start_time"
              value={newAssignment.start_time}
              onChange={handleAssignmentChange}
              className="p-2 border border-gray-300 rounded w-full"
            />
            <input
              type="datetime-local"
              name="end_time"
              value={newAssignment.end_time}
              onChange={handleAssignmentChange}
              className="p-2 border border-gray-300 rounded w-full"
            />
            <button type="submit" className="p-2 bg-blue-500 text-white rounded">
              Create Request
            </button>
          </form>
          <ul className="space-y-4 mt-4">
            {requests.map(request => (
              <li key={request.request_id} className="p-4 border border-gray-300 rounded">
                <p>
                  Driver: {request.driver_name} | Vehicle: {request.vehicle_make_and_model} | Start Time: {request.start_time} | End Time: {request.end_time}
                </p>
                <button
                  onClick={() => handleRequestUpdate(request.request_id, 'accepted')}
                  className="p-2 bg-green-500 text-white rounded mr-2"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleRequestUpdate(request.request_id, 'rejected')}
                  className="p-2 bg-red-500 text-white rounded"
                >
                  Reject
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Search Available Drivers */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Search Available Drivers</h2>
          <form onSubmit={handleSearchSubmit} className="space-y-4">
            <input
              type="number"
              name="lat"
              placeholder="Latitude"
              value={searchLocation.lat}
              onChange={handleSearchChange}
              className="p-2 border border-gray-300 rounded w-full"
            />
            <input
              type="number"
              name="lon"
              placeholder="Longitude"
              value={searchLocation.lon}
              onChange={handleSearchChange}
              className="p-2 border border-gray-300 rounded w-full"
            />
            <input
              type="number"
              name="radius"
              placeholder="Radius"
              value={searchLocation.radius}
              onChange={handleSearchChange}
              className="p-2 border border-gray-300 rounded w-full"
            />
            <button type="submit" className="p-2 bg-blue-500 text-white rounded">
              Search
            </button>
          </form>
          <ul className="space-y-4 mt-4">
            {searchResults.map(driver => (
              <li key={driver.driver_id} className="p-4 border border-gray-300 rounded">
                {driver.name} - {driver.email} - {driver.phone} - {driver.location}
              </li>
            ))}
          </ul>
        </div>

        {/* Maps UI to Display Available Drivers */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Map View of Available Drivers</h2>
          <Map drivers={searchResults} /> {/* Pass searchResults to the Map component */}
        </div>

        {/* Top N Booked Vehicles */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2">Top Booked Vehicles</h2>
          <ul className="space-y-4">
            {topBookedVehicles.map(vehicle => (
              <li key={vehicle.vehicle_id} className="p-4 border border-gray-300 rounded">
                {vehicle.make_and_model} - {vehicle.license_plate} - Booked: {vehicle.booked_count} times
              </li>
            ))}
          </ul>
        </div>
    </div>
  );
};

export default App;

