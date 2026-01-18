import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import authService from '../services/authService';

// Query keys
export const credentialKeys = {
  all: ['credentials'],
  lists: () => [...credentialKeys.all, 'list'],
};

/**
 * Hook to fetch all credentials
 */
export const useCredentials = (options = {}) => {
  return useQuery({
    queryKey: credentialKeys.lists(),
    queryFn: authService.getAllCredentials,
    ...options,
  });
};

/**
 * Hook to create a new credential
 */
export const useCreateCredential = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authService.createCredential,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: credentialKeys.all });
    },
    ...options,
  });
};

/**
 * Hook to update a credential
 */
export const useUpdateCredential = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authService.updateCredential,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: credentialKeys.all });
    },
    ...options,
  });
};

/**
 * Hook to delete a credential
 */
export const useDeleteCredential = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: authService.deleteCredential,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: credentialKeys.all });
    },
    ...options,
  });
};
