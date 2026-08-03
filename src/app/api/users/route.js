import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

// User Schema යාවත්කාලීන කිරීම (පරණ සහ අලුත් දත්ත දෙකටම ගැලපෙන්න)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String }, // Login වීමට අවශ්‍ය නිසා මෙය එක් කර ඇත
  email: { type: String }, // WhatsApp Number එක
  password: { type: String, required: true },
  alYear: { type: String, default: '2026' }, // required අයින් කර default අගයක් ලබා දී ඇත
  center: { type: String, default: 'Online' }, // required අයින් කර default අගයක් ලබා දී ඇත
  classTypes: { type: [String], default: ['Theory'] }, 
  status: { type: String, default: 'Active' }, 
  role: { type: String, default: 'Student' },
  createdAt: { type: Date, default: Date.now }
});

// Cache වීම වැළැක්වීමට
const User = mongoose.models.User || mongoose.model('User', UserSchema);

// අලුත් සිසුවෙක් ඇතුළත් කිරීම (POST)
export async function POST(req) {
  try {
    const { name, email, password, alYear, center, classTypes } = await req.json();
    await connectToDatabase();

    // මේ අංකයෙන් ළමයෙක් දැනටමත් ඉන්නවාද බලනවා (email හෝ username හරහා)
    const existingUser = await User.findOne({
      $or: [{ email: email }, { username: email }]
    });

    if (existingUser) {
      return NextResponse.json({ message: 'මෙම අංකයෙන් ගිණුමක් දැනටමත් පවතී!' }, { status: 400 });
    }

    // 🔴 WhatsApp අංකය username සහ email දෙකටම Save කරනවා (Login ගැටලු මඟහැරීමට)
    const newUser = new User({
      name, 
      email: email, 
      username: email, // අනිවාර්යයෙන්ම username එකටත් අංකය යවන්න ඕනේ
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
    
    let query = { role: 'Student' };
    if (year !== 'All') query.alYear = year;

    const users = await User.find(query).sort({ createdAt: -1 });

    // Frontend එකට යවද්දී හිස් දත්ත (null/undefined) Error නොදෙන විදිහට සකස් කර යැවීම
    const formattedUsers = users.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email || u.username, 
      alYear: u.alYear || 'N/A',
      center: u.center || 'Online',
      classTypes: u.classTypes || [],
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