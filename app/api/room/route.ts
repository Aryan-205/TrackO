import { prisma } from "@/db/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { roomName, adminId } = await req.json();

    if (!roomName || !adminId) {
      return NextResponse.json({ message: "Missing roomName or adminId" }, { status: 400 });
    }

    const existingRoom = await prisma.room.findUnique({
        where: { slug: roomName },
    });

    if (existingRoom) {
        return NextResponse.json({ message: "Room name already taken. Please choose something else." }, { status: 409 });
    }

    const accessKey = Math.random().toString(36).slice(2, 10);

    const room = await prisma.room.create({
      data: {
        slug: roomName, 
        adminId:Number(adminId),
        accessKey,
      },
    });


    return NextResponse.json({
      adminId,
      roomId: room.id,
      accessKey: room.accessKey,
      message: "Room created successfully",
    }, { status: 200 });
  } catch (error) {
    console.error("Room creation error:", error);
    return NextResponse.json({ message: "Internal Server Error1" }, { status: 500 });
  }

}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    
    const roomId = url.searchParams.get("roomId"); 

    if (!roomId) {
        return NextResponse.json({ message: "Missing roomId parameter" }, { status: 400 });
    }

    const room = await prisma.room.findUnique({
      where: { id: Number(roomId) },
      select: { adminId: true, accessKey: true, slug: true },
    });

    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(room, { status: 200 });

  } catch (error) {
    console.error("Fetch room error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
