import ky from 'ky';
import { env } from '@/lib/env/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const rawFile = formData.get('file') as File;

    const file = new File([rawFile], encodeURIComponent(rawFile.name), {
      type: rawFile.type,
      lastModified: rawFile.lastModified
    });

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const catboxFormData = new FormData();
    catboxFormData.append('reqtype', 'fileupload');
    catboxFormData.append('userhash', env.CATBOX_USER_HASH|| '');
    catboxFormData.append('fileToUpload', file);

    const url = await ky.post(env.CATBOX_URL, {
      body: catboxFormData,
    }).text();

    return NextResponse.json({ 
      success: true, 
      url,
      error: null
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed',
        url: null 
      },
      { status: 500 }
    );
  }
}