'use client'
import { useAnimeData } from "@/lib/hooks/use-anime-data";
import { useEffect } from "react";

export default function AnimeDataPlayground() {
  const { animeData, isLoading, error } = useAnimeData('97986');

  useEffect(() => {
    console.log('=== ANIME DATA DEBUG ===');
    console.log('animeData:', animeData);
    console.log('isLoading:', isLoading);
    console.log('error:', error);
  }, [animeData, isLoading, error]);

  if (isLoading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h2 className="text-xl font-bold text-blue-800 mb-2">🔄 Loading...</h2>
          <div className="space-y-2">
            <div className="animate-pulse bg-blue-200 h-4 rounded"></div>
            <div className="animate-pulse bg-blue-200 h-4 rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-xl font-bold text-red-800 mb-2">❌ Error</h2>
          <pre className="text-red-700 text-sm bg-red-100 p-3 rounded overflow-auto">
            {JSON.stringify(error, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          🎌 Anime Data Playground
        </h1>
        <p className="text-gray-600">Testing anime data fetching and caching</p>
      </div>

      {/* Debug Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-3">🐛 Debug Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Loading:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                isLoading 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {isLoading ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Has Cache:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                debug?.hasCache 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {debug?.hasCache ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">Static Loading:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                debug?.isStaticLoading 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {debug?.isStaticLoading ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Dynamic Loading:</span>
              <span className={`px-2 py-1 rounded text-sm ${
                debug?.isDynamicLoading 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {debug?.isDynamicLoading ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Anime Data Display */}
      {animeData && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
          {/* Banner */}
          {animeData.bannerImage && (
            <div className="h-48 relative overflow-hidden">
              <img 
                src={animeData.bannerImage} 
                alt="Banner"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            </div>
          )}
          
          <div className="p-6">
            <div className="flex gap-6">
              {/* Cover Image */}
              {animeData.coverImage?.large && (
                <div className="flex-shrink-0">
                  <img 
                    src={animeData.coverImage.large} 
                    alt="Cover"
                    className="w-32 h-48 object-cover rounded-lg shadow-md"
                  />
                </div>
              )}
              
              {/* Content */}
              <div className="flex-1 space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {animeData.title?.english || animeData.title?.romaji}
                  </h2>
                  {animeData.title?.english && animeData.title?.romaji && (
                    <p className="text-gray-600 mt-1">{animeData.title.romaji}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <p className={`font-medium ${
                      animeData.status === 'FINISHED' ? 'text-green-600' :
                      animeData.status === 'RELEASING' ? 'text-blue-600' :
                      'text-gray-600'
                    }`}>
                      {animeData.status}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Episodes:</span>
                    <p className="font-medium">{animeData.episodes || 'TBA'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Format:</span>
                    <p className="font-medium">{animeData.format}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Season:</span>
                    <p className="font-medium">
                      {animeData.season} {animeData.seasonYear}
                    </p>
                  </div>
                </div>

                {animeData.genres && (
                  <div>
                    <span className="font-medium text-gray-600">Genres:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {animeData.genres.map((genre, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {animeData.description && (
                  <div>
                    <span className="font-medium text-gray-600">Description:</span>
                    <div 
                      className="text-gray-700 mt-1 text-sm leading-relaxed max-h-32 overflow-y-auto"
                      dangerouslySetInnerHTML={{ 
                        __html: animeData.description.replace(/<br><br>/g, '<br>') 
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Raw Data (Collapsible) */}
      <details className="bg-gray-50 border border-gray-200 rounded-lg">
        <summary className="p-4 cursor-pointer font-medium text-gray-700 hover:bg-gray-100">
          📋 Raw Data (Click to expand)
        </summary>
        <div className="p-4 border-t border-gray-200">
          <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-96">
            {JSON.stringify(animeData, null, 2)}
          </pre>
        </div>
      </details>

      {/* Debug Raw Data */}
      <details className="bg-gray-50 border border-gray-200 rounded-lg">
        <summary className="p-4 cursor-pointer font-medium text-gray-700 hover:bg-gray-100">
          🔧 Debug Raw Data (Click to expand)
        </summary>
        <div className="p-4 border-t border-gray-200">
          <pre className="text-xs bg-white p-4 rounded border overflow-auto max-h-96">
            {JSON.stringify(debug, null, 2)}
          </pre>
        </div>
      </details>
    </div>
  );
}