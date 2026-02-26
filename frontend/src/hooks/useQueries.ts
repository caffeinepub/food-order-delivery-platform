import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type { CustomerOrder, MenuItem, CustomerProfile, MenuItemInput, MenuItemUpdate, OrderInput, ProfileInput } from '../backend';

// ─── Menu Queries ────────────────────────────────────────────────────────────

export function useMenu() {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ['menu'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMenu();
    },
    enabled: !!actor && !isFetching,
    staleTime: 30000,
  });
}

export function useAdminMenu() {
  const { actor, isFetching } = useActor();
  return useQuery<MenuItem[]>({
    queryKey: ['adminMenu'],
    queryFn: async () => {
      if (!actor) return [];
      const items = await actor.getMenu();
      return items;
    },
    enabled: !!actor && !isFetching,
    staleTime: 0,
    refetchOnMount: 'always',
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

// ─── Order Queries ────────────────────────────────────────────────────────────

/**
 * Fetches ALL orders for the Courier App.
 * Uses the actor (anonymous or authenticated) — getAllOrders has no auth check.
 * Polls every 15 seconds and refetches on every mount.
 */
export function useAllOrders() {
  const { actor, isFetching } = useActor();
  return useQuery<CustomerOrder[]>({
    queryKey: ['allOrders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 15000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

/**
 * Fetches orders for the currently authenticated customer.
 * Polls every 15 seconds.
 */
export function useOrdersByCustomer() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<CustomerOrder[]>({
    queryKey: ['ordersByCustomer', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getOrdersByCustomerId(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 15000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

// Keep backward-compatible alias
export function useGetMyOrders() {
  return useOrdersByCustomer();
}

/**
 * Fetches a single order by ID.
 * Polls every 8 seconds for live status updates on the confirmation screen.
 */
export function useOrderById(orderId: string | null) {
  const { actor, isFetching } = useActor();
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
    enabled: !!actor && !isFetching && !!orderId,
    refetchInterval: 8000,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    staleTime: 0,
  });
}

// ─── Order Mutations ──────────────────────────────────────────────────────────

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (order: OrderInput) => {
      if (!actor) throw new Error('Actor not available');
      return actor.placeOrder(order);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['ordersByCustomer'] });
    },
  });
}

export function useAcceptOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_orderId: string) => {
      // Backend does not have acceptOrder — status updates are optimistic only
      throw new Error('acceptOrder not implemented in backend');
    },
    onError: () => {
      // Silently handle — the optimistic update in CourierApp handles UI
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_params: { orderId: string; status: string }) => {
      // Backend does not have updateOrderStatus — status updates are optimistic only
      throw new Error('updateOrderStatus not implemented in backend');
    },
    onError: () => {
      // Silently handle
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['ordersByCustomer'] });
    },
  });
}

export function useCancelOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (_orderId: string) => {
      // Backend does not have cancelOrder — optimistic only
      throw new Error('cancelOrder not implemented in backend');
    },
    onError: () => {
      // Silently handle
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['ordersByCustomer'] });
    },
  });
}

/**
 * Permanently deletes an order from the backend.
 * Invalidates allOrders query on success.
 */
export function useDeleteOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.deleteOrder(orderId);
      if (result.__kind__ === 'err') {
        throw new Error('Order not found');
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allOrders'] });
      queryClient.invalidateQueries({ queryKey: ['ordersByCustomer'] });
    },
  });
}

// ─── Profile Queries ──────────────────────────────────────────────────────────

export function useGetCallerProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  const query = useQuery<CustomerProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

// Alias for backward compatibility
export function useGetCallerUserProfile() {
  return useGetCallerProfile();
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

// Alias for backward compatibility
export function useSaveCallerUserProfile() {
  return useSaveCallerProfile();
}
