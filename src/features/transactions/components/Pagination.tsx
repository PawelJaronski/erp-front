'use client'

interface PaginationProps {
    currentPage: number
    totalCount: number
    limit: number
    hasNext: boolean
    hasPrevious: boolean
    showSummary: boolean
    onPageChange: (page: number) => void
}

export function Pagination({ 
    currentPage, 
    totalCount, 
    limit, 
    hasNext, 
    hasPrevious, 
    showSummary,
    onPageChange 
}: PaginationProps) {
    const totalPages = Math.ceil(totalCount / limit)
    const startItem = (currentPage - 1) * limit + 1
    const endItem = Math.min(currentPage * limit, totalCount)

    return (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPrevious}
          className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNext}
          className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </div>
      
      <div className="hidden sm:flex sm:flex-1 sm:items-center">
        {showSummary && (
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{' '}
            <span className="font-medium">{endItem}</span> of{' '}
            <span className="font-medium">{totalCount}</span> results
          </p>
        </div>
        )}
        
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPrevious}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          
          <span className="text-sm text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasNext}
            className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}