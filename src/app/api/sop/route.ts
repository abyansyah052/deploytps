import { NextResponse } from 'next/server';

// Type for single SOP content
interface SopContent {
  id: number;
  title: string;
  content: string;
  updatedAt: string;
}

// In-memory storage for single SOP content
// In production, this would be replaced with database operations
let sopContent: SopContent = {
  id: 1,
  title: 'SOP/Pemberitahuan',
  content: `<h2>Protokol Keselamatan Kerja</h2>
<p>Selalu gunakan APD lengkap saat bekerja di area operasional:</p>
<ul>
<li>Helm safety</li>
<li>Sepatu safety</li>
<li>Rompi safety</li>
<li>Sarung tangan kerja</li>
</ul>
<p>Pastikan untuk melakukan inspeksi peralatan sebelum digunakan.</p>

<h2>Pemberitahuan Maintenance Sistem</h2>
<p>Maintenance sistem akan dilakukan pada hari Minggu, 25 Februari 2024 pukul 02:00 - 06:00 WIB.</p>
<p>Selama periode ini, sistem mungkin tidak dapat diakses. Mohon untuk menyimpan pekerjaan Anda sebelum waktu maintenance.</p>

<h2>Prosedur Pelaporan Incident</h2>
<p>Jika terjadi incident di tempat kerja:</p>
<ol>
<li>Pastikan keselamatan diri dan rekan kerja</li>
<li>Laporkan segera ke supervisor</li>
<li>Isi form incident report</li>
<li>Dokumentasikan dengan foto jika memungkinkan</li>
<li>Ikuti instruksi tim safety</li>
</ol>`,
  updatedAt: '2024-02-20T08:00:00.000Z'
};

export async function GET() {
  try {
    return NextResponse.json(sopContent);
  } catch (error) {
    console.error('Error fetching SOP content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch SOP content' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      );
    }

    // Update the single SOP content
    sopContent = {
      id: sopContent.id,
      title: body.title,
      content: body.content,
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(sopContent);
  } catch (error) {
    console.error('Error updating SOP content:', error);
    return NextResponse.json(
      { error: 'Failed to update SOP content' },
      { status: 500 }
    );
  }
}
