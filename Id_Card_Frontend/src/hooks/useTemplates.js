import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import templateService from '../services/templateService';
import toast from 'react-hot-toast';

// Query keys
export const templateKeys = {
  all: ['templates'],
  lists: () => [...templateKeys.all, 'list'],
  list: (filters) => [...templateKeys.lists(), { filters }],
  details: () => [...templateKeys.all, 'detail'],
  detail: (id) => [...templateKeys.details(), id],
};

/**
 * Hook to fetch all templates
 */
export const useTemplates = (options = {}) => {
  return useQuery({
    queryKey: templateKeys.lists(),
    queryFn: templateService.getAllTemplates,
    ...options,
  });
};

/**
 * Hook to fetch single template by ID
 */
export const useTemplate = (id, options = {}) => {
  return useQuery({
    queryKey: templateKeys.detail(id),
    queryFn: () => templateService.getTemplateById(id),
    enabled: !!id,
    ...options,
  });
};

/**
 * Hook to fetch template by name
 */
export const useTemplateByName = (name, options = {}) => {
  return useQuery({
    queryKey: ['templates', 'name', name],
    queryFn: () => templateService.getTemplateByName(name),
    enabled: !!name,
    ...options,
  });
};

/**
 * Hook to create a new template
 */
export const useCreateTemplate = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templateService.createTemplate,
    onSuccess: (data) => {
      // Invalidate and refetch templates list
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      
      toast.success(data.message || 'Template created successfully!');
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create template');
      
      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Hook to update a template
 */
export const useUpdateTemplate = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templateService.updateTemplate,
    onSuccess: (data, variables) => {
      // Invalidate specific template and list
      queryClient.invalidateQueries({ queryKey: templateKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      
      // Only show toast if not silent mode
      if (!options.silent) {
        toast.success(data.message || 'Template updated successfully!');
      }
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update template');
      
      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Hook to delete a template
 */
export const useDeleteTemplate = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: templateService.deleteTemplate,
    onSuccess: (data, templateId) => {
      // Remove from cache and refetch list
      queryClient.removeQueries({ queryKey: templateKeys.detail(templateId) });
      queryClient.invalidateQueries({ queryKey: templateKeys.lists() });
      
      toast.success(data.message || 'Template deleted successfully!');
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete template');
      
      if (options.onError) {
        options.onError(error);
      }
    },
  });
};
