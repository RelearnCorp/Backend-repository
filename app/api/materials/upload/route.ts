import { NextRequest } from 'next/server';
import { authenticateRequest } from '@/lib/auth/middleware';
import { createMaterial, createMaterialChunk } from '@/lib/database/queries';
import { sendSuccess, sendError } from '@/lib/utils/response-formatter';
import { getSupabaseServiceClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);

    // Only teachers can upload materials
    if (auth.rolePermissions?.upload_materials !== true) {
      return sendError('FORBIDDEN', 403);
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const classId = formData.get('class_id') as string;
    const title = formData.get('title') as string;

    if (!file || !classId || !title) {
      return sendError('VALIDATION_ERROR', 400);
    }

    // Determine file type
    const fileType = file.type.includes('pdf')
      ? 'pdf'
      : file.type.includes('image')
        ? 'image'
        : file.type.includes('video')
          ? 'video'
          : 'text';

    // Upload to Supabase Storage
    const supabase = getSupabaseServiceClient();
    const fileName = `${Date.now()}-${file.name}`;
    const bucket = 'materials';

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(`${classId}/${fileName}`, file);

    if (uploadError) {
      console.error('[API] Storage upload error:', uploadError);
      return sendError('UPLOAD_FAILED', 500);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(`${classId}/${fileName}`);

    const fileUrl = urlData?.publicUrl;

    // Note: PDF parsing will be handled in a separate processing job
    // For now, we skip content extraction during upload
    const content: string | null = null;

    // Create material record
    const material = await createMaterial(
      classId,
      title,
      content,
      fileUrl,
      fileType,
      auth.userId
    );

    return sendSuccess(
      {
        id: material.id,
        title: material.title,
        file_url: material.file_url,
        file_type: material.file_type,
        created_at: material.created_at,
      },
      'Material uploaded successfully',
      201
    );
  } catch (error: any) {
    console.error('[API] Upload material error:', error);
    return sendError('INTERNAL_SERVER_ERROR', 500);
  }
}
