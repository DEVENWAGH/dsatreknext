import { NextResponse } from 'next/server';

import { uploadToS3 } from '@/lib/cloudinary';
import { auth } from '@/auth';

export async function POST(request) {
  console.log('upload POST called with:', {
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
    method: request.method,
  });

  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');

    console.log(
      'File received:',
      file ? { name: file.name, size: file.size, type: file.type } : 'No file'
    );

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const { url } = await uploadToS3(buffer, file.name, file.type, 'community');

    console.log('Upload successful:', url);

    return NextResponse.json({
      success: true,
      url,
      name: file.name,
      size: file.size,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
