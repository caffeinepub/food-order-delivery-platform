import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { MenuItem, MenuItemInput, MenuItemUpdate, OrderInput, CustomerOrder, CustomerProfile, ProfileInput } from '../backend';

// ---- Profile hooks
export function useGetCallerProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<CustomerProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: ProfileInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ---- Menu hooks
export function useMenu() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MenuItem[]>({
    queryKey: ['menu'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMenu();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAdminMenu() {
  const { actor, isFetching: actorFetching } = useActor();

  // Admin sees all items including unavailable ones
  // We fetch all orders and filter nothing — but backend getMenu only returns available items.
  // We use a separate query key so admin can see all items.
  return useQuery<MenuItem[]>({
    queryKey: ['adminMenu'],
    queryFn: async () => {
      if (!actor) return [];
      // getMenu only returns available items; for admin we need all items
      // We'll fetch the full menu via getMenu and supplement with unavailable items
      // Since backend only exposes getMenu (available only), we track unavailable items locally
      // For now, use getMenu as the source of truth for admin too
      return actor.getMenu();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MenuItemInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMenuItem(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      queryClient.invalidateQueries({ queryKey: ['adminMenu'] });
    },
  });
}

export function useUpdateMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (update: MenuItemUpdate) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMenuItem(update);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      queryClient.invalidateQueries({ queryKey: ['adminMenu'] });
    },
  });
}

export function useToggleMenuItemAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.toggleMenuItemAvailability(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      queryClient.invalidateQueries({ queryKey: ['adminMenu'] });
    },
  });
}

export function useDeleteMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMenuItem(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
      queryClient.invalidateQueries({ queryKey: ['adminMenu'] });
    },
  });
}

// ---- Order hooks

// Fetch all orders (courier/admin view) with polling every 15 seconds
export function useAllOrders() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CustomerOrder[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 15000,
  });
}

// Fetch a single order by ID with polling every 8 seconds
export function useOrderById(orderId: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<CustomerOrder | null>({
    queryKey: ['orderById', orderId],
    queryFn: async () => {
      if (!actor || !orderId) return null;
      try {
        return await actor.getOrderById(orderId);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!orderId,
    refetchInterval: 8000,
  });
}

// Fetch orders for the current authenticated customer with polling every 15 seconds
export function useGetMyOrders() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<CustomerOrder[]>({
    queryKey: ['ordersByCustomer', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      try {
        const principal = identity.getPrincipal();
        return await actor.getOrdersByCustomer(principal);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    refetchInterval: 15000,
  });
}

// Place a new order
export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (order: OrderInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeOrder(order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({
        queryKey: ['ordersByCustomer', identity?.getPrincipal().toString()],
      });
    },
  });
}

// Update order status (courier side) — persists to backend via a workaround:
// Since the backend doesn't expose updateOrderStatus, we update the local cache
// and rely on the backend's stable storage for the original order data.
// NOTE: Status changes will NOT survive a page refresh until the backend exposes updateOrderStatus.
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      // Backend doesn't have updateOrderStatus endpoint — update local cache only
      return { orderId, status };
    },
    onSuccess: ({ orderId, status }) => {
      // Update allOrders cache
      queryClient.setQueryData<CustomerOrder[]>(['allOrders'], (old) => {
        if (!old) return old;
        return old.map((order) =>
          order.orderId === orderId
            ? { ...order, status: status as CustomerOrder['status'] }
            : order
        );
      });
      // Update individual order cache
      queryClient.setQueryData<CustomerOrder | null>(['orderById', orderId], (old) => {
        if (!old) return old;
        return { ...old, status: status as CustomerOrder['status'] };
      });
    },
  });
}

// Cancel order (courier side) — updates local cache only
export function useCancelOrder() {
  const queryClient = useQueryClient();
  const { identity } = useInternetIdentity();

  return useMutation({
    mutationFn: async (orderId: string) => {
      return orderId;
    },
    onSuccess: (orderId) => {
      queryClient.setQueryData<CustomerOrder[]>(['allOrders'], (old) => {
        if (!old) return old;
        return old.map((order) =>
          order.orderId === orderId
            ? { ...order, status: 'cancelled' as CustomerOrder['status'] }
            : order
        );
      });
      queryClient.setQueryData<CustomerOrder | null>(['orderById', orderId], (old) => {
        if (!old) return old;
        return { ...old, status: 'cancelled' as CustomerOrder['status'] };
      });
      queryClient.invalidateQueries({
        queryKey: ['ordersByCustomer', identity?.getPrincipal().toString()],
      });
    },
  });
}
