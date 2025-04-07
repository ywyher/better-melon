export const invokeAnkiConnect = async (action: string, version: number, params = {}) => {
    try {
        const response = await fetch(process.env.NEXT_PUBLIC_ANKI_CONNECT || "", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, version, params }),
        })
        
        const data = await response.json()
        
        if (Object.keys(data).length !== 2) {
        throw new Error('Response has an unexpected number of fields')
        }
        
        if (!('error' in data)) {
        throw new Error('Response is missing required error field')
        }
        
        if (!('result' in data)) {
        throw new Error('Response is missing required result field')
        }
        
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
            error,
        }
    }
}