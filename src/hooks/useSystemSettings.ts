import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { systemSettingsService, SETTING_KEYS } from "@/services/system-settings";
import type { UpdateSystemSettingDto } from "@/types/system-settings.types";

// Query keys
export const systemSettingsKeys = {
  all: ["system-settings"] as const,
  byKey: (key: string) => ["system-settings", key] as const,
  instructorRevenue: () =>
    ["system-settings", SETTING_KEYS.INSTRUCTOR_REVENUE_PERCENTAGE] as const,
};

// Get all settings
export function useSystemSettings() {
  return useQuery({
    queryKey: systemSettingsKeys.all,
    queryFn: () => systemSettingsService.getAll(),
  });
}

// Get setting by key
export function useSystemSettingByKey(key: string) {
  return useQuery({
    queryKey: systemSettingsKeys.byKey(key),
    queryFn: () => systemSettingsService.getByKey(key),
    enabled: !!key,
  });
}

// Get instructor revenue percentage specifically
export function useInstructorRevenuePercentage() {
  return useQuery({
    queryKey: systemSettingsKeys.instructorRevenue(),
    queryFn: () =>
      systemSettingsService.getByKey(SETTING_KEYS.INSTRUCTOR_REVENUE_PERCENTAGE),
    staleTime: 0, // Always fetch fresh data
    gcTime: 1000 * 60 * 5, // Cache for 5 minutes before garbage collection
  });
}

// Update setting
export function useUpdateSystemSetting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      key,
      payload,
    }: {
      key: string;
      payload: UpdateSystemSettingDto;
    }) => systemSettingsService.update(key, payload),
    onSuccess: (data, variables) => {
      // Directly update cache with new data to avoid stale cache
      queryClient.setQueryData(
        systemSettingsKeys.byKey(variables.key),
        data
      );
      
      // Also invalidate to ensure consistency
      queryClient.invalidateQueries({
        queryKey: systemSettingsKeys.all,
      });
      
      // Force refetch after invalidation
      queryClient.refetchQueries({
        queryKey: systemSettingsKeys.byKey(variables.key),
      });
    },
  });
}
