import { prisma } from "@/db/prisma";
import { NextRequest, NextResponse } from "next/server";

export default async function Room(req:NextRequest) {
  try {

    const {slug, adminId} = await req.json()
    
    if(!slug || !adminId) return NextResponse.json({message:"cannot fint roomName or adminId", success:false}, { status: 400 })
      
    const room = await prisma.room.create({
      data:{
        slug,
        adminId
      }
    })
      
    if(!room) return NextResponse.json({message:"Something went wrong", success:false})
      
      return NextResponse.json({message:"Room created successfully", success:true, slug:room.slug, link:`/room/${room.slug}`})
  } catch (error) {
    return NextResponse.json({ message: "Failed to create room" }, { status: 500 });
  }
}