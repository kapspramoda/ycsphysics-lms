import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  alYear: String, // අලුතින් එකතු කළ කොටස
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

export async function POST(req) {
  try {
    const { name, email, password, alYear } = await req.json();
    await connectToDatabase();
    const existingUser = await User.findOne({ email });
    if (existingUser) return NextResponse.json({ message: 'මෙම ඊමේල් ලිපිනය දැනටමත් භාවිතයේ පවතී.' }, { status: 400 });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ name, email, password: hashedPassword, alYear });
    await newUser.save();
    return NextResponse.json({ message: 'ලියාපදිංචිය සාර්ථකයි!' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'සේවාදායකයේ දෝෂයක් මතු විය.' }, { status: 500 });
  }
}