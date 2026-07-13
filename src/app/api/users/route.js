import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

// ළමයින්ගේ ලියාපදිංචි දත්ත ගබඩාව (User Model)
const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  alYear: { type: String, required: true }
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year');
    
    await connectToDatabase();
    
    // අදාළ අවුරුද්දට ඉන්න ළමයි ටික විතරක් පෙරලා ගන්නවා
    const query = year && year !== 'All' ? { alYear: year } : {};
    const users = await User.find(query).select('name email alYear').sort({ name: 1 });
    
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}