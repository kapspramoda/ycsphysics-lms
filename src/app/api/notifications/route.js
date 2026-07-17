import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  alYear: { type: String, required: true }, // 'All', '2026', '2027', ආදී වශයෙන්
  date: { type: Date, default: Date.now }
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);

// පණිවිඩයක් යැවීම (Admin සඳහා)
export async function POST(req) {
  try {
    const { message, alYear } = await req.json();
    await connectToDatabase();
    
    // අලුත් පණිවිඩය සේව් කිරීම
    const newNoti = new Notification({ message, alYear });
    await newNoti.save();

    return NextResponse.json({ success: true, message: 'පණිවිඩය සාර්ථකව යවන ලදී!' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}

// පණිවිඩ ලබා ගැනීම (Student සඳහා)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') || 'All';
    await connectToDatabase();

    // ළමයාගේ අවුරුද්දට අදාළව හෝ 'All' ලෙස යවා ඇති අලුත්ම පණිවිඩය ලබා ගනී
    const notification = await Notification.findOne({
      $or: [{ alYear: year }, { alYear: 'All' }]
    }).sort({ date: -1 });

    return NextResponse.json({ notification }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}