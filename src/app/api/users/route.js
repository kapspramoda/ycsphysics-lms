import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

// 🔴 අලුත් දත්ත වහාම පෙන්වීමට Cache වීම සම්පූර්ණයෙන්ම නවතාලීම
export const dynamic = 'force-dynamic';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String }, 
  email: { type: String }, 
  password: { type: String, required: true },
  alYear: { type: String, default: '2026' },
  center: { type: String, default: 'Online' },
  classTypes: { type: [String], default: ['Theory'] }, 
  status: { type: String, default: 'Active' }, 
  role: { type: String, default: 'Student' },
  createdAt: { type: Date, default: Date.now }
}, { strict: false }); // 🔴 පරණ දත්ත සමග ගැටීම වැළැක්වීමට

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// අලුත් සිසුවෙක් ඇතුළත් කිරීම (POST)
export async function POST(req) {
  try {
    const { name, email, password, alYear, center, classTypes } = await req.json();
    await connectToDatabase();

    const existingUser = await User.findOne({
      $or: [{ email: email }, { username: email }]
    });

    if (existingUser) {
      return NextResponse.json({ message: 'මෙම අංකයෙන් ගිණුමක් දැනටමත් පවතී!' }, { status: 400 });
    }

    const newUser = new User({
      name, 
      email: email, 
      username: email, 
      password, 
      alYear: alYear || '2026', 
      center: center || 'Online', 
      classTypes: classTypes && classTypes.length > 0 ? classTypes : ['Theory'], 
      status: 'Active', 
      role: 'Student'
    });
    
    await newUser.save();
    return NextResponse.json({ message: 'සාර්ථකයි!' }, { status: 200 });
  } catch (error) {
    console.error("User POST Error:", error);
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.', error: error.message }, { status: 500 });
  }
}

// සිසුන් ලබා ගැනීම (GET)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') || 'All';
    await connectToDatabase();
    
    // 🔴 'role: Student' ෆිල්ටර් එක ඉවත් කළා. පරණ ළමයින්වත් දැන් පෙනේවි.
    let query = {}; 
    
    // Admin සහ Editor ගිණුම් ළමයි ලැයිස්තුවෙන් ඉවත් කිරීම
    query.username = { $nin: ['admin', 'editor'] };
    
    if (year !== 'All') query.alYear = year;

    const users = await User.find(query).sort({ createdAt: -1 });

    const formattedUsers = users.map(u => ({
      _id: u._id,
      name: u.name || 'Unknown',
      email: u.email || u.username || 'No Number', 
      alYear: u.alYear || '2026',
      center: u.center || 'Online',
      classTypes: u.classTypes || ['Theory'],
      status: u.status || 'Active'
    }));

    return NextResponse.json({ users: formattedUsers }, { status: 200 });
  } catch (error) {
    console.error("User GET Error:", error);
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}

// ගිණුම Active / Inactive කිරීම (PATCH)
export async function PATCH(req) {
  try {
    const { id, status } = await req.json();
    await connectToDatabase();
    await User.findByIdAndUpdate(id, { status });
    return NextResponse.json({ message: 'Status updated' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error updating' }, { status: 500 });
  }
}

// ගිණුම මකා දැමීම (DELETE)
export async function DELETE(req) {
  try {
    const { id } = await req.json();
    await connectToDatabase();
    await User.findByIdAndDelete(id);
    return NextResponse.json({ message: 'User deleted' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Error deleting' }, { status: 500 });
  }
}