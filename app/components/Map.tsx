import { LeafletMouseEvent } from "leaflet";
import "leaflet/dist/leaflet.css";
import { ReactElement, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvent } from 'react-leaflet';

export default function Map() {

  return (
    <MapContainer 
      center={[28.632932, 77.220330]} 
      zoom={13} 
      style={{ height: "100%", width: "100%" }}
      >
      <TileLayer
        attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
      />
      <ClickPopup />
    </MapContainer>
  );
}

import { LatLng } from "leaflet";

function ClickPopup() {
  const [position, setPosition] = useState<LatLng | null>(null);

  useMapEvent("click", (e: LeafletMouseEvent) => {
    setPosition(e.latlng);
  });

  return (
    position && (
      <Popup position={position}>
        <div className="h-20 p-4 bg-[#323233] rounded-md text-center text-white flex justify-center items-center flex-col">
          <p>You clicked at </p>
          <p>{position.lat.toString().slice(0, 7)}, {position.lng.toString().slice(0, 7)}</p>
        </div>
      </Popup>
    )
  );
}
