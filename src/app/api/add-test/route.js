import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  alYear: String
});

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export async function GET() {
  try {
    await connectToDatabase();

    const testUser = { 
        name: "Test Student", 
        username: "0777777777", 
        email: "0777777777@student.com", // Error එක නොඑන්න දාන බොරු ඊමේල් එක
        alYear: "2026"
    };
    
    // ලේසි Password එකක් දාමු
    const testPassword = "123"; 
    const hashedPassword = await bcrypt.hash(testPassword, 10);

    const exists = await User.findOne({ username: testUser.username });
    
    if (!exists) {
      await User.create({
        name: testUser.name,
        username: testUser.username,
        email: testUser.email,
        password: hashedPassword,
        alYear: testUser.alYear
      });
      return NextResponse.json({ message: "✅ Test Account සාර්ථකව සෑදුවා! Username: 0777777777 | Password: 123" });
    } else {
      return NextResponse.json({ message: "⚠️ Test Account එක කලින්ම හදලා තියෙන්නේ. Username: 0777777777 | Password: 123" });
    }

  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}