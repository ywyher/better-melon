import { toast as sonnerToast } from "sonner";
import { handleGeneralSettings } from "@/app/settings/general/actions";
import { SyncStrategy } from "@/types";

export function showSyncSettingsToast(): Promise<{ strategy: SyncStrategy | null; error: string | null }> {
  sonnerToast.dismiss()
  return new Promise((resolve) => {
    sonnerToast(
      <div className="flex flex-col gap-2 w-full">
        <div>Sync changes with account?</div>
        <div className="flex gap-2 justify-end">
          <button
            onClick={async () => {
              try {
                const { error } = await handleGeneralSettings({ syncSettings: "always" });
                if (error) {
                  sonnerToast.error(error);
                  resolve({ strategy: null, error });
                } else {
                  sonnerToast.dismiss();
                  resolve({ strategy: "always", error: null });
                }
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Failed to update settings";
                sonnerToast.error(errorMessage);
                resolve({ strategy: null, error: errorMessage });
              }
            }}
            className="cursor-pointer text-xs px-2 py-1 text-green-500 hover:text-green-600 hover:underline"
          >
            Always
          </button>
          <button
            onClick={() => {
              sonnerToast.dismiss();
              resolve({ strategy: "once", error: null });
            }}
            className="cursor-pointer text-xs px-2 py-1 text-gray-500 hover:text-gray-600 hover:underline"
          >
            Just Once
          </button>
          <button
            onClick={async () => {
              try {
                const { error } = await handleGeneralSettings({ syncSettings: "never" });
                if (error) {
                  sonnerToast.error(error);
                  resolve({ strategy: null, error });
                } else {
                  sonnerToast.dismiss();
                  resolve({ strategy: "never", error: null });
                }
              } catch (err) {
                const errorMessage = err instanceof Error ? err.message : "Failed to update settings";
                sonnerToast.error(errorMessage);
                resolve({ strategy: null, error: errorMessage });
              }
            }}
            className="cursor-pointer text-xs px-2 py-1 text-red-500 hover:text-red-600 hover:underline"
          >
            Never
          </button>
        </div>
      </div>,
      {
        duration: 5000,
        className: "sync-settings-toast",
        closeButton: true,
        onAutoClose: () => {
          resolve({
            strategy: null,
            error: null
          })
        },
        onDismiss: () => {
          resolve({
            strategy: null,
            error: null
          })
        }
      }
    );
  });
}