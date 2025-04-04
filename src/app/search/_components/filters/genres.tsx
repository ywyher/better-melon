import { Indicator } from "@/components/indicator";
import MultipleSelector from "@/components/multiple-selector";
import { gql, useQuery } from "@apollo/client";
import { Dispatch, SetStateAction, useEffect } from "react";
import InputSkeleton from "@/components/input-skeleton";

const GET_GENRES = gql`
    query {
        GenreCollection
    }
`;

type GenreQueryProps = {
    GenreCollection: string[]
}

export default function GenresFilter({
    queryGenres,
    genres,
    setGenres
}: {
    queryGenres: string[] | null
    genres: string[] | null,
    setGenres: Dispatch<SetStateAction<string[] | null>>
}) {
    const { data, loading, error } = useQuery<GenreQueryProps>(GET_GENRES);

    useEffect(() => {
        if(queryGenres?.length) {
            setGenres(queryGenres)
        }
    }, [queryGenres, setGenres])

    if(error)
        return (
            <Indicator message={error.message} type="error" />
        );

    if(loading)
        return (
            <InputSkeleton />
        )

    return (
        <div className="w-full">
            {data && (
                <MultipleSelector 
                    loadingIndicator={loading}
                    options={data.GenreCollection.map((genre) => {
                        return {
                            value: genre,
                            label: genre.charAt(0).toUpperCase() + genre.slice(1)
                        }
                    })}
                    placeholder="Select Genres"
                    onChange={(selections) => {
                        const selectedValues = selections.map((selection) => selection.value);
                        setGenres(selectedValues);
                      }}
                    value={genres?.map((genre) => {
                        return {
                            value: genre,
                            label: genre.charAt(0).toUpperCase() + genre.slice(1)
                        }
                    })}
                />
            )}
        </div>
    );
}