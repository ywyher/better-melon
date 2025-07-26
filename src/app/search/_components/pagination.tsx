import { AnimePageInfo } from "@/types/anime"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

type SearchPaginationProps = {
  pageInfo?: AnimePageInfo
  currentPage: number
  onPageChange: (page: number) => void
}

export default function SearchPagination({
  pageInfo,
  currentPage,
  onPageChange
}: SearchPaginationProps) {
  if (!pageInfo) return null;
  
  const { hasNextPage } = pageInfo;
  const hasPrevPage = currentPage > 1;
  
  // const generatePageNumbers = () => {
  //   const pages: (number | 'ellipsis')[] = [];
  //   const maxVisiblePages = 5;
    
  //   // Always show first page
  //   pages.push(1);
    
  //   // Calculate range around current page
  //   const startPage = Math.max(2, currentPage - 1);
  //   const endPage = Math.min(currentPage + 1, currentPage + 2);
    
  //   // Add ellipsis if there's a gap after page 1
  //   if (startPage > 2) {
  //     pages.push('ellipsis');
  //   }
    
  //   // Add pages around current page
  //   for (let i = startPage; i <= endPage; i++) {
  //     if (i !== 1 && pages.indexOf(i) === -1) {
  //       pages.push(i);
  //     }
  //   }
    
  //   // Add ellipsis and estimated last pages if there are more pages
  //   if (hasNextPage && endPage < currentPage + 2) {
  //     pages.push('ellipsis');
  //     // Since we don't know total pages, we'll show a few more potential pages
  //     for (let i = Math.max(endPage + 1, currentPage + 2); i <= currentPage + 3; i++) {
  //       pages.push(i);
  //     }
  //   }
    
  //   return pages;
  // };

  // const pageNumbers = generatePageNumbers();

  const handlePrevious = () => {
    if (hasPrevPage) {
      onPageChange(currentPage - 1);
    }
  };
  
  const handleNext = () => {
    if (hasNextPage) {
      onPageChange(currentPage + 1);
    }
  };
  
  const handlePageClick = (page: number) => {
    onPageChange(page);
  };
  
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
            className={!hasPrevPage ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
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