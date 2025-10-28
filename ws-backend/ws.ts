import { WebSocket, WebSocketServer } from 'ws';

type StandardWebSocket = WebSocket;

interface ClientInfo {
    roomId: string | null;
    userId: string | null;
    isAdmin: boolean;
}

interface IncomingData {
    action: string;
    roomId?: string;
    userId?: string;
    isCreator: boolean;
    requesterName?: string;
    approved?: boolean;
    targetId?: string; 
    location?: { lat: number; lng: number; };
}

const wss = new WebSocketServer({port:8080},()=>{
  console.log("WebSocket server running on ws://localhost:8080")
})

const clients = new Map<StandardWebSocket, ClientInfo>();

const rooms = new Map<string, Set<StandardWebSocket>>();

function unicast(client: StandardWebSocket, data: any): void {
    if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
    }
}

function roomcast(roomId: string, data: any): void { 
    const roomClients = rooms.get(roomId);
    if (roomClients) {
        roomClients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    }
}

wss.on("connection",(ws: WebSocket)=>{

  clients.set(ws,{roomId: null, userId: null, isAdmin: false });
  
  ws.on('message', (message: Buffer) => { 
        handleIncomingMessage(ws, message.toString());
    });
    
  ws.on('close', () => {
        cleanUpClient(ws);
    });
})

function cleanUpClient(ws: StandardWebSocket): void {
    const clientInfo = clients.get(ws);

    if (clientInfo && clientInfo.roomId) {
        const roomClients = rooms.get(clientInfo.roomId);
        if (roomClients) {
            roomClients.delete(ws);
            // Notify room that a member left
            if (clientInfo.roomId && clientInfo.userId) {
                roomcast(clientInfo.roomId, { action: 'MEMBER_LEFT', memberId: clientInfo.userId });
            }
        }
    }
    clients.delete(ws);
}


function handleIncomingMessage(ws: StandardWebSocket, message: string): void {
  const clientInfo = clients.get(ws);
  
  if (!clientInfo) return; 

  let data: IncomingData;
  try {
    data = JSON.parse(message);
  } catch (e) {
    console.error("Invalid JSON received:", message);
    return;
  }

  switch (data.action) {
    case 'JOIN_ROOM':
        handleJoinRoom(ws, data, clientInfo);
        break;
        
    case 'REQUEST_PERMISSION':
        handlePermissionRequest(ws, data, clientInfo);
        break;

    case 'ADMIN_RESPONSE':
        handleAdminResponse(ws, data, clientInfo);
        break;

    case 'LOCATION_UPDATE':
        handleLocationUpdate(ws, data, clientInfo);
        break;
    
    case 'LEAVING_ROOM':
        cleanUpClient(ws);
        break;

    default:
        console.log(`Unknown action received: ${data.action}`);
  }
}

function handleJoinRoom(ws: StandardWebSocket, data: IncomingData, clientInfo: ClientInfo): void {
    const { roomId, userId, isCreator, requesterName } = data;

    if (!roomId || !userId) return;

    clientInfo.roomId = roomId;
    clientInfo.userId = userId;
    clientInfo.isAdmin = isCreator;
    clients.set(ws, clientInfo); 

    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
    }

    const roomClients = rooms.get(roomId);
    
    if (clientInfo.isAdmin) {

      roomClients?.add(ws);
      console.log(`Admin joined his room ${roomId}.`);

    } 

    else {
      const adminClient = Array.from(clients.keys()).find(client => 
          clients.get(client)?.roomId === roomId && clients.get(client)?.isAdmin
      ) as StandardWebSocket | undefined;

      if (adminClient) {
        //frontend
        unicast(adminClient, { 
            action: 'NEW_REQUEST', 
            requesterId: userId,
            requesterName: requesterName,
        });
        console.log(`Access request from ${requesterName} sent to admin.`);
        
        //frontend
        unicast(ws, { action: 'REQUEST_SENT', message: 'Waiting for admin approval.' });
        
      } else {
        unicast(ws, { action: 'ACCESS_DENIED', message: 'Admin is currently offline. Cannot grant access.' });
        console.log(`Guest ${userId} DENIED access to room ${roomId} (Admin offline).`);
      }
    }
}

function handlePermissionRequest(ws: StandardWebSocket, data: IncomingData, clientInfo: ClientInfo): void {
    // We reuse the logic from the guest section of handleJoinRoom.
    handleJoinRoom(ws, data, clientInfo);
}

function handleAdminResponse(ws: StandardWebSocket, data: IncomingData, clientInfo: ClientInfo): void {
    if (!clientInfo.isAdmin) {
        unicast(ws, { action: 'ERROR', message: 'Unauthorized action.' });
        return;
    }

    const { approved, targetId, roomId } = data; 

    if (!targetId || !roomId) return;

    const targetClient = Array.from(clients.keys()).find(client => 
        clients.get(client)?.userId === targetId && clients.get(client)?.roomId === roomId
    ) as StandardWebSocket | undefined;

    if (targetClient) {
        if (approved) {
            rooms.get(roomId)?.add(targetClient);
            unicast(targetClient, { action: 'JOIN_SUCCESS', message: 'Access granted.' });
            
            roomcast(roomId, { action: 'MEMBER_JOINED', memberId: targetId });
            console.log(`Access GRANTED to ${targetId} in room ${roomId}.`);
        } else {
            // 3. Deny access
            unicast(targetClient, { action: 'ACCESS_DENIED', message: 'Access denied by admin.' });
            console.log(`Access DENIED to ${targetId} in room ${roomId}.`);
        }
    }
}

function handleLocationUpdate(ws: StandardWebSocket, data: IncomingData, clientInfo: ClientInfo): void {
    if (!clientInfo.roomId) return;
    
    const isMember = rooms.get(clientInfo.roomId)?.has(ws);

    // Security check: Only broadcast if the user is an authorized member
    if (!isMember) {
        unicast(ws, { action: 'ERROR', message: 'Unauthorized to send location updates.' });
        return;
    }

    const n = navigator.geolocation.watchPosition()
    
    // Broadcast the location update to all other room members
    const { location } = data;
    if (location) {
        roomcast(clientInfo.roomId, { 
            action: 'USER_LOCATION', 
            userId: clientInfo.userId, 
            location: location 
        });
    }
}
