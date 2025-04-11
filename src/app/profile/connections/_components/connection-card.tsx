"use client"

import Anilist from "@/components/svg/anilist";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { OAuthProviders } from "@/types";
import { useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type ConnectionCardProps = {
  provider: OAuthProviders;
  connected: boolean
};

export default function ConnectionCard({ provider, connected }: ConnectionCardProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const queryClient = useQueryClient();
  
  const onLink = async () => {
    setIsLoading(true);
    const res = await authClient.oauth2.link({
      providerId: provider,
      callbackURL: "/profile/connections",
    });
    
    if (res.error) {
      toast.error(res.error.message);
      setIsLoading(false);
      return;
    }
    
    queryClient.invalidateQueries({ queryKey: ['accounts-list'] });
    toast.message("Account linked successfully");
    setIsLoading(false);
  };
  
  const onUnLink = async () => {
    setIsLoading(true);
    const { error, data } = await authClient.unlinkAccount({
        providerId: "anilist"
    });

    if(error) {
        toast.error(error.message);
        setIsLoading(false);
        return;
    }

    queryClient.invalidateQueries({ queryKey: ['accounts-list'] });
    toast.message("Account unlinked successfully");
    setIsLoading(false);
    setIsAlertOpen(false);
  };

  const getProviderIcon = () => {
    const className = "w-14 h-14 rounded-md";
    switch (provider) {
      case "anilist":
        return <Anilist className={className} />;
      default:
        return null;
    }
  };
  
  return (
    <div className="flex flex-row justify-between items-center bg-secondary rounded-md pe-2">
        <div className="flex flex-row gap-3 items-center">
            {getProviderIcon()}
            <p className="text-2xl font-bold capitalize">{provider}</p>
        </div>
        <div className="flex justify-end">
            {connected ? (
                <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="destructive"
                            className={cn(
                                "w-fit h-full flex-grow",
                                "transition-colors"
                            )}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>Unlinking</>
                            ) : (
                                <X />
                            )}
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Unlink Account</AlertDialogTitle>
                            <AlertDialogDescription>
                                Are you sure you want to unlink your {provider} account? 
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={onUnLink} disabled={isLoading}>
                                {isLoading ? "Unlinking..." : "Unlink"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            ) : (
                <Button
                    onClick={onLink}
                    disabled={isLoading}
                    variant="default"
                    className={cn(
                        "w-fit h-full flex-grow",
                        "transition-colors"
                    )}
                >
                    {isLoading ? (
                        <>Connecting</>
                    ) : (
                        <>Connect</>
                    )}
                </Button>
            )}
        </div>
    </div>
  );
}