// server.js (updated logic)

import { WebSocketServer } from "ws";

declare module "ws" {
  interface WebSocket {
    id: string;
    roomId: string | null;
    hasAccess: boolean;
    isCreator: boolean;
  }
}

const wss = new WebSocketServer({ port: 8080 });

const rooms = new Map();

wss.on("connection", (ws) => {
  console.log("Client connected");
  
  // Set up an ID for the client and temporary data storage
  ws.id = Math.random().toString(36).substring(7);
  ws.roomId = null; 
  ws.hasAccess = false;
  ws.isCreator = false;

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      // 1. Initial Join/Access Request
      if (data.action === 'JOIN_ROOM') {
        const { roomId, accessKey, isCreator } = data;
        ws.roomId = roomId;

        if (!rooms.has(roomId)) {
            // Case 1: Room does not exist - this user is the CREATOR
            if (isCreator) {
                const newAccessKey = Math.random().toString(36).substring(2, 10);
                rooms.set(roomId, {
                    creatorWs: ws,
                    accessKey: newAccessKey,
                    members: new Set([ws]),
                    locations: new Map(),
                });
                ws.hasAccess = true;
                ws.isCreator = true;
                
                // Send back the granted key and confirmation
                ws.send(JSON.stringify({ action: 'JOIN_SUCCESS', accessKey: newAccessKey }));
                console.log(`Room ${roomId} created. Key: ${newAccessKey}`);
            } else {
                // Should not happen, but send error
                ws.send(JSON.stringify({ action: 'ERROR', message: 'Room not found.' }));
            }
        } else {
            // Case 2: Room exists - Joining user
            const room = rooms.get(roomId);
            
            if (accessKey === room.accessKey) {
                // Access Granted
                room.members.add(ws);
                ws.hasAccess = true;
                
                // Send confirmation to the joining user
                ws.send(JSON.stringify({ action: 'JOIN_SUCCESS', accessKey: room.accessKey }));

                // Send a notification to the creator
                if (room.creatorWs && room.creatorWs.readyState === ws.OPEN) {
                    room.creatorWs.send(JSON.stringify({ action: 'MEMBER_JOINED', memberId: ws.id }));
                }

                // Broadcast current locations to the new member
                const currentLocations = Array.from(room.locations.values());
                ws.send(JSON.stringify({ action: 'ALL_LOCATIONS', locations: currentLocations }));
                
                console.log(`Client ${ws.id} joined room ${roomId}.`);
            } else {
                // Access Denied (or key missing)
                ws.send(JSON.stringify({ action: 'ACCESS_DENIED' }));
            }
        }

      // 2. Location Update
      } else if (data.action === 'LOCATION_UPDATE' && ws.hasAccess && ws.roomId) {
        const { lat, lng } = data;
        const room = rooms.get(ws.roomId);
        if (room) {
          // Store the location
          const locationData = { id: ws.id, lat, lng, name: `User ${ws.id.slice(0, 4)}` };
          room.locations.set(ws, locationData);

          room.members.forEach((client:any) => {
            if (client !== ws && client.readyState === ws.OPEN) {
              client.send(JSON.stringify({ action: 'USER_LOCATION', ...locationData }));
            }
          });
        }

      }
    } catch (e) {
      console.error("Invalid message format:", e);
    }
  });

  ws.on("close", () => {
    console.log(`Client ${ws.id} disconnected`);
    
    if (ws.roomId && rooms.has(ws.roomId)) {
      const room = rooms.get(ws.roomId);
      room.members.delete(ws);
      room.locations.delete(ws);
      
      // If the creator leaves or the room is empty, clean up
      if (room.members.size === 0 || ws.isCreator) {
        rooms.delete(ws.roomId);
        console.log(`Room ${ws.roomId} closed.`);
      } else {
        // Notify others of the member leaving
        room.members.forEach((client:any) => {
            if (client.readyState === ws.OPEN) {
                client.send(JSON.stringify({ action: 'MEMBER_LEFT', memberId: ws.id }));
            }
        });
      }
    }
  });
});