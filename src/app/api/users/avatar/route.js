import { NextResponse } from 'next/server';

import { auth } from '@/auth';
import { db } from '@/lib/db';
import { User } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { uploadToS3 } from '@/lib/cloudinary';

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('avatar');

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file provided' },
        { status: 400 }
      );
    }

    // Upload to Cloudinary using utility function
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = `${session.user.id}-${Date.now()}.${file.name.split('.').pop()}`;

    const { url: avatarUrl } = await uploadToS3(
      buffer,
      fileName,
      file.type,
      'avatars'
    );

    // Update user profile picture in database
    await db
      .update(User)
      .set({ profilePicture: avatarUrl })
      .where(eq(User.id, session.user.id));

    return NextResponse.json({
      success: true,
      data: { avatar: avatarUrl, profilePicture: avatarUrl },
      message: 'Profile image updated successfully',
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload avatar' },
      { status: 500 }
    );
  }
}
