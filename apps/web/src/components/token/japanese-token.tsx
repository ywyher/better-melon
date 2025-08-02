import React, { memo, useMemo } from 'react';
import { Ruby as TRuby, SubtitleToken } from '@/types/subtitle';
import Ruby from '@/components/ruby';
import { parseRuby } from '@/lib/utils/subtitle';
import { useSettingsStore } from '@/lib/stores/settings-store';
import { TokenStyles } from '@/lib/hooks/use-token-styles';

interface JapaneseTokenProps {
  token: SubtitleToken;
  styles: TokenStyles;
  onTokenClick: () => void;
  onTokenMouseEnter: () => void;
  onTokenMouseLeave: () => void;
}

const rubyPairsCache = new Map<string, TRuby[]>();

const getCachedRubyPairs = (surfaceForm: string): TRuby[] => {
  if (!rubyPairsCache.has(surfaceForm)) {
    rubyPairsCache.set(surfaceForm, parseRuby(surfaceForm, true));
  }
  return rubyPairsCache.get(surfaceForm)!;
};

export const JapaneseToken = memo<JapaneseTokenProps>(({
  token,
  styles,
  onTokenClick,
  onTokenMouseEnter,
  onTokenMouseLeave,
}) => {
  const showFurigana = useSettingsStore((settings) => settings.subtitle.showFurigana);
  const rubyPairs = useMemo(() => getCachedRubyPairs(token.surface_form), [token.surface_form]);

  return (
    <div
      className='flex flex-row gap-0 items-end cursor-pointer'
      onClick={onTokenClick}
      onMouseEnter={onTokenMouseEnter}
      onMouseLeave={onTokenMouseLeave}
    >
      {rubyPairs.map((pair, pairIdx) => {
        const { kanji, furigana } = pair;
        return (
          <Ruby
            key={`${token.id}-${pairIdx}`}

            kanji={kanji}
            furigana={furigana || ""}
            
            showFurigana={showFurigana}
            
            kanjiStyles={{
              text: styles.token,
              container: {
                ...styles.container,
                ...styles.learningStatus
              }
            }}
            furiganaStyles={{
              text: {
                ...styles.furigana?.token
              },
              container: {
                ...styles.furigana?.container
              },
            }}
          />
        );
      })}
    </div>
  );
});