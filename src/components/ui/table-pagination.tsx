import { useTranslation } from "react-i18next"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export const PER_PAGE_OPTIONS = [10, 25, 50, 100]

export interface TablePaginationProps {
  page: number
  lastPage: number
  perPage: number
  onPageChange: (page: number) => void
  onPerPageChange: (perPage: number) => void
}

export function TablePagination({
  page,
  lastPage,
  perPage,
  onPageChange,
  onPerPageChange,
}: TablePaginationProps) {
  const { t } = useTranslation()
  const pages = Math.max(1, lastPage)

  return (
    <div className="mx-auto mt-4 flex w-full max-w-[95%] items-center justify-end gap-3 px-4 text-sm">
      <Select
        value={perPage}
        onValueChange={(value) => {
          onPerPageChange(Number(value))
          onPageChange(1)
        }}
      >
        <SelectTrigger className="w-32" aria-label={t('table.perPage')}>
          <SelectValue>{t('table.perPageOption', { count: perPage })}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {PER_PAGE_OPTIONS.map((size) => (
            <SelectItem key={size} value={size}>
              {t('table.perPageOption', { count: size })}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-muted-foreground">
        {t('table.pageOf', { page, pages })}
      </span>
      <Button
        size="icon-sm"
        variant="ghost"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button
        size="icon-sm"
        variant="ghost"
        disabled={page >= pages}
        onClick={() => onPageChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
