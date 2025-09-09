import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer } from 'react-leaflet';
import ClickPopup from "./ClickPopup";
import UserLocation from "./UserLocation";
import Markers from "./Markers";

export default function Map({ flyKey}:{ flyKey:number}) {

  return (
    <MapContainer 
      center={[28.632932, 77.220330]} 
      zoom={13} 
      attributionControl={false}
      style={{ height: "100%", width: "100%", borderRadius:'24px' }}
      >
      <TileLayer
        attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
      />
      <ClickPopup />
      <UserLocation zoom={18} flyKey={flyKey} />
      <Markers/>
    </MapContainer>
  );
}


