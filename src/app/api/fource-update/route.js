import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

// Model එක තාවකාලිකව හැදීම
const UserSchema = new mongoose.Schema({
    name: String,
    username: String,
    alYear: String,
    center: String
}, { strict: false });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

export async function GET() {
  try {
    await connectToDatabase();
    
    // ළමුන්ගේ අංක
    const penoloa = ["0714902868", "0762419753", "0703166048", "0716752200", "0715864506", "0742310702", "0775826915", "0786098998", "0740502660", "0704285961", "0775203166", "0787167218", "0740878331", "0742651775"];
    const omaththa = ["0764187288", "0773934686", "0779720454", "0770454451", "0762722292", "0703091716", "0774374297", "0771969401", "0789303851"];

    // Penoloa ළමුන්ගේ දත්ත බලෙන්ම Update කිරීම
    const res1 = await User.updateMany(
      { username: { $in: penoloa } },
      { $set: { center: "Penoloa", alYear: "2027" } }
    );

    // Omaththa ළමුන්ගේ දත්ත බලෙන්ම Update කිරීම
    const res2 = await User.updateMany(
      { username: { $in: omaththa } },
      { $set: { center: "Omaththa", alYear: "2027" } }
    );

    return NextResponse.json({ 
        message: "✅ සාර්ථකයි! සියලුම ළමුන්ගේ Batch සහ Center දත්ත Database එකට යාවත්කාලීන කරන ලදී.",
        penoloaUpdatedCount: res1.modifiedCount,
        omaththaUpdatedCount: res2.modifiedCount
    });

  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}