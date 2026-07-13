import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

// අලුතින් center කියන කොටස එකතු කරලා තියෙනවා
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

    const penoloaStudents = ["0714902868", "0762419753", "0703166048", "0716752200", "0715864506", "0742310702", "0775826915", "0786098998", "0740502660", "0704285961", "0775203166", "0787167218", "0740878331", "0742651775"];
    const omaththaStudents = ["0764187288", "0773934686", "0779720454", "0770454451", "0762722292", "0703091716", "0774374297", "0771969401", "0789303851"];

    // Penoloa ළමුන් යාවත්කාලීන කිරීම
    await User.updateMany(
      { username: { $in: penoloaStudents } },
      { $set: { center: "Penoloa" } }
    );

    // Omaththa ළමුන් යාවත්කාලීන කිරීම
    await User.updateMany(
      { username: { $in: omaththaStudents } },
      { $set: { center: "Omaththa" } }
    );

    return NextResponse.json({ message: "සාර්ථකයි! මධ්‍යස්ථාන (Centers) යාවත්කාලීන කරන ලදී." });

  } catch (error) {
    console.error("Database Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}