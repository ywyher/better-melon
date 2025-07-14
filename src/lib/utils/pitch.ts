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
export function getPitchAccent({ position, reading }: { reading: string, position: number }) {
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

export function generatePitchAccentHTML({ kana, accent }: { kana: string, accent: string }): string {
  const mora = kana.split('');
  
  const getMoraClasses = (index: number, accent: string) => {
    const classes = ['mora'];
    
    switch (accent) {
      case 'heiban':
        if (index === 0) {
          classes.push('low');
        } else {
          classes.push('high');
        }
        break;
        
      case 'atamadaka':
        if (index === 0) {
          classes.push('high', 'drop');
        } else {
          classes.push('low');
        }
        break;
        
      case 'nakadaka':
        const dropPosition = Math.floor(mora.length / 2) + 1;
        if (index === 0) {
          classes.push('low');
        } else if (index < dropPosition - 1) {
          classes.push('high');
        } else if (index === dropPosition - 1) {
          classes.push('high', 'drop');
        } else {
          classes.push('low');
        }
        break;
        
      case 'odaka':
        if (index === 0) {
          classes.push('low');
        } else if (index === mora.length - 1) {
          classes.push('high', 'drop');
        } else {
          classes.push('high');
        }
        break;
    }
    
    return classes.join(' ');
  };

  const moralements = mora.map((mora, index) => 
    `<span class="${getMoraClasses(index, accent)}">${mora}</span>`
  ).join('');

  const styles = `
    <style>
      .pitch-accent {
        display: inline-flex;
        align-items: flex-end;
        font-family: 'Noto Sans JP', sans-serif;
        font-size: 18px;
        line-height: 1;
        margin: 4px;
      }
      
      .mora {
        padding: 2px 4px;
        position: relative;
        min-width: 20px;
        text-align: center;
        height: 30px;
        display: flex;
        align-items: flex-end;
        justify-content: center;
      }
      
      .mora.high {
        border-top: .15rem solid #666;
      }
      
      .mora.low {
        border-bottom: .15rem solid #666;
      }
      
      .mora.drop {
        border-right: .15rem solid #666;
      }
      
      .heiban { color: #2563eb; }
      .atamadaka { color: #dc2626; }
      .nakadaka { color: #ea580c; }
      .odaka { color: #16a34a; }
    </style>
  `;

  return `${styles}<div class="pitch-accent ${accent}">${moralements}</div>`;
}