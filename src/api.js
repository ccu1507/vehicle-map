// src/api.js

// Base URL for your API
const BASE_URL = 'http://localhost:5000';

// Function to fetch top booked vehicles
export const getTopBookedVehicles = async () => {
  try {
    const response = await fetch(`${BASE_URL}/top-booked-vehicles`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching top booked vehicles:', error);
    return [];
  }
};

// Function to fetch drivers
export const getDrivers = async () => {
  try {
    const response = await fetch(`${BASE_URL}/drivers`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching drivers:', error);
    return [];
  }
};

// Function to fetch vehicles
export const getVehicles = async () => {
  try {
    const response = await fetch(`${BASE_URL}/vehicles`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return [];
  }
};

// Function to fetch assignments
export const getAssignments = async () => {
  try {
    const response = await fetch(`${BASE_URL}/assignments`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return [];
  }
};

// Function to fetch driver requests
export const getDriverRequests = async () => {
  try {
    const response = await fetch(`${BASE_URL}/driver-requests`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching driver requests:', error);
    return [];
  }
};

// Function to fetch dashboard metrics
export const getDashboardMetrics = async () => {
  try {
    const response = await fetch(`${BASE_URL}/dashboard-metrics`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return {};
  }
};

// Function to search drivers by location
export const searchDrivers = async (lat, lon, radius) => {
  try {
    const response = await fetch(`${BASE_URL}/search-drivers?lat=${lat}&lon=${lon}&radius=${radius}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching drivers:', error);
    return [];
  }
};
