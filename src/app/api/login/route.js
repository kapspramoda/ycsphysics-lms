import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

const UserSchema = new mongoose.Schema({
  name: String,
  username: { type: String },
  email: { type: String }, // Admin පැත්තෙන් phone එක save වෙන්නේ මෙතනට
  password: String,
  alYear: String,
  center: { type: String, default: "Online" },
  classTypes: { type: [String] }, // 🔴 Default ['Theory'] ඉවත් කළා, එවිට DB එකේ සැබෑ අගය පමණක් ගනී
  status: { type: String, default: "Active" } // Active / Inactive
}, { strict: false });

// 🔴 Server එකේ රැඳී ඇති පරණ Model Cache එක මකා අලුතින්ම Load කිරීම
if (mongoose.models.User) {
  delete mongoose.models.User;
}
const User = mongoose.model('User', UserSchema);

export async function POST(req) {
  try {
    const { username, password } = await req.json();
    await connectToDatabase();
    
    // 🔴 .lean() භාවිතා කිරීමෙන් MongoDB එකේ ඇති සැබෑම දත්ත කිසිදු වෙනසක් නොවී කෙලින්ම ලබා ගනී
    const user = await User.findOne({ 
      $or: [{ username: username.trim() }, { email: username.trim() }] 
    }).lean();
    
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

    // 🔴 Database එකේ ඇති සැබෑම classTypes ලබා ගැනීම
    const actualClasses = (Array.isArray(user.classTypes) && user.classTypes.length > 0) 
      ? user.classTypes 
      : ['Theory'];

    return NextResponse.json(
      { 
        message: 'සාර්ථකයි', 
        user: { 
          name: user.name, 
          username: user.email || user.username, 
          email: user.email || user.username,
          alYear: user.alYear, 
          center: user.center,
          classTypes: actualClasses // 🔴 දැන් නිවැරදිව ['Paper'] හෝ අදාළ පන්ති ලැබේ
        } 
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json({ message: 'සේවාදායකයේ දෝෂයක් මතු විය. නැවත උත්සාහ කරන්න.' }, { status: 500 });
  }
}