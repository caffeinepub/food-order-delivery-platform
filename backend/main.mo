import Map "mo:core/Map";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  public type OrderStatus = {
    #pending;
    #accepted;
    #preparing;
    #out_for_delivery;
    #delivered;
    #cancelled;
  };

  public type MenuItem = {
    itemId : Text;
    name : Text;
    description : Text;
    price : Float;
    category : Text;
    available : Bool;
  };

  public type OrderItem = {
    itemName : Text;
    quantity : Nat;
    price : Float;
  };

  public type CustomerOrder = {
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

  public type MenuItemInput = {
    name : Text;
    description : Text;
    price : Float;
    category : Text;
  };

  public type MenuItemUpdate = {
    itemId : Text;
    name : ?Text;
    description : ?Text;
    price : ?Float;
    category : ?Text;
  };

  public type ProfileInput = {
    name : Text;
    phone : Text;
  };

  public type OrderInput = {
    orderId : Text;
    items : [OrderItem];
  };

  type Result<Ok, Err> = {
    #ok : Ok;
    #err : Err;
  };

  let menu = Map.empty<Text, MenuItem>();
  let orders = Map.empty<Text, CustomerOrder>();
  let customers = Map.empty<Principal, CustomerProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public query ({ caller }) func getCallerUserProfile() : async ?CustomerProfile {
    customers.get(caller);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : ProfileInput) : async () {
    switch (customers.get(caller)) {
      case (null) {
        customers.add(caller, { name = profile.name; phone = profile.phone });
      };
      case (?customer) {
        customers.add(caller, { customer with name = profile.name; phone = profile.phone });
      };
    };
  };

  public query func getUserProfile(user : Principal) : async ?CustomerProfile {
    customers.get(user);
  };

  // ---- Menu Management (admin only)
  public shared ({ caller }) func addMenuItem(input : MenuItemInput) : async MenuItem {
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
    switch (menu.get(itemId)) {
      case (null) { Runtime.trap("Item not found") };
      case (?_item) {
        menu.remove(itemId);
      };
    };
  };

  public query ({ caller }) func getMenu() : async [MenuItem] {
    menu.values().toArray().filter(func(item) { item.available });
  };

  public query ({ caller }) func getMenuByCategory(category : Text) : async [MenuItem] {
    menu.values().toArray().filter(func(item) { item.category == category and item.available });
  };

  func generateUniqueId(name : Text, category : Text) : Text {
    let timestamp = Time.now().toText();
    name # "_" # category # "_" # timestamp;
  };

  // ---- Order management
  public shared ({ caller }) func placeOrder(order : OrderInput) : async () {
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
        order;
      };
    };
  };

  public query ({ caller }) func getAllOrders() : async [CustomerOrder] {
    orders.values().toArray();
  };

  public query ({ caller }) func getOrdersByCustomerId(customerId : Principal) : async [CustomerOrder] {
    orders.values().toArray().filter(func(order) { order.customerId == customerId });
  };

  public shared ({ caller }) func deleteOrder(orderId : Text) : async Result<(), { #notFound }> {
    switch (orders.get(orderId)) {
      case (null) { #err(#notFound) };
      case (?_) {
        orders.remove(orderId);
        #ok(());
      };
    };
  };
};
