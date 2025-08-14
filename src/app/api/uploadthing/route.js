import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();

    if (body.files) {
      const uploadResults = await Promise.all(
        body.files.map(async file => {
          // Create form data for actual upload
          const formData = new FormData();
          const blob = new Blob([file], { type: file.type });
          formData.append('file', blob, file.name);

          // Upload to our S3 endpoint
          const uploadResponse = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          const uploadResult = await uploadResponse.json();

          return {
            key: `community/${Date.now()}-${file.name}`,
            name: file.name,
            size: file.size,
            type: file.type,
            url: uploadResult.url,
          };
        })
      );

      return NextResponse.json({ data: uploadResults });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

export async function GET(request) {
  console.log('uploadthing GET called with:', request.url);
  return NextResponse.json(
    { error: 'Use /api/upload instead' },
    { status: 400 }
  );
}
