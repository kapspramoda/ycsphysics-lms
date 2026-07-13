// import { NextResponse } from 'next/server';
// import connectToDatabase from '@/lib/mongodb';
// import mongoose from 'mongoose';
// import bcrypt from 'bcryptjs';

// // User Model (email field එකත් තියෙනවා)
// const UserSchema = new mongoose.Schema({
//   name: String,
//   username: { type: String, unique: true },
//   email: { type: String, unique: true }, // පරණ දත්ත නිසා මේක මෙහෙමම තියෙන්න ඕනේ
//   password: String,
//   alYear: String
// });

// const User = mongoose.models.User || mongoose.model('User', UserSchema);

// export async function GET() {
//   try {
//     await connectToDatabase();

//     const students = [
//       { name: "Sithmi Oshadhi", username: "0771969400" },
//       { name: "Umasha Nduwari", username: "0778393239" },
//       { name: "Devni Jyasinghe", username: "0785539772" },
//       { name: "Chamudi Methshani", username: "0740610038" },
//       { name: "Janeeha Gagani", username: "0778136350" },
//       { name: "Chathumi Amanda", username: "0763951005" },
//       { name: "Nethumi Gihansa", username: "0762416135" },
//       { name: "Pahandi Madaa", username: "0756614475" },
//       { name: "Anjana Pramod", username: "0769172504" },
//       { name: "Kaveesha Kulathilaka", username: "0769808526" },
//       { name: "Ravindu Achintha", username: "0758953667" }
//     ];

//     const defaultPassword = "Chem@2028";
//     const hashedPassword = await bcrypt.hash(defaultPassword, 10);
//     const alYear = "2028"; 

//     let addedCount = 0;
//     let existingCount = 0;

//     for (const student of students) {
//       const exists = await User.findOne({ username: student.username });
      
//       if (!exists) {
//         await User.create({
//           name: student.name,
//           username: student.username,
//           // Duplicate Error එක නොඑන්න බොරු ඊමේල් එකක් හැදීම
//           email: `${student.username}@student.com`, 
//           password: hashedPassword,
//           alYear: alYear
//         });
//         addedCount++;
//       } else {
//         existingCount++;
//       }
//     }

//     return NextResponse.json({ 
//       message: "සාර්ථකයි! ළමුන් Database එකට ඇතුළත් කරන ලදී.", 
//       added: addedCount, 
//       alreadyExists: existingCount 
//     });

//   } catch (error) {
//     console.error("Database Error:", error);
//     return NextResponse.json({ error: error.message }, { status: 500 });
//   }
// }