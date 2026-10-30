import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

const TuteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  pdfUrl: { type: String, required: true },
  category: { type: String, required: true }, 
  
  // 🔴 අලුතින් එක් කළ Fields
  classTypes: { type: [String], default: [] },
  alYears: { type: [String], default: [] },
  isPrivate: { type: Boolean, default: false },
  allowedStudents: { type: [String], default: [] },
  
  isVisible: { type: Boolean, default: true }, 
  date: { type: Date, default: Date.now }
}, { strict: false });

// 🔴 Model Cache දෝෂය මඟහැරීමට
if (mongoose.models.Tute) {
  delete mongoose.models.Tute;
}
const Tute = mongoose.model('Tute', TuteSchema);

// අලුත් නිබන්ධනයක් එක් කිරීම (POST)
export async function POST(req) {
  try {
    const body = await req.json();
    // 🔴 Frontend එකෙන් එවන අලුත් දත්ත සියල්ල ලබා ගැනීම
    const { title, pdfUrl, category, classTypes, alYears, isPrivate, allowedStudents } = body;
    
    await connectToDatabase();
    
    const newTute = new Tute({ 
      title, 
      pdfUrl, 
      category, 
      classTypes: Array.isArray(classTypes) ? classTypes : [],
      alYears: Array.isArray(alYears) ? alYears : [],
      isPrivate: isPrivate || false,
      allowedStudents: Array.isArray(allowedStudents) ? allowedStudents : []
    });
    
    await newTute.save();
    return NextResponse.json({ message: 'නිබන්ධනය සාර්ථකව එක් කළා!' }, { status: 200 });
  } catch (error) { 
    console.error("Tute POST Error:", error);
    return NextResponse.json({ message: 'දෝෂයකි.' }, { status: 500 }); 
  }
}

// නිබන්ධන ලබා ගැනීම (GET)
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const year = searchParams.get('year') || 'All';
    const isAdmin = searchParams.get('admin');
    await connectToDatabase();
    
    let query = {};
    if (year !== 'All') {
      // 🔴 Array එක තුළ අදාළ වර්ෂය තිබේදැයි පරීක්ෂා කිරීම
      query.alYears = year; 
    }
    
    if (isAdmin !== 'true') { 
      query.isVisible = { $ne: false }; 
    }

    // 🔴 .lean() මඟින් සැබෑ දත්ත ලබා ගැනීම
    const tutes = await Tute.find(query).sort({ date: -1 }).lean();
    return NextResponse.json({ tutes }, { status: 200 });
  } catch (error) { 
    console.error("Tute GET Error:", error);
    return NextResponse.json({ message: 'දෝෂයකි.' }, { status: 500 }); 
  }
}

// Hide / Show කිරීම (PATCH)
export async function PATCH(req) { 
  try {
    const { id, isVisible } = await req.json();
    await connectToDatabase();
    await Tute.findByIdAndUpdate(id, { $set: { isVisible } });
    return NextResponse.json({ message: 'යාවත්කාලීන විය.' });
  } catch (error) { 
    return NextResponse.json({ message: 'දෝෂයකි.' }, { status: 500 }); 
  }
}

// මකා දැමීම (DELETE)
export async function DELETE(req) { 
  try {
    const { id } = await req.json();
    await connectToDatabase();
    await Tute.findByIdAndDelete(id);
    return NextResponse.json({ message: 'සාර්ථකව මකා දැමුවා.' });
  } catch (error) { 
    return NextResponse.json({ message: 'දෝෂයකි.' }, { status: 500 }); 
  }
}

// නිබන්ධනයක් යාවත්කාලීන කිරීම (Edit Tute - PUT)
export async function PUT(request) {
  try {
    await connectToDatabase(); 

    const body = await request.json();
    const { id, title, pdfUrl, category, classTypes, alYears, isPrivate, allowedStudents } = body;

    const updateData = { 
      title, 
      pdfUrl, 
      category, 
      classTypes: Array.isArray(classTypes) ? classTypes : [],
      alYears: Array.isArray(alYears) ? alYears : [],
      isPrivate: isPrivate || false,
      allowedStudents: Array.isArray(allowedStudents) ? allowedStudents : []
    };

    const updatedTute = await mongoose.models.Tute.findByIdAndUpdate(id, { $set: updateData }, { new: true, strict: false });

    if (!updatedTute) {
      return NextResponse.json({ message: "නිබන්ධනය සොයාගැනීමට නොහැක." }, { status: 404 });
    }

    return NextResponse.json({ message: "සාර්ථකව යාවත්කාලීන විය." }, { status: 200 });

  } catch (error) {
    console.error("Tute PUT Error:", error);
    return NextResponse.json({ message: "දෝෂයකි." }, { status: 500 });
  }
}