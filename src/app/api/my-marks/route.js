import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

const MarkSchema = new mongoose.Schema({
  email: String,
  paperName: String,
  score: Number,
  alYear: String,
}, { strict: false });

const Mark = mongoose.models.Mark || mongoose.model('Mark', MarkSchema);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    
    if (!email) return NextResponse.json({ message: 'Email is required' }, { status: 400 });

    await connectToDatabase();
    
    // 1. ළමයාගේ ලකුණු ටික ගෙන ඒම
    const studentMarks = await Mark.find({ email }).sort({ _id: 1 });
    
    // 2. ඒ හැම පේපර් එකකටම පන්තියේ වැඩිම ලකුණ හෙවීම
    const results = await Promise.all(studentMarks.map(async (m) => {
      const highestMarkDoc = await Mark.findOne({ paperName: m.paperName, alYear: m.alYear }).sort({ score: -1 });
      return {
        _id: m._id,
        paperName: m.paperName,
        score: m.score,
        alYear: m.alYear,
        highestScore: highestMarkDoc ? highestMarkDoc.score : m.score
      };
    }));

    return NextResponse.json({ marks: results }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}