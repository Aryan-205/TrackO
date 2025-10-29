import { Marker, Popup } from "react-leaflet"
import L from 'leaflet'

// 🔄 Define the type for the new prop
interface MemberLocations {
    [userId: string]: { lat: number, lng: number, name: string };
}

// 🤝 Accept the new prop
export default function Markers({ memberLocations }:{ memberLocations: MemberLocations }){

  const customIcon = L.icon({
    iconUrl: "/location.png",   
    iconSize: [32, 32],         
    iconAnchor: [16, 32],       
    popupAnchor: [0, -32],      
  });

  // 🗑️ Remove the old static `positiions` array
  /* const positiions = [
    // ... removed static data
  ]
  */

  // ⚙️ Convert the memberLocations object into an array for mapping
  const locationsArray = Object.entries(memberLocations).map(([userId, data]) => ({
      userId: userId,
      name: data.name,
      icon: customIcon,
      position: {
        lat: data.lat,
        lng: data.lng
      }
  }));

  return (
    <>
    {
      // 🚀 Map over the locationsArray to display markers
      locationsArray.map((pos)=>(
        <Marker key={pos.userId} position={[pos.position.lat, pos.position.lng]} icon={pos.icon}>
          <Popup>
            {/* Show the user's name in the popup */}
            **{pos.name}**
          </Popup>
        </Marker>
      ))
    }
    </>
  )
}