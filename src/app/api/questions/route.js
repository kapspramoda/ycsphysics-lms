import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

const QuestionSchema = new mongoose.Schema({
  paperName: { type: String, required: true },
  alYear: { type: String, required: true },
  text: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: { type: Number, required: true },
  isVisible: { type: Boolean, default: true }, // Hide/Show සඳහා
  date: { type: Date, default: Date.now }
});

const Question = mongoose.models.Question || mongoose.model('Question', QuestionSchema);

export async function POST(req) {
  try {
    const { paperName, alYear, text, options, correctAnswer } = await req.json();
    await connectToDatabase();
    const newQuestion = new Question({ paperName, alYear, text, options, correctAnswer });
    await newQuestion.save();
    return NextResponse.json({ message: 'ප්‍රශ්නය එක් කළා!' });
  } catch (error) { return NextResponse.json({ message: 'දෝෂයකි.' }, { status: 500 }); }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') || 'All';
    const isAdmin = searchParams.get('admin');
    await connectToDatabase();
    
    let query = (year !== 'All') ? { $or: [{ alYear: year }, { alYear: 'All' }] } : {};
    if (isAdmin !== 'true') { query.isVisible = { $ne: false }; }

    const questions = await Question.find(query).sort({ date: 1 });
    return NextResponse.json({ questions });
  } catch (error) { return NextResponse.json({ message: 'දෝෂයකි.' }, { status: 500 }); }
}

export async function PATCH(req) {
  try {
    const { id, isVisible } = await req.json();
    await connectToDatabase();
    await Question.findByIdAndUpdate(id, { isVisible });
    return NextResponse.json({ message: 'යාවත්කාලීන විය.' });
  } catch (error) { return NextResponse.json({ message: 'දෝෂයකි.' }, { status: 500 }); }
}

export async function DELETE(req) {
  try {
    const { id } = await req.json();
    await connectToDatabase();
    await Question.findByIdAndDelete(id);
    return NextResponse.json({ message: 'ප්‍රශ්නය මකා දැමුවා.' });
  } catch (error) { return NextResponse.json({ message: 'දෝෂයකි.' }, { status: 500 }); }
}