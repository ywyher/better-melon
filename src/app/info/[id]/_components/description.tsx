// AnimeDescription.tsx
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp } from "lucide-react"
import { Anime } from "@/types/anime"

type AnimeDescriptionProps = {
    title: Anime['title']
    description: Anime['description']
}

export function AnimeDescription({ title, description }: AnimeDescriptionProps) {
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false)
    
    // Truncate description for collapsed view
    const truncatedDescription = description 
        ? description.substring(0, 150) + (description.length > 150 ? '...' : '')
        : '';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-bold">
                    {title?.english || ""}
                </CardTitle>
                {title?.english && title?.english !== title?.english && (
                    <p className="text-lg text-muted-foreground">{title.english}</p>
                )}
            </CardHeader>
            <CardContent>
                {description && (
                    <div className="mb-2">
                        <div 
                            className="text-muted-foreground"
                            dangerouslySetInnerHTML={{ 
                                __html: isDescriptionExpanded ? description : truncatedDescription 
                            }}
                        />
                        {description.length > 150 && (
                            <Button
                                variant="ghost"
                                size="sm"
                                className="flex items-center mt-2 text-muted-foreground hover:text-foreground"
                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            >
                                {isDescriptionExpanded ? (
                                    <>
                                        <span>Show Less</span>
                                        <ChevronUp size={16} className="ml-1" />
                                    </>
                                ) : (
                                    <>
                                        <span>Read More</span>
                                        <ChevronDown size={16} className="ml-1" />
                                    </>
                                )}
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}