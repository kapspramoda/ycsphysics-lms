import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String }, 
  email: { type: String }, 
  password: { type: String, required: true },
  alYear: { type: String, default: '2027' },
  center: { type: String, default: 'Online' },
  classTypes: { type: [String], default: ['Theory'] }, 
  status: { type: String, default: 'Active' }, 
  role: { type: String, default: 'Student' },
  createdAt: { type: Date, default: Date.now }
}, { strict: false }); 

// 🔴 Database Cache ගැටලුව විසඳීමට පරණ Model එක ඉවත් කර අලුතින් යාවත්කාලීන කිරීම
if (mongoose.models.User) {
  delete mongoose.models.User;
}
const User = mongoose.model('User', UserSchema);

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
      alYear: alYear || '2027', 
      center: center || 'Online', 
      classTypes: Array.isArray(classTypes) && classTypes.length > 0 ? classTypes : ['Theory'], 
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
    
    let query = {}; 
    query.username = { $nin: ['admin', 'editor'] };
    if (year !== 'All') query.alYear = year;

    const users = await User.find(query).sort({ createdAt: -1 }).lean();

    const formattedUsers = users.map(u => ({
      _id: u._id,
      name: u.name || 'Unknown',
      email: u.email || u.username || 'No Number', 
      alYear: u.alYear || '2027',
      center: u.center || 'Online',
      // 🔴 නිවැරදිව පන්ති වර්ගය ලබා ගැනීම
      classTypes: Array.isArray(u.classTypes) && u.classTypes.length > 0 ? u.classTypes : ['Theory'],
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

// ළමයෙකුගේ දත්ත යාවත්කාලීන කිරීම (Edit Student - PUT)
export async function PUT(request) {
  try {
    await connectToDatabase(); 

    const body = await request.json();
    const { id, name, email, password, alYear, center, classTypes } = body;

    const updateData = { name, email, alYear, center, classTypes };
    if (password) {
       updateData.password = password; 
    }

    // 🔴 $set හරහා බලහත්කාරයෙන් දත්ත යාවත්කාලීන කිරීම
    const updatedUser = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true, strict: false });

    if (!updatedUser) {
      return NextResponse.json({ message: "සිසුවා සොයාගැනීමට නොහැක." }, { status: 404 });
    }

    return NextResponse.json({ message: "සිසුවා සාර්ථකව යාවත්කාලීන විය." }, { status: 200 });

  } catch (error) {
    console.error("Update Error:", error);
    return NextResponse.json({ message: "දත්ත යාවත්කාලීන කිරීමේදී දෝෂයක් මතු විය." }, { status: 500 });
  }
}