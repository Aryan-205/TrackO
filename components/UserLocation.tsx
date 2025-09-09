import { useEffect, useState } from "react";
import { Marker, Popup, useMap } from "react-leaflet";
import L from 'leaflet'

export default function UserLocation({ zoom, flyKey}:{ zoom:number, flyKey:number}){

  const map = useMap()
  const [position, setPosition] = useState< [number, number] >([28.6820, 77.2077])

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
  },[flyKey, map, zoom])

  //const position:[number,number] = [28.6820, 77.2077]


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
    <Marker position={position} icon={customIcon}>
      <Popup>Hello</Popup>
    </Marker>
  )
}