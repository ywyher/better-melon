'use server'

import { env } from "@/lib/env/server";
import ky from "ky";

export async function uploadFile(file: File) {
  try {
    if (!file) {
      return{ error: 'No file provided' }
    }

    const catboxFormData = new FormData();
    catboxFormData.append('reqtype', 'fileupload');
    catboxFormData.append('userhash', env.CATBOX_USER_HASH|| '');
    catboxFormData.append('fileToUpload', file);

    const url = await ky.post(env.CATBOX_URL, {
      body: catboxFormData
    }).text();

    return { 
      success: true, 
      url,
      error: null
    };
  } catch (error) {
    console.error('Upload error:', error);
    return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed',
        url: null 
    }
  }
}