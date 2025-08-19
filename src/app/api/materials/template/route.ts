import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Path to the existing template file
    const templatePath = join(process.cwd(), 'docs', 'TPS Dashboard Materials Template.xlsx');
    
    // Read the existing template file
    const fileBuffer = readFileSync(templatePath);

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': 'attachment; filename="TPS_Dashboard_Materials_Template.xlsx"',
        'Content-Length': fileBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Template download error:', error);
    return NextResponse.json({ error: 'Failed to download template' }, { status: 500 });
  }
}
