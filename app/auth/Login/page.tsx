import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { NextRequest, NextResponse } from "next/server"
import {prisma} from '@/db/prisma'

export default async function Signin(req:NextRequest){

  try {
    const { email, password } = await req.json()

    if(!email || !password){
      return NextResponse.json({message:"Email and Password are required"})
    }

    const user = await prisma.User.findUnique({
      where:{ email }
    })
    if(!user){
      return NextResponse.json({mesaage:"Cannot find User"})
    }

    const isValidPassword = await bcrypt.compare( password, user.password );

    if(!isValidPassword){
      return NextResponse.json({meassage:"Incorrect password, plz try again"}, { status: 401 })
    }

    const secret  = process.env.JWT_SECRET_KEY

    if (!secret) {
      throw new Error("JWT_SECRET_KEY is not defined in .env")
    }

    const token = jwt.sign({id:user.id}, secret) 

    return NextResponse.json({ message: 'Login successfully', token }, { status: 200 });
    
  } catch (error) {
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 });
  }
}