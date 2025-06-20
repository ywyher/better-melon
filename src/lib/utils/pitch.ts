// Function to count mora in a Japanese reading
export function countMora(reading: string) {
    // Remove common punctuation and normalize
    const normalized = reading.replace(/[・]/g, '');
    
    let moraCount = 0;
    let i = 0;
    
    while (i < normalized.length) {
        const char = normalized[i];
        
        // Check for small tsu (っ/ッ)
        if (char === 'っ' || char === 'ッ') {
            moraCount++;
            i++;
            continue;
        }
        
        // Check for long vowel marks (ー)
        if (char === 'ー') {
            moraCount++;
            i++;
            continue;
        }
        
        // Check for 'n' sound (ん/ン)
        if (char === 'ん' || char === 'ン') {
            moraCount++;
            i++;
            continue;
        }
        
        // Check for combination characters (きゃ, しゅ, etc.)
        if (i + 1 < normalized.length) {
            const nextChar = normalized[i + 1];
            // Check if next character is small ya, yu, yo
            if (['ゃ', 'ゅ', 'ょ', 'ャ', 'ュ', 'ョ'].includes(nextChar)) {
                moraCount++; // Counts as one mora
                i += 2;
                continue;
            }
        }
        
        // Regular character
        moraCount++;
        i++;
    }
    
    return moraCount;
}

// Function to determine pitch accent type
export function getPitchAccentType({ position, reading }: { reading: string, position: number }) {
    const moraCount = countMora(reading);
    
    if (position === 0) {
        return 'heiban'; // 平板 - no pitch drop
    } else if (position === 1) {
        return 'atamadaka'; // 頭高 - drops after first mora
    } else if (position === moraCount) {
        return 'odaka'; // 尾高 - drops after final mora
    } else {
        return 'nakadaka'; // 中高 - drops somewhere in the middle
    }
}