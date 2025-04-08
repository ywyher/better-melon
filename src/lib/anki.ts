'use server'

// utils/ankiConnect.ts
export const invokeAnkiConnect = async (action: string, version: number, params = {}) => {
    try {
      const response = await fetch(`${process.env.APP_URL}/api/anki`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, version, params }),
      });
      
      const result = await response.json();
      
      return {
        data: result.data,
        error: result.error,
      };
    } catch (error) {
      console.error('Error connecting to Anki API route:', error);
      return {
        data: null,
        error: error || "Make sure to follow the instrucitons at on the settings page",
      };
    }
  };