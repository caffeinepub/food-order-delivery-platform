import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { type MenuItem, type CustomerOrder, type CustomerProfile, type OrderItem, OrderStatus } from '../backend';

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

// ─── Order Queries ────────────────────────────────────────────────────────────

export function useAllOrders() {
  const { actor, isFetching } = useActor();

  return useQuery<CustomerOrder[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllOrders();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
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

      const menuItems = [
        // Burgers
        { itemId: 'burger-001', name: 'Classic Smash Burger', description: 'Double smashed patty, American cheese, pickles, special sauce', price: 12.99, category: 'Burgers', available: true },
        { itemId: 'burger-002', name: 'BBQ Bacon Burger', description: 'Crispy bacon, cheddar, caramelized onions, smoky BBQ sauce', price: 14.99, category: 'Burgers', available: true },
        { itemId: 'burger-003', name: 'Mushroom Swiss Burger', description: 'Sautéed mushrooms, Swiss cheese, garlic aioli, arugula', price: 13.99, category: 'Burgers', available: true },
        // Sides
        { itemId: 'side-001', name: 'Crispy Fries', description: 'Golden shoestring fries with sea salt and house seasoning', price: 4.99, category: 'Sides', available: true },
        { itemId: 'side-002', name: 'Onion Rings', description: 'Beer-battered thick-cut onion rings with ranch dip', price: 5.99, category: 'Sides', available: true },
        { itemId: 'side-003', name: 'Coleslaw', description: 'Creamy house-made coleslaw with apple cider vinegar', price: 3.99, category: 'Sides', available: true },
        // Drinks
        { itemId: 'drink-001', name: 'Craft Lemonade', description: 'Fresh-squeezed lemonade with mint and a hint of ginger', price: 3.99, category: 'Drinks', available: true },
        { itemId: 'drink-002', name: 'Chocolate Milkshake', description: 'Thick and creamy hand-spun chocolate milkshake', price: 6.99, category: 'Drinks', available: true },
        { itemId: 'drink-003', name: 'Sparkling Water', description: 'Chilled sparkling mineral water with lemon', price: 2.49, category: 'Drinks', available: true },
      ];

      for (const item of menuItems) {
        try {
          await actor.addMenuItem(item.itemId, item.name, item.description, item.price, item.category, item.available);
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
