import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

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
    
    const newNoti = new Notification({ message, alYear });
    await newNoti.save();

    return NextResponse.json({ success: true, message: 'පණිවිඩය සාර්ථකව යවන ලදී!' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}

// පණිවිඩ ලබා ගැනීම (Student සහ Admin දෙදෙනාටම)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') || 'All';
    await connectToDatabase();

    const query = year === 'All' ? {} : { $or: [{ alYear: year }, { alYear: 'All' }] };
    const notifications = await Notification.find(query).sort({ date: -1 }).lean();
    const notification = notifications.length > 0 ? notifications[0] : null;

    return NextResponse.json({ notification, notifications }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}

// පණිවිඩයක් මකා දැමීම (Admin සඳහා)
export async function DELETE(req) {
  try {
    const { id } = await req.json();
    await connectToDatabase();
    await Notification.findByIdAndDelete(id);
    return NextResponse.json({ message: 'පණිවිඩය සාර්ථකව ඉවත් කළා.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයකි.' }, { status: 500 });
  }
}