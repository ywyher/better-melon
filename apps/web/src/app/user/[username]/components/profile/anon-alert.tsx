import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TriangleAlert } from "lucide-react"

export default function AnonAlert() {
  return (
    <Alert variant="destructive">
      <TriangleAlert />
      <AlertTitle className="font-bold">You’re browsing as a guest</AlertTitle>
      <AlertDescription>
        Sign in now to save your progress and keep your data from being lost. Your current data will be transferred to your account.
      </AlertDescription>
    </Alert>
  )
}