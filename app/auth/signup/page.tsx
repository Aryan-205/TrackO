import bcrypt from 'bcrypt'
import { NextRequest, NextResponse } from "next/server"
import {prisma} from '@/db/prisma'

export default async function Signup(req:NextRequest){

  try {
    const { email, password } = await req.json()

    if(!email || !password){
      return NextResponse.json({message:"Email and Password are required"})
    }

    const user = await prisma.User.findUnique({
      where:{email}
    })
    if(user){
      return NextResponse.json("User already exist")
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await prisma.User.create({
      data:{ 
        email,
        password:hashPassword
      }
    })

    return NextResponse.json({ message: 'User created successfully', id: newUser.id }, { status: 201 });
    
  } catch (error) {
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}