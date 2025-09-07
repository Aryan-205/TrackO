import { useEffect } from "react";
import L from "leaflet";
import { Marker, Popup, useMap } from "react-leaflet";

export default function UserLocation({position, show, zoom, flyKey}:{position:[number, number], show:boolean, zoom:number, flyKey:number}){

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