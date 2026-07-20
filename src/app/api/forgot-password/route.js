import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

const PwRequestSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  newPassword: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  date: { type: Date, default: Date.now }
});

const PwRequest = mongoose.models.PwRequest || mongoose.model('PwRequest', PwRequestSchema);

// Admin User Model එකටත් සම්බන්ධ වීම (පාස්වර්ඩ් එක Update කරන්න)
const User = mongoose.models.User || mongoose.model('User', new mongoose.Schema({}, { strict: false }));

export async function POST(req) {
  try {
    const { phone, newPassword } = await req.json();
    await connectToDatabase();

    const user = await User.findOne({ $or: [{ username: phone }, { email: phone }] });
    if (!user) return NextResponse.json({ message: 'මෙම අංකයෙන් ගිණුමක් සොයාගත නොහැක.' }, { status: 404 });

    const newReq = new PwRequest({ phone, newPassword });
    await newReq.save();
    return NextResponse.json({ message: 'ඉල්ලීම යවන ලදී.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDatabase();
    const requests = await PwRequest.find({ status: 'Pending' }).sort({ date: -1 });
    return NextResponse.json({ requests }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { id, action } = await req.json();
    await connectToDatabase();

    const pwReq = await PwRequest.findById(id);
    if (!pwReq) return NextResponse.json({ message: 'Not found' }, { status: 404 });

    if (action === 'Approve') {
      // ළමයාගේ පාස්වර්ඩ් එක Database එකෙන් මාරු කිරීම
      await User.findOneAndUpdate(
        { $or: [{ username: pwReq.phone }, { email: pwReq.phone }] },
        { password: pwReq.newPassword }
      );
      pwReq.status = 'Approved';
    } else {
      pwReq.status = 'Rejected';
    }
    
    await pwReq.save();
    return NextResponse.json({ message: 'සාර්ථකයි', phone: pwReq.phone, password: pwReq.newPassword }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}