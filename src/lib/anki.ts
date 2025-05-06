'use client'
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

export function takeSnapshot(player: MediaPlayerInstance) {
    const videoEl = player.el?.querySelector('video') as HTMLVideoElement;
    if (!videoEl) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    const dataURL = canvas.toDataURL('image/png');

    // Extract the base64 data (remove the "data:image/png;base64," part)
    return dataURL.split(',')[1];
}