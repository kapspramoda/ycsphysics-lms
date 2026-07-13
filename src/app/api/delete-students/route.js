import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

// User Schema එක
const UserSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  alYear: String,
  center: { type: String, default: "Online" } 
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export async function GET() {
  try {
    await connectToDatabase();

    // මකා නොදමා ඉතිරි කළ යුතු අංක මෙතනට දෙන්න
    const keepTheseNumbers = ["0711111111", "0722222222", "admin"];

    // ඉහත අංක හැර අනෙකුත් සියලුම දත්ත මකා දැමීම ($nin = Not In)
    const result = await User.deleteMany({
      username: { $nin: keepTheseNumbers }
    });

    return NextResponse.json({ 
      message: "සාර්ථකයි! අනවශ්‍ය සියලුම ගිණුම් Database එකෙන් මකා දමන ලදී.", 
      deletedCount: result.deletedCount,
      keptAccounts: keepTheseNumbers
    });

  } catch (error) {
    console.error("Delete Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}