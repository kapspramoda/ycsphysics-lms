import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: String,
  username: { type: String },
  email: { type: String }, // Admin පැත්තෙන් phone එක save වෙන්නේ මෙතනට
  password: String,
  alYear: String,
  center: { type: String, default: "Online" },
  status: { type: String, default: "Active" } // Active / Inactive
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    await connectToDatabase();
    
    // username සහ email කියන තීරු දෙකෙන්ම WhatsApp අංකය පරීක්ෂා කිරීම
    const user = await User.findOne({ $or: [{ username: username }, { email: username }] });
    
    if (!user) {
      return NextResponse.json({ message: 'මෙම WhatsApp අංකයෙන් ලියාපදිංචි වූ ගිණුමක් නොමැත.' }, { status: 400 });
    }

    // ගිණුම Deactivate කර ඇත්නම්
    if (user.status === 'Inactive') {
      return NextResponse.json({ message: 'ඔබගේ ගිණුම තාවකාලිකව අත්හිටුවා ඇත. කරුණාකර පන්ති භාරව කටයුතු කරන්නා අමතන්න.' }, { status: 403 });
    }

    let isPasswordMatch = false;
    if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$'))) {
      isPasswordMatch = await bcrypt.compare(password, user.password);
    } else {
      isPasswordMatch = (user.password === password);
    }

    if (!isPasswordMatch) {
      return NextResponse.json({ message: 'ඔබ ඇතුළත් කළ මුරපදය වැරදියි. කරුණාකර නැවත උත්සාහ කරන්න.' }, { status: 400 });
    }

    return NextResponse.json(
      { 
        message: 'සාර්ථකයි', 
        user: { 
          name: user.name, 
          username: user.email || user.username, 
          email: user.email,
          alYear: user.alYear, 
          center: user.center  
        } 
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: 'සේවාදායකයේ දෝෂයක් මතු විය. නැවත උත්සාහ කරන්න.' }, { status: 500 });
  }
}