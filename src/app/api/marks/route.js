import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

// alYear එක අලුතින් එකතු කළා
const MarkSchema = new mongoose.Schema({
  email: { type: String, required: true },
  paperName: { type: String, required: true },
  score: { type: Number, required: true },
  examType: { type: String, default: 'Physical' },
  alYear: { type: String, default: '2026' }, 
  date: { type: Date, default: Date.now }
});

const Mark = mongoose.models.Mark || mongoose.model('Mark', MarkSchema);

export async function POST(req) {
  try {
    const { email, paperName, score, examType, alYear } = await req.json();
    await connectToDatabase();
    
    const finalExamType = examType || 'Physical';
    const finalYear = alYear || '2026';

    const newMark = new Mark({ email, paperName, score, examType: finalExamType, alYear: finalYear });
    await newMark.save();

    return NextResponse.json({ message: 'ලකුණු සාර්ථකව ඇතුළත් කරන ලදී.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const year = searchParams.get('year');
    await connectToDatabase();

    let query = {};
    if (email) query.email = email;
    if (year) query.alYear = year; // අවුරුද්ද අනුව ලකුණු ගේන්න

    const marks = await Mark.find(query).sort({ date: -1 });
    return NextResponse.json({ marks }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}

// අලුත්: ලකුණු වෙනස් කිරීම (Edit)
export async function PATCH(req) {
  try {
    const { id, email, paperName, score, alYear } = await req.json();
    await connectToDatabase();
    await Mark.findByIdAndUpdate(id, { email, paperName, score, alYear });
    return NextResponse.json({ message: 'ලකුණු යාවත්කාලීන විය.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}

// අලුත්: ලකුණු මකා දැමීම (Erase)
export async function DELETE(req) {
  try {
    const { id } = await req.json();
    await connectToDatabase();
    await Mark.findByIdAndDelete(id);
    return NextResponse.json({ message: 'ලකුණු මකා දැමුවා.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}