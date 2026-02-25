import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Text "mo:core/Text";

module {
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

  type OrderItem = {
    itemName : Text;
    quantity : Nat;
    price : Float;
  };

  type OldOrder = {
    orderId : Text;
    customerId : Text;
    items : [OrderItem];
    totalPrice : Float;
    timestamp : Int;
    status : OrderStatus;
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

  type OldActor = {
    menu : Map.Map<Text, MenuItem>;
    orders : Map.Map<Text, OldOrder>;
  };

  type NewActor = {
    menu : Map.Map<Text, MenuItem>;
    orders : Map.Map<Text, CustomerOrder>;
    customers : Map.Map<Principal, CustomerProfile>;
  };

  func migrateOrder(oldOrder : OldOrder) : CustomerOrder {
    // Always map old orders to the anonymous principal
    {
      oldOrder with
      customerId = Principal.anonymous();
    };
  };

  public func run(old : OldActor) : NewActor {
    let migratedOrders = old.orders.map<Text, OldOrder, CustomerOrder>(
      func(_id, oldOrder) { migrateOrder(oldOrder) }
    );
    let newCustomers = Map.empty<Principal, CustomerProfile>();
    {
      old with
      orders = migratedOrders;
      customers = newCustomers;
    };
  };
};
