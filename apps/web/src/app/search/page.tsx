"use client"

import { Suspense } from "react";
import AnimeFilters from "@/components/filters/filters";
import { Indicator } from "@/components/indicator";
import SearchHeader from "@/app/search/_components/header";
import SearchContent from "@/app/search/_components/content";
import SearchBar from "@/app/search/_components/search-bar";
import SearchPagination from "@/app/search/_components/pagination";
import { useSearchAnime } from "@/lib/hooks/use-search-anime";

function SearchPage() {
    const {
        animes,
        pageInfo,
        loading,
        error,
        query,
        currentPage,
        handleApplyFilters,
        handlePageChange,
        refetch
    } = useSearchAnime();

    if (error) {
        return (
            <Indicator message={error.message} type="error" onRetry={() => refetch()} />
        );
    }

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            <AnimeFilters 
                onApply={handleApplyFilters}
                className="lg:max-w-[400px]"
            />

            <div className="space-y-10 flex-1 pb-20">
                <div className="flex flex-col gap-5 flex-1">
                    <div className="flex flex-col gap-3">
                        <SearchHeader
                            query={query}
                            animesLength={animes?.length || 0}
                        />
                        <SearchBar onApply={handleApplyFilters} />
                    </div>
                    <SearchContent 
                        isLoading={loading}
                        animes={animes}
                    />
                </div>
                <SearchPagination 
                    pageInfo={pageInfo}
                    currentPage={currentPage}
                    onPageChange={handlePageChange}
                />
            </div>
        </div>
    );
}

export default function Search() {
    return (
        <Suspense fallback={<></>}>
            <SearchPage />
        </Suspense>
    );
}