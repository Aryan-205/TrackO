import { LatLng, LeafletMouseEvent } from "leaflet";
import { useState } from "react";
import { Popup, useMapEvent } from "react-leaflet";

export default function ClickPopup() {
  const [position, setPosition] = useState<LatLng | null>(null);

  useMapEvent("click", (e: LeafletMouseEvent) => {
    setPosition(e.latlng);
  });

  return (
    position && (
      <Popup position={position}>
        <div className="h-20 p-4 bg-[#323233] rounded-md text-center text-white flex justify-center items-center flex-col">
          <p>N {position.lat.toString().slice(0, 7)}, E {position.lng.toString().slice(0, 7)}</p>
        </div>
      </Popup>
    )
  );
}