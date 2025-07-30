import MultipleSelector from "@/components/multiple-selector";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { animeGenres } from "@/lib/constants/anime";
import FilterField from "@/components/filters/filed";

export default function GenresFilter() {
    const [genres, setGenres] = useQueryState('genres', parseAsArrayOf(parseAsString))

    return (
        <FilterField label="Genres">
            <MultipleSelector 
                options={animeGenres.map((genre) => {
                    return {
                        value: genre,
                        label: genre.charAt(0).toUpperCase() + genre.slice(1)
                    }
                })}
                placeholder="Select Genres"
                onChange={(selections) => {
                    const selectedValues = selections.map((selection) => selection.value);
                    setGenres(selectedValues ? selectedValues : null);
                }}
                value={genres?.map((genre) => {
                    return {
                        value: genre,
                        label: genre.charAt(0).toUpperCase() + genre.slice(1)
                    }
                }) || []}
            />
        </FilterField>
    );
}