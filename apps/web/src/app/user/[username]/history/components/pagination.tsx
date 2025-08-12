import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { HistoryPagination } from "@/types/history";
import { useQueryState } from "nuqs";
import { parseAsInteger } from 'nuqs'
import { useCallback } from "react";

type ProfileHistoryPaginationProps = {
  pagination: HistoryPagination
}

export default function ProfileHistoryPagination({ pagination }: ProfileHistoryPaginationProps) {
  const { hasNextPage, hasPreviousPage } = pagination
  const [page, setPage] = useQueryState('page', parseAsInteger.withDefault(1))
  
  const handlePrevious = useCallback(() => {
    if (hasPreviousPage) {
      setPage(page - 1);
    }
  }, [hasPreviousPage, page]);
  
  const handleNext = useCallback(() => {
    if (hasNextPage) {
      setPage(page + 1);
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