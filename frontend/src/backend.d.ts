import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface CustomerOrder {
    status: OrderStatus;
    orderId: string;
    timestamp: bigint;
    customerId: Principal;
    items: Array<OrderItem>;
    totalPrice: number;
}
export interface MenuItem {
    itemId: string;
    name: string;
    description: string;
    available: boolean;
    category: string;
    price: number;
}
export type Result = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: Variant_notFound;
};
export interface MenuItemUpdate {
    itemId: string;
    name?: string;
    description?: string;
    category?: string;
    price?: number;
}
export interface OrderInput {
    orderId: string;
    items: Array<OrderItem>;
}
export interface OrderItem {
    itemName: string;
    quantity: bigint;
    price: number;
}
export interface CustomerProfile {
    name: string;
    phone: string;
}
export interface ProfileInput {
    name: string;
    phone: string;
}
export interface MenuItemInput {
    name: string;
    description: string;
    category: string;
    price: number;
}
export enum OrderStatus {
    preparing = "preparing",
    cancelled = "cancelled",
    pending = "pending",
    out_for_delivery = "out_for_delivery",
    delivered = "delivered",
    accepted = "accepted"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export enum Variant_notFound {
    notFound = "notFound"
}
export interface backendInterface {
    addMenuItem(input: MenuItemInput): Promise<MenuItem>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    deleteMenuItem(itemId: string): Promise<void>;
    deleteOrder(orderId: string): Promise<Result>;
    getAllOrders(): Promise<Array<CustomerOrder>>;
    getCallerUserProfile(): Promise<CustomerProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMenu(): Promise<Array<MenuItem>>;
    getMenuByCategory(category: string): Promise<Array<MenuItem>>;
    getOrderById(orderId: string): Promise<CustomerOrder>;
    getOrdersByCustomerId(customerId: Principal): Promise<Array<CustomerOrder>>;
    getUserProfile(user: Principal): Promise<CustomerProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(order: OrderInput): Promise<void>;
    saveCallerUserProfile(profile: ProfileInput): Promise<void>;
    toggleMenuItemAvailability(itemId: string): Promise<MenuItem>;
    updateMenuItem(update: MenuItemUpdate): Promise<MenuItem>;
}
