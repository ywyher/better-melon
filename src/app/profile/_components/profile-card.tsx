"use client"

import { User } from "@/lib/db/schema";
import { format } from "date-fns";
import Image from "next/image";
import { getFileUrl } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

type ProfileCardProps = { user: User }

export default function ProfileCard({ user }: ProfileCardProps) {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 md:w-20 md:h-20">
            <Image
              src={getFileUrl(user.image)}
              alt={user.name || "Profile picture"}
              fill
              className="object-cover rounded-lg border-2 border-primary/20"
            />
          </div>
          <div className="space-y-1">
            <h3 className="font-semibold text-lg md:text-xl">{user.name}</h3>
            <div className="flex items-center text-sm text-muted-foreground gap-1.5">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span>Joined {format(user.createdAt, 'MMMM d, yyyy')}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Additional user info could go here */}
      </CardContent>
    </Card>
  );
}

export function ProfileCardSkeleton() {
  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-4">
          <Skeleton className="w-16 h-16 md:w-20 md:h-20 rounded-full" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mt-2" />
      </CardContent>
    </Card>
  );
}