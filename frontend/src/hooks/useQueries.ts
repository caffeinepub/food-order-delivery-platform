import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { type MenuItem, type MenuItemInput, type MenuItemUpdate, type CustomerOrder, type CustomerProfile, type OrderItem, OrderStatus } from '../backend';

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
    staleTime: 5 * 60 * 1000,
  });
}

export function useMenuByCategory(category: string) {
  const { actor, isFetching } = useActor();

  return useQuery<MenuItem[]>({
    queryKey: ['menu', 'category', category],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMenuByCategory(category);
    },
    enabled: !!actor && !isFetching && !!category,
  });
}

// ─── Menu Management Mutations ────────────────────────────────────────────────

export function useAddMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: MenuItemInput) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.addMenuItem(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
  });
}

export function useUpdateMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (update: MenuItemUpdate) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.updateMenuItem(update);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
  });
}

export function useToggleMenuItemAvailability() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!actor) throw new Error('Actor not initialized');
      return actor.toggleMenuItemAvailability(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
  });
}

export function useDeleteMenuItem() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (itemId: string) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.deleteMenuItem(itemId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
  });
}

// ─── Order Queries ────────────────────────────────────────────────────────────

export function useAllOrders() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<CustomerOrder[]>({
    queryKey: ['orders', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getAllOrders();
    },
    // Only run when actor is ready AND user is authenticated (admin check happens server-side)
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 10000,
    retry: (failureCount, error) => {
      // Don't retry authorization errors
      const msg = (error as Error)?.message ?? '';
      if (msg.includes('Unauthorized') || msg.includes('trap')) return false;
      return failureCount < 2;
    },
  });
}

export function useOrderById(orderId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<CustomerOrder | null>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!actor || !orderId) return null;
      return actor.getOrderById(orderId);
    },
    enabled: !!actor && !isFetching && !!orderId,
    refetchInterval: 8000,
  });
}

export function useGetMyOrders() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<CustomerOrder[]>({
    queryKey: ['orders', 'my', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const principal = identity.getPrincipal();
      return actor.getOrdersByCustomer(principal);
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 15000,
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

export function useSaveCallerProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: CustomerProfile) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// ─── Order Mutations ──────────────────────────────────────────────────────────

export function usePlaceOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      items,
    }: {
      orderId: string;
      items: OrderItem[];
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.placeOrder({ orderId, items });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.updateOrderStatus(orderId, status);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.orderId] });
    },
  });
}

export function useCancelOrder() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (orderId: string) => {
      if (!actor) throw new Error('Actor not initialized');
      await actor.cancelOrder(orderId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

// ─── Menu Seeding ─────────────────────────────────────────────────────────────

export function useSeedMenu() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not initialized');

      const menuItems: MenuItemInput[] = [
        // Indian Mains
        { name: 'Chicken Biryani', description: 'Fragrant basmati rice layered with spiced chicken, saffron, and caramelized onions', price: 14.99, category: 'Mains' },
        { name: 'Paneer Butter Masala', description: 'Soft paneer cubes in a rich, creamy tomato-cashew gravy', price: 12.99, category: 'Mains' },
        { name: 'Dal Tadka', description: 'Yellow lentils tempered with cumin, garlic, and dried red chillies', price: 9.99, category: 'Mains' },
        // Breads
        { name: 'Butter Naan', description: 'Soft leavened flatbread baked in a tandoor, brushed with butter', price: 3.49, category: 'Breads' },
        { name: 'Garlic Roti', description: 'Whole wheat flatbread with garlic and coriander', price: 2.99, category: 'Breads' },
        // Starters
        { name: 'Chicken Tikka', description: 'Tender chicken marinated in yogurt and spices, grilled in a tandoor', price: 11.99, category: 'Starters' },
        { name: 'Samosa (2 pcs)', description: 'Crispy pastry filled with spiced potatoes and peas, served with chutney', price: 5.99, category: 'Starters' },
        // Drinks
        { name: 'Mango Lassi', description: 'Chilled yogurt drink blended with sweet Alphonso mango pulp', price: 4.49, category: 'Drinks' },
        { name: 'Masala Chai', description: 'Spiced Indian tea brewed with ginger, cardamom, and milk', price: 2.99, category: 'Drinks' },
      ];

      for (const item of menuItems) {
        try {
          await actor.addMenuItem(item);
        } catch {
          // Item may already exist, skip
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['menu'] });
    },
  });
}
