import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer } from 'react-leaflet';
import ClickPopup from "./ClickPopup";
import UserLocation from "./UserLocation";

export default function Map({show, flyKey}:{show:boolean, flyKey:number}) {

  //const position:[number,number] = [28.6820, 77.2077]

  const [position, setPosition] = useState< [number, number] >([28.6820, 77.2077])

  useEffect(()=>{

    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }
    
    const watchId = navigator.geolocation.watchPosition((pos)=>{
      setPosition([pos.coords.latitude, pos.coords.longitude])
    },
    (err)=>{    
      console.log("Error: ",err)
    },{
      enableHighAccuracy:true,
      maximumAge:0,
      timeout:5000
    }
    )

    return ()=>navigator.geolocation.clearWatch(watchId)

  },[])

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
      <UserLocation position={position} zoom={18} show={show} flyKey={flyKey} />
    </MapContainer>
  );
}


