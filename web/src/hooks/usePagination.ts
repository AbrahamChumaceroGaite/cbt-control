'use client'
import { useState } from 'react'
import { PAGE_SIZE } from '@/config/ui'

/**
 * 0-based page index to match the Pagination component convention.
 * totalPages(total) returns the page count for the given total items.
 */
export function usePagination(initialPageSize = PAGE_SIZE) {
  const [page,     setPage]     = useState(0)
  const [pageSize, setPageSize] = useState(initialPageSize)

  /** Returns the total number of pages for the given item count. */
  const totalPages = (total: number): number => Math.max(1, Math.ceil(total / pageSize))

  /** Resets to the first page — call after filter/search changes. */
  const reset = () => setPage(0)

  return { page, pageSize, setPage, setPageSize, totalPages, reset }
}
