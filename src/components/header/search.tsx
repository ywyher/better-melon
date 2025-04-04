"use client"

import { Suspense } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Search as SearchIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

type SearchFormValues = {
  query: string
}

function SearchForm() {
  const searchParams = useSearchParams()
  const queryParam = searchParams.get('query') || ""
  const router = useRouter()

  const form = useForm<SearchFormValues>({
    defaultValues: {
      query: queryParam
    }
  })

  function onSubmit(data: SearchFormValues) {
    router.push(`/search?query=${encodeURIComponent(data.query)}`)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-row gap-3 items-center">
        <div className="flex items-center border rounded-md overflow-hidden w-full max-w-lg">
          <div className="flex items-center px-2 py-0 w-full">
            <SearchIcon className="h-5 w-5 text-gray-400" />
            <FormField
              control={form.control}
              name="query"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Search..."
                      className="outline-none dark:bg-transparent bg-transparent border-none w-full focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <Button
          variant="outline"
          size="icon"
          type="submit"
        >
          <SearchIcon />
        </Button>
      </form>
    </Form>
  )
}

function SearchFallback() {
  return (
    <div className="flex flex-row gap-3 items-center">
      <div className="flex items-center border rounded-md overflow-hidden w-full max-w-lg">
        <div className="flex items-center px-2 py-0 w-full">
          <SearchIcon className="h-5 w-5 text-gray-400" />
          <Input
            placeholder="Loading search..."
            disabled
            className="outline-none dark:bg-transparent bg-transparent border-none w-full focus:ring-0"
          />
        </div>
      </div>
      <Button
        variant="outline"
        size="icon"
        disabled
      >
        <SearchIcon />
      </Button>
    </div>
  )
}

export default function Search() {
  return (
    <Suspense fallback={<SearchFallback />}>
      <SearchForm />
    </Suspense>
  )
}