'use client'
import { defaultGeneralSettings } from "@/lib/constants/settings";
import { env } from "@/lib/env/client";
import { MediaPlayerInstance } from "@vidstack/react";


export const invokeAnkiConnect = async (action: string, version: number, params = {}) => {
  try {
    const response = await fetch(env.NEXT_PUBLIC_ANKI_CONNECT_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, version, params }),
    })
    
    const data = await response.json()
    
    if (data.error) {
      return {
        data: null,
        error: data.error
      }
    }
    
    return {
      data: data.result,
      error: null
    }
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Failed to connect to Anki'
    }
  }
}

export function takeSnapshot(player: MediaPlayerInstance, format: 'png' | 'jpeg' | 'webp' = defaultGeneralSettings.screenshotFormat, quality = 0.95) {
    const videoEl = player.el?.querySelector('video') as HTMLVideoElement;
    if (!videoEl) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    
    const mimeType = `image/${format}`;
    const dataURL = format === 'png' 
      ? canvas.toDataURL(mimeType)
      : canvas.toDataURL(mimeType, quality);


    return dataURL.split(',')[1];
}