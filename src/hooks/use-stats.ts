import { useQuery } from "@tanstack/react-query";
import { getCallTimeseries, getTotalCallStats, getWorkflowStats } from "@/services/api";

export function useCallTimeseries(params?: { from?: string; to?: string; workflow?: string }) {
  return useQuery({ queryKey: ["stats", "timeseries", params], queryFn: () => getCallTimeseries(params) });
}

export function useTotalCallStats() {
  return useQuery({ queryKey: ["stats", "total"], queryFn: getTotalCallStats });
}

export function useWorkflowStats() {
  return useQuery({ queryKey: ["stats", "workflows"], queryFn: getWorkflowStats });
}

