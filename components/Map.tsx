import L,{ LeafletMouseEvent, LatLng  } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvent, useMap } from 'react-leaflet';

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
      style={{ height: "100%", width: "100%" }}
      >
      <TileLayer
        attribution='&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png'
      />
      <ClickPopup />
      <UserLocation position={position} zoom={13} show={show} flyKey={flyKey} />
    </MapContainer>
  );
}

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

function UserLocation({position, show, zoom, flyKey}:{position:[number, number], show:boolean, zoom:number, flyKey:number}){

  const map = useMap()

  const customIcon = L.icon({
  iconUrl: "/location.png",   
  iconSize: [32, 32],         
  iconAnchor: [16, 32],       
  popupAnchor: [0, -32],      
});

  useEffect(()=>{
    if(flyKey>0){
      map.flyTo(position, zoom, { animate: true })
    }
  },[position,flyKey, map, zoom])

  return (
    show && (
      <Marker position={position} icon={customIcon}>
        <Popup>Hello</Popup>
      </Marker>
    )
  )
}
