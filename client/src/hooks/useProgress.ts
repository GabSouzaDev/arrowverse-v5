import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface WatchedEpisodes {
  [episodeId: string]: boolean;
}

export interface ProgressSummary {
  totalWatched: number;
  totalEpisodes: number;
  crossoversWatched: number;
  currentStreak: number;
  lastUpdated: string;
}

export interface UserProgressData {
  watchedEpisodes: WatchedEpisodes;
  summary: ProgressSummary;
}

export function useProgress() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery<UserProgressData>({
    queryKey: ['arrowverse-progress'],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('get-progress', {
        body: {},
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Edge function returns data wrapped in data property
      return data.data;
    },
    retry: 1,
  });

  const updateEpisodeMutation = useMutation({
    mutationFn: async ({ episodeId, watched }: { episodeId: string; watched: boolean }) => {
      const { data, error } = await supabase.functions.invoke('update-progress', {
        body: { episodeId, watched },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      // Refresh progress data
      queryClient.invalidateQueries({ queryKey: ['arrowverse-progress'] });
    },
  });

  const updateSummaryMutation = useMutation({
    mutationFn: async (summary: Partial<ProgressSummary>) => {
      const { data, error } = await supabase.functions.invoke('update-summary', {
        body: summary,
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arrowverse-progress'] });
    },
  });

  const resetProgressMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('reset-progress', {
        body: {},
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['arrowverse-progress'] });
    },
  });

  const updateEpisodeProgress = (episodeId: string, watched: boolean) => {
    updateEpisodeMutation.mutate({ episodeId, watched });
  };

  const updateProgressSummary = (summary: Partial<ProgressSummary>) => {
    updateSummaryMutation.mutate(summary);
  };

  const resetProgress = () => {
    resetProgressMutation.mutate();
  };

  return {
    data: data || {
      watchedEpisodes: {},
      summary: {
        totalWatched: 0,
        totalEpisodes: 0,
        crossoversWatched: 0,
        currentStreak: 0,
        lastUpdated: new Date().toISOString(),
      },
    },
    isLoading,
    error,
    updateEpisodeProgress,
    updateProgressSummary,
    resetProgress,
    isUpdating: updateEpisodeMutation.isPending || updateSummaryMutation.isPending || resetProgressMutation.isPending,
  };
}
