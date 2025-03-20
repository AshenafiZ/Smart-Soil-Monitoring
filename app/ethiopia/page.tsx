"use client"
import React, { useEffect } from 'react';
import L from 'leaflet';

const MapPage: React.FC = () => {
  useEffect(() => {
    const map = L.map('map').setView([9.145, 40.4897], 6); 

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    L.marker([9.145, 40.4897]).addTo(map)
      .bindPopup("Ethiopia")
      .openPopup();

    

    return () => {
      map.remove();
    };
  }, []);


  return (
    <div>
      <h1>Map of Ethiopia</h1>
      <div id="map" style={{ height: '500px', width: '100%' }}></div>
    </div>
  );
};

export default MapPage;
