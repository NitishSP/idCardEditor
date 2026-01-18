import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { backupService } from '../services/backupService';

// List backups
export const useBackups = (options = {}) => {
  return useQuery({
    queryKey: ['backups'],
    queryFn: backupService.listBackups,
    ...options,
  });
};

// Create backup mutation
export const useCreateBackup = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (password) => backupService.createBackup(password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
    ...options,
  });
};

// Restore backup mutation
export const useRestoreBackup = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ filepath, password }) => backupService.restoreBackup(filepath, password),
    onSuccess: () => {
      // Invalidate all queries to refresh data after restore
      queryClient.invalidateQueries();
    },
    ...options,
  });
};

// Verify backup mutation
export const useVerifyBackup = (options = {}) => {
  return useMutation({
    mutationFn: ({ filepath, password }) => backupService.verifyBackup(filepath, password),
    ...options,
  });
};

// Cleanup backups mutation
export const useCleanupBackups = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (keepCount) => backupService.cleanupBackups(keepCount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
    ...options,
  });
};

// Export backup mutation
export const useExportBackup = (options = {}) => {
  return useMutation({
    mutationFn: (sourcePath) => backupService.exportBackup(sourcePath),
    ...options,
  });
};

// Auto backup mutation
export const useAutoBackup = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (password) => backupService.autoBackup(password),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
    ...options,
  });
};

export default {
  useBackups,
  useCreateBackup,
  useRestoreBackup,
  useVerifyBackup,
  useCleanupBackups,
  useExportBackup,
  useAutoBackup,
};
