import Text "mo:core/Text";
import Map "mo:core/Map";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  type OrderStatus = {
    #pending;
    #accepted;
    #preparing;
    #out_for_delivery;
    #delivered;
    #cancelled;
  };

  type MenuItem = {
    itemId : Text;
    name : Text;
    description : Text;
    price : Float;
    category : Text;
    available : Bool;
  };

  type MenuItemInput = {
    name : Text;
    description : Text;
    price : Float;
    category : Text;
  };

  type MenuItemUpdate = {
    itemId : Text;
    name : ?Text;
    description : ?Text;
    price : ?Float;
    category : ?Text;
  };

  module MenuItem {
    public func compare(a : MenuItem, b : MenuItem) : Order.Order {
      Text.compare(a.itemId, b.itemId);
    };
  };

  type OrderItem = {
    itemName : Text;
    quantity : Nat;
    price : Float;
  };

  type CustomerOrder = {
    orderId : Text;
    customerId : Principal;
    items : [OrderItem];
    totalPrice : Float;
    timestamp : Int;
    status : OrderStatus;
  };

  type CustomerProfile = {
    name : Text;
    phone : Text;
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  let menu = Map.empty<Text, MenuItem>();
  let orders = Map.empty<Text, CustomerOrder>();
  let customers = Map.empty<Principal, CustomerProfile>();

  // ---- Profile API (required by frontend) ----

  public query ({ caller }) func getCallerUserProfile() : async ?CustomerProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    customers.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : CustomerProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    customers.add(caller, profile);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?CustomerProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    customers.get(user);
  };

  // ---- Legacy profile API ----

  public query ({ caller }) func getProfile(customerId : Principal) : async ?CustomerProfile {
    if (caller != customerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    customers.get(customerId);
  };

  public shared ({ caller }) func saveProfile(name : Text, phone : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    switch (customers.get(caller)) {
      case (null) {
        customers.add(caller, { name; phone });
      };
      case (?profile) {
        customers.add(caller, { profile with name; phone });
      };
    };
  };

  // ---- Menu management (admin-only writes, public reads) ----

  public shared ({ caller }) func addMenuItem(input : MenuItemInput) : async MenuItem {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can add menu items");
    };

    let itemId = generateUniqueId(input.name, input.category);

    let newItem : MenuItem = {
      itemId;
      name = input.name;
      description = input.description;
      price = input.price;
      category = input.category;
      available = true;
    };

    menu.add(itemId, newItem);
    newItem;
  };

  public shared ({ caller }) func updateMenuItem(update : MenuItemUpdate) : async MenuItem {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update menu items");
    };
    switch (menu.get(update.itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        let updatedItem = {
          item with
          name = switch (update.name) {
            case (null) { item.name };
            case (?newName) { newName };
          };
          description = switch (update.description) {
            case (null) { item.description };
            case (?newDescription) { newDescription };
          };
          price = switch (update.price) {
            case (null) { item.price };
            case (?newPrice) { newPrice };
          };
          category = switch (update.category) {
            case (null) { item.category };
            case (?newCategory) { newCategory };
          };
        };
        menu.add(update.itemId, updatedItem);
        updatedItem;
      };
    };
  };

  public shared ({ caller }) func toggleMenuItemAvailability(itemId : Text) : async MenuItem {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can toggle menu item availability");
    };

    switch (menu.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        let updatedItem = {
          item with
          available = not item.available;
        };
        menu.add(itemId, updatedItem);
        updatedItem;
      };
    };
  };

  public shared ({ caller }) func deleteMenuItem(itemId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete menu items");
    };

    switch (menu.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?_item) {
        menu.remove(itemId);
      };
    };
  };

  public query ({ caller }) func getMenu() : async [MenuItem] {
    menu.values().toArray().filter(func(item) { item.available }).sort();
  };

  public query ({ caller }) func getMenuByCategory(category : Text) : async [MenuItem] {
    menu.values().toArray().filter(func(item) { item.category == category and item.available }).sort();
  };

  func generateUniqueId(name : Text, category : Text) : Text {
    let timestamp = Time.now().toText();
    name # "_" # category # "_" # timestamp;
  };

  // ---- Order management ----

  type OrderInput = {
    orderId : Text;
    items : [OrderItem];
  };

  public shared ({ caller }) func placeOrder(order : OrderInput) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can place orders");
    };
    if (orders.containsKey(order.orderId)) { Runtime.trap("Order ID already exists") };
    let totalPrice = order.items.foldLeft(0.0, func(acc, item) { acc + (item.price * item.quantity.toFloat()) });
    let newOrder : CustomerOrder = {
      orderId = order.orderId;
      customerId = caller;
      items = order.items;
      totalPrice;
      timestamp = Time.now();
      status = #pending;
    };
    orders.add(order.orderId, newOrder);
  };

  public query ({ caller }) func getOrderById(orderId : Text) : async CustomerOrder {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (caller != order.customerId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only view your own orders");
        };
        order
      };
    };
  };

  public query ({ caller }) func getOrdersByCustomer(customerId : Principal) : async [CustomerOrder] {
    if (caller != customerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own orders");
    };
    orders.values().toArray().filter(func(order) { order.customerId == customerId });
  };

  public query ({ caller }) func getAllOrders() : async [CustomerOrder] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all orders");
    };
    orders.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Text, status : OrderStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        let updatedOrder = {
          order with
          status
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };

  public shared ({ caller }) func cancelOrder(orderId : Text) : async () {
    switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) {
        if (caller != order.customerId and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Can only cancel your own orders");
        };
        let updatedOrder = {
          order with
          status = #cancelled;
        };
        orders.add(orderId, updatedOrder);
      };
    };
  };
};
