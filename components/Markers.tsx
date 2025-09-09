import { Marker, Popup } from "react-leaflet"
import L from 'leaflet'

export default function Markers(){

  const customIcon = L.icon({
    iconUrl: "/location.png",   
    iconSize: [32, 32],         
    iconAnchor: [16, 32],       
    popupAnchor: [0, -32],      
  });

  const positiions = [
    {
      name:"",
      icon:customIcon,
      position:{
        lat:123,
        lng:123
      }
    },
    {
      name:"",
      icon:customIcon,
      position:{
        lat:23,
        lng:13
      }
    },
    {
      name:"",
      icon:customIcon,
      position:{
        lat:13,
        lng:23
      }
    },
  ]

  return (
    <>
    {
      positiions.map((pos, index)=>(
        <Marker key={index} position={pos.position} icon={pos.icon}>
          <Popup>Hello {index}</Popup>
        </Marker>
      ))
    }
    </>
  )
}