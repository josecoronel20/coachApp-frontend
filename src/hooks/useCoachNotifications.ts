import useSWR from "swr";
import { requireApiUrl } from "@/config/env";
import { fetcher } from "@/lib/utils";
import type { CoachNotification } from "@/types/coachNotificationType";

export const useCoachNotifications = () => {
  const API_URL = requireApiUrl();
  const key = `${API_URL}/api/coach/notifications`;
  const { data, error, isLoading, mutate } = useSWR<{ notifications: CoachNotification[] }>(
    key,
    fetcher,
    {
      keepPreviousData: true,
      refreshInterval: 60_000,
    }
  );

  return {
    notifications: data?.notifications ?? [],
    error,
    isLoading,
    mutate,
  };
};
