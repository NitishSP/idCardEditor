import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import userService from '../services/userService';
import toast from 'react-hot-toast';

// Query keys
export const userKeys = {
  all: ['users'],
  lists: () => [...userKeys.all, 'list'],
  list: (filters) => [...userKeys.lists(), { filters }],
  details: () => [...userKeys.all, 'detail'],
  detail: (id) => [...userKeys.details(), id],
};

/**
 * Hook to fetch all users
 */
export const useUsers = (params = {}, options = {}) => {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => userService.getAllUsers(params),
    ...options,
  });
};

/**
 * Hook to fetch single user by ID
 */
export const useUser = (id, options = {}) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => userService.getUserById(id),
    enabled: !!id,
    ...options,
  });
};

/**
 * Hook to fetch user by name
 */
export const useUserByName = (name, options = {}) => {
  return useQuery({
    queryKey: ['users', 'name', name],
    queryFn: () => userService.getUserByName(name),
    enabled: !!name,
    ...options,
  });
};

/**
 * Hook to create a new user
 */
export const useCreateUser = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.createUser,
    onSuccess: (data) => {
      // Invalidate and refetch users list
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      toast.success(data.message || 'User created successfully!');
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create user');
      
      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Hook to update a user
 */
export const useUpdateUser = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.updateUser,
    onSuccess: (data, variables) => {
      // Invalidate specific user and list
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      toast.success(data.message || 'User updated successfully!');
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update user');
      
      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Hook to delete a user
 */
export const useDeleteUser = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userService.deleteUser,
    onSuccess: (data, userId) => {
      // Remove from cache and refetch list
      queryClient.removeQueries({ queryKey: userKeys.detail(userId) });
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      toast.success(data.message || 'User deleted successfully!');
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete user');
      
      if (options.onError) {
        options.onError(error);
      }
    },
  });
};

/**
 * Hook to bulk upload users from Excel
 */
export const useBulkUploadUsers = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (usersArray) => userService.bulkUpload(usersArray),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      
      const results = data.data;
      if (results.failed.length > 0) {
        toast.success(
          `Imported ${results.success.length} users. ${results.failed.length} failed.`,
          { duration: 5000 }
        );
      } else {
        toast.success(`Successfully imported ${results.success.length} users`);
      }
      
      if (options.onSuccess) {
        options.onSuccess(data);
      }
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to import users');
      
      if (options.onError) {
        options.onError(error);
      }
    },
  });
};
