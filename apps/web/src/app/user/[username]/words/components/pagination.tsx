import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Pagination as TPagination } from "@/types";
import { WordFilters } from "@/types/word";
import { useQueryState } from "nuqs";
import { parseAsInteger } from 'nuqs'
import { Dispatch, SetStateAction, useCallback } from "react";

type ProfileHistoryPaginationProps = {
  pagination: TPagination
  filters: WordFilters;
  setFilters: Dispatch<SetStateAction<WordFilters>>;
}

export default function ProfileWordsPagination({ pagination, filters, setFilters }: ProfileHistoryPaginationProps) {
  const { hasNextPage, hasPreviousPage } = pagination
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  
  const handlePrevious = useCallback(() => {
    if (hasPreviousPage) {
      setPage(page - 1);
      setFilters({
        ...filters,
        page: page - 1
      })
    }
  }, [hasPreviousPage, page]);
  
  const handleNext = useCallback(() => {
    if (hasNextPage) {
      setPage(page + 1);
      setFilters({
        ...filters,
        page: page + 1
      })
    }
  }, [hasNextPage, page]);
  
  return (
    <Pagination className="justify-end">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePrevious();
            }}
            className={!hasPreviousPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
        
        {/* Page numbers */}
        {/* {pageNumbers.map((page, index) => (
          <PaginationItem key={index}>
            {page === 'ellipsis' ? (
              <PaginationEllipsis />
            ) : (
              <PaginationLink 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handlePageClick(page);
                }}
                isActive={page === currentPage}
                className="cursor-pointer"
              >
                {page}
              </PaginationLink>
            )}
          </PaginationItem>
        ))} */}
        
        <PaginationItem>
          <PaginationNext 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleNext();
            }}
            className={!hasNextPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}