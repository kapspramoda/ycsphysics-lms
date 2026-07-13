import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    // මෙතන ඔයාගේ නියම Admin ඊමේල් එක සහ පාස්වර්ඩ් එක දෙන්න
    // (පසුව මේවා .env ෆයිල් එකකට දාන්න පුළුවන්)
    const ADMIN_EMAIL = "admin@pramodachemistry.com";
    const ADMIN_PASSWORD = "admin12345"; // ඔයාට කැමති රහස් පදයක් දෙන්න

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      // ලොග් වීම සාර්ථක නම්
      return NextResponse.json({ message: 'සාර්ථකව ඇතුළු විය.', isAdmin: true }, { status: 200 });
    } else {
      // ඊමේල් හෝ මුරපදය වැරදි නම්
      return NextResponse.json({ message: 'ඊමේල් ලිපිනය හෝ මුරපදය වැරදියි!' }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ message: 'දෝෂයක් මතු විය.' }, { status: 500 });
  }
}