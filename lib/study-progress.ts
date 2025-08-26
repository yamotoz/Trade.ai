import { useState } from 'react';

export function useStudyProgress() {
  const [progress, setProgress] = useState<Record<string, number>>({});

  const updateProgress = (studyId: string, newProgress: number) => {
    setProgress(prev => ({
      ...prev,
      [studyId]: Math.min(100, Math.max(0, newProgress))
    }));
  };

  const getProgress = (studyId: string) => {
    return progress[studyId] || 0;
  };

  const resetProgress = (studyId: string) => {
    setProgress(prev => {
      const newProgress = { ...prev };
      delete newProgress[studyId];
      return newProgress;
    });
  };

  return { progress, updateProgress, getProgress, resetProgress };
}
