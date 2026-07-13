import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

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

    // ටෙස්ට් කිරීම සඳහා ළමුන් දෙදෙනෙකු ඇතුළත් කර ඇත
    const students = [
      { name: "Test Student 1", username: "0711111111", center: "Online" },
      { name: "Test Student 2", username: "0722222222", center: "Panola - Matugama" }
    ];

    const defaultPassword = "Chem@2026"; 
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);
    const alYear = "2027"; 

    let addedCount = 0;
    let existingCount = 0;

    for (const student of students) {
      const exists = await User.findOne({ username: student.username });
      
      if (!exists) {
        await User.create({
          name: student.name,
          username: student.username,
          email: `${student.username}@student.com`, 
          password: hashedPassword,
          alYear: alYear,
          center: student.center 
        });
        addedCount++;
      } else {
        existingCount++;
      }
    }

    return NextResponse.json({ 
      message: "සාර්ථකයි! 2027 ළමුන් Database එකට මධ්‍යස්ථාන සමඟම ඇතුළත් කරන ලදී.", 
      added: addedCount, 
      alreadyExists: existingCount 
    });

  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}