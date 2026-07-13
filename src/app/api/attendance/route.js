import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

const AttendanceSchema = new mongoose.Schema({
  date: { type: String, required: true }, 
  alYear: { type: String, required: true }, 
  email: { type: String, required: true }, 
  status: { type: String, required: true }, 
  note: { type: String, default: '' }, // අලුතින් එකතු කළ "පන්ති සටහන / ස්ථානය"
  timestamp: { type: Date, default: Date.now }
});

const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', AttendanceSchema);

export async function POST(req) {
  try {
    const { date, alYear, email, status, note } = await req.json();
    await connectToDatabase();
    
    const existing = await Attendance.findOne({ date, email });
    if (existing) {
      existing.status = status;
      // අලුත් සටහනක් ඇවිත් නම් විතරක් ඒක Update කරනවා
      if (note) existing.note = note; 
      await existing.save();
    } else {
      const newRecord = new Attendance({ date, alYear, email, status, note });
      await newRecord.save();
    }

    return NextResponse.json({ message: 'පැමිණීම සටහන් කළා! ✅' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date'); 
    const month = searchParams.get('month'); 
    const year = searchParams.get('year');
    
    await connectToDatabase();
    let query = {};
    if (date) query.date = date;
    if (month) query.date = { $regex: `^${month}` }; 
    if (year) query.alYear = year;

    const records = await Attendance.find(query).sort({ timestamp: -1 });
    return NextResponse.json({ records }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    await connectToDatabase();
    await Attendance.findByIdAndDelete(id);
    return NextResponse.json({ message: 'මකා දැමුවා.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}