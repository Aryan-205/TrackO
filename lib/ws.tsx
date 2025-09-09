import { useEffect } from "react";

export default function LocationClient() {
  useEffect(() => {
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
      console.log("Connected to server ✅");

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const data = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          socket.send(JSON.stringify(data));
        },
        (err) => {
          console.error("Geolocation error:", err);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 0,
          timeout: 5000,
        }
      );


      return () => {
        navigator.geolocation.clearWatch(watchId);
        socket.close();
      };
    };

    socket.onmessage = (e) => {
      const received = JSON.parse(e.data);
      console.log("Received from server:", received);
      // Here you could update state to show other users on map
    };

    socket.onerror = (err) => {
      console.error("Socket error:", err);
    };

    socket.onclose = () => {
      console.log("Disconnected ❌");
    };
  }, []);

  return <div>Location tracking active...</div>;
}