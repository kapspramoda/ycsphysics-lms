import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

// 🔴 අලුත් දත්ත වහාම පෙන්වීමට Cache වීම සම්පූර්ණයෙන්ම නවතාලීම
export const dynamic = 'force-dynamic';

const MarkSchema = new mongoose.Schema({
  email: String,
  paperName: String,
  score: Number,
  alYear: String,
  createdAt: { type: Date, default: Date.now }
}, { strict: false });

const Mark = mongoose.models.Mark || mongoose.model('Mark', MarkSchema);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    
    if (!email) return NextResponse.json({ message: 'Email is required' }, { status: 400 });

    await connectToDatabase();

    // 1. සිසුවාගේ සියලුම ලකුණු ලබාගැනීම (පිළිවෙළට පෙන්වීමට _id: 1 භාවිතා කරයි)
    const myMarks = await Mark.find({ email }).sort({ _id: 1 }).lean();

    // 2. එක් එක් ප්‍රශ්න පත්‍රය සඳහා Rank එක සහ වැඩිම ලකුණ ගණනය කිරීම
    const enhancedMarks = await Promise.all(myMarks.map(async (mark) => {
      
      // මෙම ප්‍රශ්න පත්‍රයට අදාළව සියලුම සිසුන්ගේ ලකුණු පිළිවෙළට (අවරෝහණ - වැඩිම ලකුණේ සිට අඩුම ලකුණට) ලබාගැනීම
      const allMarksForPaper = await Mark.find({ paperName: mark.paperName, alYear: mark.alYear })
                                         .sort({ score: -1 })
                                         .lean();
      
      // පන්තියේ වැඩිම ලකුණ ලබා ගැනීම
      const highestScore = allMarksForPaper.length > 0 ? allMarksForPaper[0].score : mark.score;
      
      // ලැයිස්තුවේ සිසුවා ඉන්නා ස්ථානය (Index) සොයාගෙන එයට 1ක් එකතු කිරීම (Rank)
      const rankIndex = allMarksForPaper.findIndex(m => m.email === email);
      const rank = rankIndex !== -1 ? rankIndex + 1 : '-';

      return {
        ...mark,
        highestScore,
        rank // 🔴 Rank එක Frontend එකට යැවීම
      };
    }));

    return NextResponse.json({ marks: enhancedMarks }, { status: 200 });
    
  } catch (error) {
    console.error("My Marks GET Error:", error);
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}