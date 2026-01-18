import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import fieldService from '../services/fieldService';

// Query keys
export const fieldKeys = {
  all: ['fields'],
  lists: () => [...fieldKeys.all, 'list'],
};

/**
 * Hook to fetch all predefined fields
 */
export const useFields = (options = {}) => {
  return useQuery({
    queryKey: fieldKeys.lists(),
    queryFn: fieldService.getAllFields,
    ...options,
  });
};

/**
 * Hook to create a new field
 */
export const useCreateField = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: fieldService.createField,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fieldKeys.all });
    },
    ...options,
  });
};

/**
 * Hook to update a field
 */
export const useUpdateField = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: fieldService.updateField,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fieldKeys.all });
    },
    ...options,
  });
};

/**
 * Hook to delete a field
 */
export const useDeleteField = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: fieldService.deleteField,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fieldKeys.all });
    },
    ...options,
  });
};

/**
 * Hook to toggle field active status
 */
export const useToggleFieldActive = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: fieldService.toggleFieldActive,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fieldKeys.all });
    },
    ...options,
  });
};

/**
 * Hook to update fields order
 */
export const useUpdateFieldsOrder = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: fieldService.updateFieldsOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fieldKeys.all });
    },
    ...options,
  });
};
