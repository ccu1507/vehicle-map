import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const Map = ({ drivers }) => {
  return (
    <MapContainer center={[20.5937, 78.9629]} zoom={6} style={{ height: '500px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {drivers.map(driver => (
        <Marker key={driver.driver_id} position={[driver.latitude, driver.longitude]}>
          <Popup>
            {driver.name}<br />
            {driver.email}<br />
            {driver.phone}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default Map;
