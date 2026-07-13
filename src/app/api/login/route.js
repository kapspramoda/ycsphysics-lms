import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// User Model (අලුත් center එකත් එක්ක)
const UserSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  alYear: String,
  center: { type: String, default: "Online" } 
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    
    await connectToDatabase();
    const user = await User.findOne({ username });
    
    if (!user) {
      return NextResponse.json(
        { message: 'මෙම WhatsApp අංකයෙන් ලියාපදිංචි වූ ගිණුමක් නොමැත.' }, 
        { status: 400 }
      );
    }

    let isPasswordMatch = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isPasswordMatch = await bcrypt.compare(password, user.password);
    } else {
      isPasswordMatch = (user.password === password);
    }

    if (!isPasswordMatch) {
      return NextResponse.json(
        { message: 'ඔබ ඇතුළත් කළ මුරපදය වැරදියි. කරුණාකර නැවත උත්සාහ කරන්න.' }, 
        { status: 400 }
      );
    }

    // මෙන්න මේ කොටස තමයි අපි අලුතින් හැදුවේ (alYear සහ center යැවීම)
    return NextResponse.json(
      { 
        message: 'සාර්ථකයි', 
        user: { 
          name: user.name, 
          username: user.username, 
          email: user.email,
          alYear: user.alYear, // Batch එක යවයි
          center: user.center  // Center එක යවයි
        } 
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: 'සේවාදායකයේ දෝෂයක් මතු විය. නැවත උත්සාහ කරන්න.' }, 
      { status: 500 }
    );
  }
}