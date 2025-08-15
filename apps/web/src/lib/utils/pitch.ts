export function countMora(reading: string) {
    const normalized = reading
        .normalize("NFC") // Unicode normalization
        .replace(/[・、。！？　]/g, ''); // remove punctuation + fullwidth space

    let moraCount = 0;
    let i = 0;

    while (i < normalized.length) {
        const char = normalized[i];

        // Sokuon (small tsu)
        if (char === 'っ' || char === 'ッ') {
            moraCount++;
            i++;
            continue;
        }

        // Long vowel mark
        if (char === 'ー') {
            moraCount++;
            i++;
            continue;
        }

        // Moraic nasal
        if (char === 'ん' || char === 'ン') {
            moraCount++;
            i++;
            continue;
        }

        // Yōon (small ya/yu/yo)
        if (i + 1 < normalized.length) {
            const nextChar = normalized[i + 1];
            if (['ゃ', 'ゅ', 'ょ', 'ャ', 'ュ', 'ョ'].includes(nextChar)) {
                moraCount++;
                i += 2;
                continue;
            }
        }

        // Regular kana (includes standalone small vowels)
        moraCount++;
        i++;
    }

    return moraCount;
}

export function getPitchAccent({ position, reading }: { reading: string, position: number }) {
    const moraCount = countMora(reading);

    if (position === 0) {
        return 'heiban';
    } else if (position === 1) {
        return 'atamadaka';
    } else if (position === moraCount) {
        return 'odaka';
    } else {
        return 'nakadaka';
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