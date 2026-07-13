import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  youtubeId: { type: String, required: true },
  category: { type: String, required: true },
  alYear: { type: String, required: true }, 
  isVisible: { type: Boolean, default: true }, // අලුතින් එකතු කළා (ළමයින්ට පේනවද නැද්ද යන්න)
  date: { type: Date, default: Date.now }
});

const Video = mongoose.models.Video || mongoose.model('Video', VideoSchema);

export async function POST(req) {
  try {
    const { title, url, category, alYear } = await req.json();
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
    const newVideo = new Video({ title, youtubeId, category, alYear: finalYear });
    await newVideo.save();

    return NextResponse.json({ message: 'වීඩියෝව සාර්ථකව එකතු කරන ලදී! ✅' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') || 'All';
    const isAdmin = searchParams.get('admin'); // Admin කෙනෙක්ද කියලා බලනවා
    
    await connectToDatabase();
    
    let query = {};
    if (year !== 'All') {
      query.$or = [{ alYear: year }, { alYear: 'All' }];
    }
    
    // Admin නෙවෙයි නම් (ළමයෙක් නම්), පෙන්වන්නේ Hide කරපු නැති ඒවා විතරයි!
    if (isAdmin !== 'true') {
      query.isVisible = { $ne: false }; 
    }

    const videos = await Video.find(query).sort({ date: -1 });
    return NextResponse.json({ videos }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}

// අලුත් Function එක: Hide / Show කිරීම සඳහා
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