import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

// User Schema යාවත්කාලීන කිරීම
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true }, // WhatsApp Number එක
  password: { type: String, required: true }, // මුරපදය
  alYear: { type: String, required: true },
  center: { type: String, required: true }, // මධ්‍යස්ථානය
  classTypes: { type: [String], default: ['Theory'] }, // Theory, Revision, Paper
  status: { type: String, default: 'Active' }, // Active / Inactive
  role: { type: String, default: 'Student' },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// අලුත් සිසුවෙක් ඇතුළත් කිරීම (POST)
export async function POST(req) {
  try {
    const { name, email, password, alYear, center, classTypes } = await req.json();
    await connectToDatabase();

    // මේ අංකයෙන් ළමයෙක් දැනටමත් ඉන්නවාද බලනවා
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'මෙම අංකයෙන් ගිණුමක් දැනටමත් පවතී!' }, { status: 400 });
    }

    const newUser = new User({
      name, email, password, alYear, center, classTypes, status: 'Active', role: 'Student'
    });
    
    await newUser.save();
    return NextResponse.json({ message: 'සාර්ථකයි!' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
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
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
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