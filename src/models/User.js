import mongoose from 'mongoose';

// ළමයෙකුගේ දත්ත ගබඩා විය යුතු ආකාරය (Schema)
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'කරුණාකර ඔබගේ නම ඇතුලත් කරන්න'],
    },
    email: {
      type: String,
      required: [true, 'කරුණාකර ඔබගේ ඊමේල් ලිපිනය ඇතුලත් කරන්න'],
      unique: true, // එකම ඊමේල් එකෙන් දෙන්නෙකුට ලියාපදිංචි විය නොහැක
    },
    password: {
      type: String,
      required: [true, 'කරුණාකර මුරපදයක් ඇතුලත් කරන්න'],
    },
    role: {
      type: String,
      default: 'student', // සාමාන්‍යයෙන් ලියාපදිංචි වන කෙනෙක් student ලෙස සැලකේ
    },
  },
  { 
    timestamps: true // ගිණුම සෑදූ දිනය සහ වෙලාව (createdAt) ස්වයංක්‍රීයව සටහන් වීමට
  } 
);

// Next.js හිදී (hot-reloading නිසා) model එක දෙවරක් සෑදීම වැළැක්වීමට මෙම කේතය භාවිතා කරයි
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;