import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// අලුතින් center කියන කොටස Database එකට එකතු කරලා තියෙනවා
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

    const students = [
      // --- 2027-Penoloa ---
      { name: "Ahinsa", username: "0714902868", center: "Penoloa" },
      { name: "Sasindu", username: "0762419753", center: "Penoloa" },
      { name: "Sasinima", username: "0703166048", center: "Penoloa" },
      { name: "Amaya", username: "0716752200", center: "Penoloa" },
      { name: "Chamathka", username: "0715864506", center: "Penoloa" },
      { name: "Dilshan", username: "0742310702", center: "Penoloa" },
      { name: "Dusiru", username: "0775826915", center: "Penoloa" },
      { name: "Isandi", username: "0786098998", center: "Penoloa" },
      { name: "Nethmi", username: "0740502660", center: "Penoloa" },
      { name: "Padmi", username: "0704285961", center: "Penoloa" },
      { name: "Sahan", username: "0775203166", center: "Penoloa" },
      { name: "Sadupa", username: "0787167218", center: "Penoloa" },
      { name: "Sanjula", username: "0740878331", center: "Penoloa" },
      { name: "Ishadi", username: "0742651775", center: "Penoloa" },
      
      // --- 2027-Omaththa ---
      { name: "Chamod", username: "0764187288", center: "Omaththa" },
      { name: "Danidu", username: "0773934686", center: "Omaththa" },
      { name: "Induwara", username: "0779720454", center: "Omaththa" },
      { name: "Maheema", username: "0770454451", center: "Omaththa" },
      { name: "Vidulath", username: "0762722292", center: "Omaththa" },
      { name: "Chamali", username: "0703091716", center: "Omaththa" },
      { name: "Gayumdi", username: "0774374297", center: "Omaththa" },
      { name: "Sayuri", username: "0771969401", center: "Omaththa" }, 
      { name: "Tharushani", username: "0789303851", center: "Omaththa" }
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
          center: student.center // මෙතනින් කෙලින්ම Center එකත් සේව් වෙනවා
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