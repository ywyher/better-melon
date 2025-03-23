"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Search as SearchIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useQueryState } from "nuqs"

// Define schema for form validation
const searchSchema = z.object({
  query: z.string().min(1, "Please enter a search term")
})

type SearchFormValues = z.infer<typeof searchSchema>

export default function Search() {
  const [queryParam] = useQueryState('query')
  const router = useRouter()

  // Initialize the form with react-hook-form and zod validation
  const form = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      query: queryParam || ""
    }
  })

  // Handle form submission
  async function onSubmit(data: SearchFormValues) {
    router.push(`/search?query=${encodeURIComponent(data.query)}`)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-row gap-3 items-center">
        <div className="flex items-center border rounded-md overflow-hidden w-[500px]">
          <div className="flex items-center px-2 py-0">
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
                      className="outline-none dark:bg-transparent bg-transparent border-none w-[500px] focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none"
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