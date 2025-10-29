import { WebSocket, WebSocketServer } from 'ws';

type StandardWebSocket = WebSocket;

interface ClientInfo {
    roomId: string | null;
    userId: string | null;
    isAdmin: boolean;
    name: string | null;
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

const pendingRequests = new Map<string, Map<string, { ws: StandardWebSocket; requesterName?: string }>>();

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

  clients.set(ws,{name: null, roomId: null, userId: null, isAdmin: false });
  
  ws.on('message', (message: Buffer) => {
        handleIncomingMessage(ws, message.toString());
    });
    
  ws.on('close', () => {
        cleanUpClient(ws);
    });

  // Ensure errors also trigger cleanup to avoid leaks
  ws.on('error', () => {
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

        // Remove any pending request entries for this client
        const pending = pendingRequests.get(clientInfo.roomId);
        if (pending && clientInfo.userId) {
            pending.delete(clientInfo.userId);
            if (pending.size === 0) pendingRequests.delete(clientInfo.roomId);
        }
    }
    clients.delete(ws);
}

function getOrCreateRoom(roomId: string): Set<StandardWebSocket> {
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
    }
    return rooms.get(roomId)!;
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
    clientInfo.name = requesterName ?? null;

    if (isCreator) {
        const existingAdmin = Array.from(clients.keys()).find(client =>
            clients.get(client)?.roomId === roomId && clients.get(client)?.isAdmin
        );

        if (existingAdmin) {

            clientInfo.isAdmin = false;
            clients.set(ws, clientInfo);
            unicast(ws, { action: 'ADMIN_DENIED', message: 'An admin already exists for this room.' });
            console.log(`Admin claim denied for ${userId} in room ${roomId} (admin already present).`);
            return;
        }

        clientInfo.isAdmin = true;
        clients.set(ws, clientInfo);
        const room = getOrCreateRoom(roomId);
        room.add(ws);
        console.log(`Admin joined his room ${roomId}.`);
        return;
    }

    clientInfo.isAdmin = false;
    clients.set(ws, clientInfo);
    console.log(`Guest connected requesting room ${roomId}: ${userId}`);
}

function handlePermissionRequest(ws: StandardWebSocket, data: IncomingData, clientInfo: ClientInfo): void {
    const { roomId, userId, requesterName } = data;

    if (!roomId || !userId) return;

    const adminClient = Array.from(clients.keys()).find(client =>
        clients.get(client)?.roomId === roomId && clients.get(client)?.isAdmin
    ) as StandardWebSocket | undefined;

    if (!pendingRequests.has(roomId)) pendingRequests.set(roomId, new Map());
    pendingRequests.get(roomId)!.set(userId, { ws, requesterName });

    if (adminClient) {
        // Admin is online
        unicast(adminClient, {
            action: 'NEW_REQUEST',
            requesterId: userId,
            requesterName: requesterName,
        });
        console.log(`Access request from ${requesterName} sent to admin.`);
        unicast(ws, { action: 'REQUEST_SENT', message: 'Waiting for admin approval.' });
        
    } else {
        // Admin is offline: queue request and inform guest
        unicast(ws, { action: 'REQUEST_QUEUED', message: 'Admin offline, request queued.' });
        console.log(`Guest ${userId} queued for room ${roomId} (Admin offline).`);
    }
}

function handleAdminResponse(ws: StandardWebSocket, data: IncomingData, clientInfo: ClientInfo): void {
    if (!clientInfo.isAdmin) {
        unicast(ws, { action: 'ERROR', message: 'Unauthorized action.' });
        return;
    }

    const { approved, targetId, roomId } = data;

    if (!targetId || !roomId) return;

    // First try to find the client by active connections
    let targetClient = Array.from(clients.keys()).find(client =>
        clients.get(client)?.userId === targetId && clients.get(client)?.roomId === roomId
    ) as StandardWebSocket | undefined;

    // If not found in active clients, check pendingRequests (queued while admin was offline)
    if (!targetClient) {
        const pending = pendingRequests.get(roomId);
        const pendingEntry = pending?.get(targetId);
        if (pendingEntry) targetClient = pendingEntry.ws;
    }

    if (!targetClient) {
        unicast(ws, { action: 'ERROR', message: 'Target client not connected or request not found.' });
        console.log(`Admin response for unknown target ${targetId} in room ${roomId}.`);
        return;
    }

    // Retrieve and update client info
    const targetInfo = clients.get(targetClient);
    if (!targetInfo) {
        unicast(ws, { action: 'ERROR', message: 'Target client info missing.' });
        return;
    }

    if (approved) {
        // Add to room membership and clear pending request
        const room = getOrCreateRoom(roomId);
        room.add(targetClient);

        targetInfo.roomId = roomId;
        clients.set(targetClient, targetInfo);

        // Remove pending request record
        const pending = pendingRequests.get(roomId);
        if (pending) {
            pending.delete(targetId);
            if (pending.size === 0) pendingRequests.delete(roomId);
        }

        unicast(targetClient, { action: 'JOIN_SUCCESS', message: 'Access granted.' });
        roomcast(roomId, { action: 'MEMBER_JOINED', memberId: targetId });
        console.log(`Access GRANTED to ${targetId} in room ${roomId}.`);
    } else {
        // Deny access and remove pending record
        const pending = pendingRequests.get(roomId);
        if (pending) {
            pending.delete(targetId);
            if (pending.size === 0) pendingRequests.delete(roomId);
        }

        unicast(targetClient, { action: 'ACCESS_DENIED', message: 'Access denied by admin.' });
        console.log(`Access DENIED to ${targetId} in room ${roomId}.`);
    }
}

function handleLocationUpdate(ws: StandardWebSocket, data: IncomingData, clientInfo: ClientInfo): void {
    if (!clientInfo.roomId) return;
    
    const isMember = rooms.get(clientInfo.roomId)?.has(ws);

    if (!isMember) {
        unicast(ws, { action: 'ERROR', message: 'Unauthorized to send location updates.' });
        return;
    }
    
    const { location } = data;

    if (location) {
        roomcast(clientInfo.roomId, {
            action: 'USER_LOCATION',
            userId: clientInfo.userId,
            name: clientInfo.name,
            location: location
        });
    }
}