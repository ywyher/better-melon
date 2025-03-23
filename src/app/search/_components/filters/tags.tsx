import { Indicator } from "@/components/indicator";
import MultipleSelector from "@/components/multiple-selector";
import { gql, useQuery } from "@apollo/client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import InputSkeleton from "@/components/input-skeleton";

const GET_TAGS = gql`
    query {
        MediaTagCollection {
            name
        }
    }
`;

type TagQueryProps = {
    MediaTagCollection: {
        name: string;
        __typename?: string;
    }[];
}

export default function TagsFilter({
    queryTags,
    tags,
    setTags
}: {
    queryTags: string[] | null
    tags: string[] | null,
    setTags: Dispatch<SetStateAction<string[] | null>>
}) {
    const { data, loading, error } = useQuery<TagQueryProps>(GET_TAGS);
    
    useEffect(() => {
        if(queryTags?.length) {
            setTags(queryTags)
        }
    }, [queryTags])

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
                    options={data.MediaTagCollection.map((tag) => {
                        return {
                            value: tag.name,
                            label: tag.name.charAt(0).toUpperCase() + tag.name.slice(1)
                        }
                    })}
                    placeholder="Select Tags"
                    onChange={(selections) => {
                        const selectedValues = selections.map((selection) => selection.value);
                        setTags(selectedValues);
                    }}
                    value={tags?.map((tag) => {
                        return {
                            value: tag,
                            label: tag.charAt(0).toUpperCase() + tag.slice(1)
                        }
                    })}
                />
            )}
        </div>
    );
}