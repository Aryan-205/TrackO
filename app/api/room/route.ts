import { prisma } from "@/db/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { roomName, adminId } = await req.json();
    console.log("Received:", { roomName, adminId });

    if (!roomName || !adminId) {
      return NextResponse.json({ message: "Missing roomName or adminId" }, { status: 400 });
    }

    const accessKey = Math.random().toString(36).slice(2, 10);

    const room = await prisma.room.create({
      data: {
        slug: roomName,  // Consider slug sanitization or uniqueness
        adminId,
        accessKey,
      },
    });

    console.log("Room created:", room);

    return NextResponse.json({
      link: `/room/${room.id}`,
      roomId: room.id,
      accessKey: room.accessKey,
      message: "Room created successfully",
    }, { status: 200 });
  } catch (error) {
    console.error("Room creation error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }

}
