import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { settingsQueries } from "@/lib/queries/settings";
import { showSyncSettingsToast } from "@/components/sync-settings-toast";
import { SyncStrategy } from "@/types";
import { GeneralSettings } from "@/lib/db/schema";

interface UseSyncSettingsOptions {
  syncSettings: GeneralSettings['syncSettings'];
  onSuccess?: (message?: string) => void;
  onError?: (error: string) => void;
  invalidateQueries?: readonly (readonly string[])[];
}

interface HandleSyncOptions {
  serverOperation: () => Promise<{ message?: string | null; error?: string | null }>,
  localOperation?: () => void,
  successMessage?: string
}

export function useSyncSettings({
  syncSettings,
  onSuccess,
  onError,
  invalidateQueries = []
}: UseSyncSettingsOptions) {
  const queryClient = useQueryClient();

  const handleSync = async ({
    localOperation,
    serverOperation,
    successMessage
  }: HandleSyncOptions) => {
    // Always perform local operation first
    if(localOperation) localOperation();
    
    let resolvedStrategy = syncSettings as SyncStrategy;
    
    if (resolvedStrategy === 'ask') {
      const result = await showSyncSettingsToast();
      if (result.error) {
        onError?.(result.error) || toast.error(result.error);
        return { success: false, error: result.error };
      }
      
      if (!result.strategy) {
        const message = successMessage || "Updated successfully in store";
        onSuccess?.() || toast.success(message);
        return { success: true, strategy: null };
      }
      
      resolvedStrategy = result.strategy;
    }
    
    if (resolvedStrategy === 'always' || resolvedStrategy === 'once') {
      try {
        const { message, error } = await serverOperation();
        if (error) throw new Error(error);
        
        // Invalidate queries
        const defaultQueries = [
          settingsQueries.forEpisode._def,
          settingsQueries.general._def
        ];
        
        [...defaultQueries, ...invalidateQueries].forEach(queryKey => {
          queryClient.invalidateQueries({ queryKey });
        });
        
        const successMsg = message || successMessage || "Updated successfully";
        onSuccess?.(successMsg) || toast.success(successMsg);
        return { success: true, strategy: resolvedStrategy };
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : "Failed to update";
        onError?.(errorMsg) || toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    }
    
    // Handle 'never' strategy
    const message = successMessage || "Updated successfully in store";
    onSuccess?.(message) || toast.success(message);
    return { success: true, strategy: 'never' };
  };

  return { handleSync };
}