import bcrypt from 'bcrypt'
import { NextRequest, NextResponse } from "next/server"
import {prisma} from '@/db/prisma'

export default async function Signup(req:NextRequest){

  try {
    const { email, password } = await req.json()

    if(!email || !password){
      return NextResponse.json({message:"Email and Password are required", success:false })
    }

    const user = await prisma.User.findUnique({
      where:{email}
    })
    if(user){
      return NextResponse.json({message:"User already exist", success:false})
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.User.create({
      data:{ 
        email,
        password:hashPassword
      }
    })

    return NextResponse.json({ message: 'User created successfully', id: newUser.id, success:true }, { status: 201 });
    
  } catch (error) {
    return NextResponse.json({ message: 'Something went wrong',success:false }, { status: 500 });
  }
}