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
export interface OrderInput {
    orderId: string;
    items: Array<OrderItem>;
}
export interface CustomerProfile {
    name: string;
    phone: string;
}
export interface OrderItem {
    itemName: string;
    quantity: bigint;
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
export interface backendInterface {
    addMenuItem(itemId: string, name: string, description: string, price: number, category: string, available: boolean): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelOrder(orderId: string): Promise<void>;
    getAllOrders(): Promise<Array<CustomerOrder>>;
    getCallerUserProfile(): Promise<CustomerProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getMenu(): Promise<Array<MenuItem>>;
    getMenuByCategory(category: string): Promise<Array<MenuItem>>;
    getOrderById(orderId: string): Promise<CustomerOrder>;
    getOrdersByCustomer(customerId: Principal): Promise<Array<CustomerOrder>>;
    getProfile(customerId: Principal): Promise<CustomerProfile | null>;
    getUserProfile(user: Principal): Promise<CustomerProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    placeOrder(order: OrderInput): Promise<void>;
    saveCallerUserProfile(profile: CustomerProfile): Promise<void>;
    saveProfile(name: string, phone: string): Promise<void>;
    updateMenuItemAvailability(itemId: string, available: boolean): Promise<void>;
    updateOrderStatus(orderId: string, status: OrderStatus): Promise<void>;
}
