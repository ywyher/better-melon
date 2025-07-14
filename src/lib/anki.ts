'use client'
import { env } from "@/lib/env/client";

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