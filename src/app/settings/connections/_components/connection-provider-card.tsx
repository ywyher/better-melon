"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useQueryClient } from "@tanstack/react-query";
import { X, Loader2, LinkIcon, CheckCircle } from "lucide-react";
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
import { ConnectionProvider } from "@/app/settings/connections/page";

type ConnectionProviderCardProps = {
  provider: ConnectionProvider;
  isConnected: boolean;
  isAuthenticated: boolean;
};

export default function ConnectionProviderCard({ 
  provider, 
  isConnected, 
  isAuthenticated 
}: ConnectionProviderCardProps) {
  const [isLinking, setIsLinking] = useState<boolean>(false);
  const [isUnlinking, setIsUnlinking] = useState<boolean>(false);
  const [isAlertOpen, setIsAlertOpen] = useState<boolean>(false);
  const queryClient = useQueryClient();
  
  const onLink = async () => {
    if (!isAuthenticated) {
      toast.warning("You must be signed in to connect accounts.");
      return;
    }

    setIsLinking(true);
    const res = await authClient.oauth2.link({
      providerId: provider.name,
      callbackURL: "/settings/connections",
    });
    
    if (res.error) {
      toast.error(res.error.message);
      setIsLinking(false);
      return;
    }
    
    queryClient.invalidateQueries({ queryKey: ['connections', 'providers-list'] });
    toast.success(`${provider.name} connected successfully`);
    setIsLinking(false);
  };

  const onUnlink = async () => {
    setIsUnlinking(true);
    const { error } = await authClient.unlinkAccount({
      providerId: provider.name
    });

    if (error) {
      toast.error(error.message);
      setIsUnlinking(false);
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['connections', 'providers-list'] });
    toast.success(`${provider.name} disconnected successfully`);
    setIsUnlinking(false);
    setIsAlertOpen(false);
  };
  
  return (
    <div className={`
      flex items-center justify-between 
      bg-secondary/80 hover:bg-secondary/50 
      rounded-lg p-3 w-full
      border border-border/50 shadow-sm
      transition-all duration-200
    `}>
      <div className="flex items-center gap-4">
        <div className={`
          bg-background p-2 rounded-md
          ${isConnected ? 'ring-1 ring-primary' : ''}
        `}>
          <provider.icon className="w-10 h-10" />
        </div>
        <div>
          <p className="text-lg font-semibold">{provider.name}</p>
          <p className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : 'Not connected'}
          </p>
        </div>
      </div>
      
      {isConnected ? (
        <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="min-w-24 hover:bg-destructive/10 hover:text-destructive border-red-200/30"
              disabled={isUnlinking}
            >
              {isUnlinking ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disconnecting...
                </>
              ) : (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Disconnect
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Disconnect {provider.name}</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to disconnect your {provider.name} account? 
                This will remove all associated permissions and features.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={onUnlink} 
                disabled={isUnlinking}
                className="bg-destructive hover:bg-destructive/90"
              >
                {isUnlinking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  "Disconnect"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button
          variant="default"
          size="sm"
          className="min-w-24"
          disabled={isLinking || !isAuthenticated}
          onClick={onLink}
        >
          {isLinking ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <LinkIcon className="mr-2 h-4 w-4" />
              Connect
            </>
          )}
        </Button>
      )}
    </div>
  );
}