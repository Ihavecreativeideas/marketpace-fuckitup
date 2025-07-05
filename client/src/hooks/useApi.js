import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, isUnauthorizedError } from '../utils/api';
import { useAuth } from './useAuth';

export const useApi = () => {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  const handleUnauthorizedError = (error) => {
    if (isUnauthorizedError(error)) {
      // Show toast notification
      setTimeout(() => {
        login();
      }, 1000);
      return;
    }
    throw error;
  };

  const useApiQuery = (key, queryFn, options = {}) => {
    return useQuery({
      queryKey: Array.isArray(key) ? key : [key],
      queryFn: async () => {
        try {
          return await queryFn();
        } catch (error) {
          handleUnauthorizedError(error);
        }
      },
      ...options,
    });
  };

  const useApiMutation = (mutationFn, options = {}) => {
    return useMutation({
      mutationFn: async (variables) => {
        try {
          return await mutationFn(variables);
        } catch (error) {
          handleUnauthorizedError(error);
        }
      },
      ...options,
    });
  };

  return {
    useApiQuery,
    useApiMutation,
    queryClient,
  };
};

// Custom hooks for common API operations
export const useListings = (filters = {}) => {
  const { useApiQuery } = useApi();
  
  return useApiQuery(
    ['listings', filters],
    () => api.get('/api/listings', filters),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
    }
  );
};

export const useListing = (id) => {
  const { useApiQuery } = useApi();
  
  return useApiQuery(
    ['listing', id],
    () => api.get(`/api/listings/${id}`),
    {
      enabled: !!id,
    }
  );
};

export const useCreateListing = () => {
  const { useApiMutation, queryClient } = useApi();
  
  return useApiMutation(
    (data) => api.post('/api/listings', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['listings']);
      },
    }
  );
};

export const useCart = () => {
  const { useApiQuery } = useApi();
  
  return useApiQuery(
    ['cart'],
    () => api.get('/api/cart')
  );
};

export const useAddToCart = () => {
  const { useApiMutation, queryClient } = useApi();
  
  return useApiMutation(
    (data) => api.post('/api/cart', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['cart']);
      },
    }
  );
};

export const useRemoveFromCart = () => {
  const { useApiMutation, queryClient } = useApi();
  
  return useApiMutation(
    (id) => api.delete(`/api/cart/${id}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['cart']);
      },
    }
  );
};

export const useOrders = (type = 'buyer') => {
  const { useApiQuery } = useApi();
  
  return useApiQuery(
    ['orders', type],
    () => api.get(`/api/orders/${type}`)
  );
};

export const useCreateOrder = () => {
  const { useApiMutation, queryClient } = useApi();
  
  return useApiMutation(
    (data) => api.post('/api/orders', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['orders']);
        queryClient.invalidateQueries(['cart']);
      },
    }
  );
};

export const useCommunityPosts = (location) => {
  const { useApiQuery } = useApi();
  
  return useApiQuery(
    ['community-posts', location],
    () => api.get('/api/community/posts', { location })
  );
};

export const useCreateCommunityPost = () => {
  const { useApiMutation, queryClient } = useApi();
  
  return useApiMutation(
    (data) => api.post('/api/community/posts', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['community-posts']);
      },
    }
  );
};

export const useDriverProfile = () => {
  const { useApiQuery } = useApi();
  
  return useApiQuery(
    ['driver-profile'],
    () => api.get('/api/driver/profile')
  );
};

export const useDriverRoutes = () => {
  const { useApiQuery } = useApi();
  
  return useApiQuery(
    ['driver-routes'],
    () => api.get('/api/driver/routes')
  );
};

export const useBusinessProfile = () => {
  const { useApiQuery } = useApi();
  
  return useApiQuery(
    ['business-profile'],
    () => api.get('/api/profile/business')
  );
};

export const useCreateBusinessProfile = () => {
  const { useApiMutation, queryClient } = useApi();
  
  return useApiMutation(
    (data) => api.post('/api/profile/business', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['business-profile']);
      },
    }
  );
};

export const useOffers = (type = 'buyer') => {
  const { useApiQuery } = useApi();
  
  return useApiQuery(
    ['offers', type],
    () => api.get(`/api/offers/${type}`)
  );
};

export const useCreateOffer = () => {
  const { useApiMutation, queryClient } = useApi();
  
  return useApiMutation(
    (data) => api.post('/api/offers', data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['offers']);
      },
    }
  );
};
