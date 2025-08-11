import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils/utils"
import { TriangleAlert } from "lucide-react"

export default function AnonAlert({ className }: { className: string }) {
  return (
    <Alert variant="destructive" className={cn(
      'w-fit',
      className
    )}>
      <TriangleAlert />
      <AlertTitle className="font-bold">You’re browsing as a guest</AlertTitle>
      <AlertDescription>
        Sign in now to save your progress and keep your data from being lost. Your current data will be transferred to your account.
      </AlertDescription>
    </Alert>
  )
}