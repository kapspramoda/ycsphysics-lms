import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

// 1. Database Schema යාවත්කාලීන කිරීම
const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  youtubeId: { type: String, required: true },
  videoType: { type: String, default: 'Lesson' }, // 🔴 අලුත්: Lesson ද Paper Discussion ද යන්න
  classTypes: { type: [String], default: ['Theory'] }, // 🔴 අලුත්: පන්ති කිහිපයක් සේව් වීමට
  alYears: { type: [String], default: ['2027'] }, // 🔴 අලුත්: වර්ෂ කිහිපයක් සේව් වීමට
  lessonName: { type: String, default: "" }, 
  tuteUrl: { type: String, default: "" },    
  isVisible: { type: Boolean, default: true }, 
  isPrivate: { type: Boolean, default: false },
  allowedStudents: { type: [String], default: [] },
  date: { type: Date, default: Date.now }
}, { strict: false }); // පරණ දත්ත සමග ගැටීම වැළැක්වීමට

// Database Cache ගැටලුව මඟහැරීමට පරණ Model එක ඉවත් කිරීම
if (mongoose.models.Video) {
  delete mongoose.models.Video;
}
const Video = mongoose.model('Video', VideoSchema);

// 2. අලුත් වීඩියෝවක් එක් කිරීම (POST)
export async function POST(req) {
  try {
    const { title, url, videoType, classTypes, alYears, lessonName, tuteUrl, isPrivate, allowedStudents } = await req.json();
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

    const newVideo = new Video({ 
      title, 
      youtubeId, 
      videoType: videoType || 'Lesson',
      classTypes: Array.isArray(classTypes) && classTypes.length > 0 ? classTypes : ['Theory'],
      alYears: Array.isArray(alYears) && alYears.length > 0 ? alYears : ['2027'],
      lessonName: lessonName || "",
      tuteUrl: tuteUrl || "",
      isPrivate: isPrivate || false,
      allowedStudents: Array.isArray(allowedStudents) ? allowedStudents : []
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
      // 🔴 අලුත්: Arrays ඇතුළේ අදාළ වර්ෂය තියෙනවද කියලා බලනවා
      query.alYears = year;
    }
    
    if (isAdmin !== 'true') {
      query.isVisible = { $ne: false }; 
    }

    const videos = await Video.find(query).sort({ date: -1 }).lean();
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

// 5. වීඩියෝවක් වෙනස් කිරීම (PUT)
export async function PUT(req) {
  try {
    const { id, title, url, videoType, classTypes, alYears, lessonName, tuteUrl, isPrivate, allowedStudents } = await req.json();
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
      videoType: videoType || 'Lesson',
      classTypes: Array.isArray(classTypes) && classTypes.length > 0 ? classTypes : ['Theory'],
      alYears: Array.isArray(alYears) && alYears.length > 0 ? alYears : ['2027'],
      lessonName: lessonName || "",
      tuteUrl: tuteUrl || "",
      isPrivate: isPrivate || false,
      allowedStudents: Array.isArray(allowedStudents) ? allowedStudents : []
    }, { new: true, strict: false });

    return NextResponse.json({ message: 'වීඩියෝව සාර්ථකව යාවත්කාලීන කරන ලදී! ✅' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}

// 6. වීඩියෝවක් සම්පූර්ණයෙන්ම මකා දැමීම (DELETE)
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