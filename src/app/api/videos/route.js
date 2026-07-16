import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

// 1. Database Schema යාවත්කාලීන කිරීම (lessonName සහ tuteUrl එකතු කර ඇත)
const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  youtubeId: { type: String, required: true },
  category: { type: String, required: true },
  alYear: { type: String, required: true }, 
  lessonName: { type: String, default: "" }, // අලුතින් එකතු කළා
  tuteUrl: { type: String, default: "" },    // අලුතින් එකතු කළා
  isVisible: { type: Boolean, default: true }, 
  date: { type: Date, default: Date.now }
});

const Video = mongoose.models.Video || mongoose.model('Video', VideoSchema);

// 2. අලුත් වීඩියෝවක් එක් කිරීම (POST)
export async function POST(req) {
  try {
    const { title, url, category, alYear, lessonName, tuteUrl } = await req.json();
    await connectToDatabase();

    let youtubeId = null;
    try {
      if (url.includes('watch?v=')) youtubeId = url.split('watch?v=')[1].split('&')[0];
      else if (url.includes('youtu.be/')) youtubeId = url.split('youtu.be/')[1].split('?')[0];
      else if (url.includes('/live/')) youtubeId = url.split('/live/')[1].split('?')[0];
      else if (url.includes('/shorts/')) youtubeId = url.split('/shorts/')[1].split('?')[0];
    } catch (e) { youtubeId = null; }

    if (!youtubeId || youtubeId.length !== 11) {
      return NextResponse.json({ message: 'කරුණාකර නිවැරදි YouTube ලින්ක් එකක් ලබා දෙන්න.' }, { status: 400 });
    }

    const finalYear = alYear || 'All';
    const newVideo = new Video({ 
      title, 
      youtubeId, 
      category, 
      alYear: finalYear,
      lessonName: lessonName || "",
      tuteUrl: tuteUrl || ""
    });
    
    await newVideo.save();

    return NextResponse.json({ message: 'වීඩියෝව සාර්ථකව එකතු කරන ලදී! ✅' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}

// 3. වීඩියෝ ලැයිස්තුව ලබා ගැනීම (GET)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') || 'All';
    const isAdmin = searchParams.get('admin'); 
    
    await connectToDatabase();
    
    let query = {};
    if (year !== 'All') {
      query.$or = [{ alYear: year }, { alYear: 'All' }];
    }
    
    if (isAdmin !== 'true') {
      query.isVisible = { $ne: false }; 
    }

    const videos = await Video.find(query).sort({ date: -1 });
    return NextResponse.json({ videos }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}

// 4. Hide / Show කිරීම සඳහා (PATCH)
export async function PATCH(req) {
  try {
    const { id, isVisible } = await req.json();
    await connectToDatabase();
    
    await Video.findByIdAndUpdate(id, { isVisible });
    return NextResponse.json({ message: 'සාර්ථකව යාවත්කාලීන විය.' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}

// 5. අලුතින් එක්කළා - වීඩියෝවක් වෙනස් කිරීම (PUT)
export async function PUT(req) {
  try {
    const { id, title, url, category, alYear, lessonName, tuteUrl } = await req.json();
    await connectToDatabase();

    let youtubeId = null;
    try {
      if (url.includes('watch?v=')) youtubeId = url.split('watch?v=')[1].split('&')[0];
      else if (url.includes('youtu.be/')) youtubeId = url.split('youtu.be/')[1].split('?')[0];
      else if (url.includes('/live/')) youtubeId = url.split('/live/')[1].split('?')[0];
      else if (url.includes('/shorts/')) youtubeId = url.split('/shorts/')[1].split('?')[0];
    } catch (e) { youtubeId = null; }

    if (!youtubeId || youtubeId.length !== 11) {
      return NextResponse.json({ message: 'කරුණාකර නිවැරදි YouTube ලින්ක් එකක් ලබා දෙන්න.' }, { status: 400 });
    }

    await Video.findByIdAndUpdate(id, {
      title,
      youtubeId,
      category,
      alYear,
      lessonName: lessonName || "",
      tuteUrl: tuteUrl || ""
    });

    return NextResponse.json({ message: 'වීඩියෝව සාර්ථකව යාවත්කාලීන කරන ලදී! ✅' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}

// 6. අලුතින් එක්කළා - වීඩියෝවක් සම්පූර්ණයෙන්ම මකා දැමීම (DELETE)
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ message: 'මකා දැමීමට අදාළ වීඩියෝ ID එකක් නොමැත.' }, { status: 400 });
    }

    await connectToDatabase();
    await Video.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'වීඩියෝව සාර්ථකව මකා දමන ලදී! 🗑️' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}