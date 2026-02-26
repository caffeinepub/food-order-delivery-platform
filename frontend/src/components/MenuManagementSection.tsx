import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, Loader2, ChefHat } from 'lucide-react';
import { type MenuItem } from '../backend';
import {
  useAdminMenu,
  useAddMenuItem,
  useUpdateMenuItem,
  useToggleMenuItemAvailability,
  useDeleteMenuItem,
} from '../hooks/useQueries';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MenuItemFormData {
  name: string;
  description: string;
  price: string;
  category: string;
}

const emptyForm: MenuItemFormData = {
  name: '',
  description: '',
  price: '',
  category: '',
};

export default function MenuManagementSection() {
  // Use the admin-specific hook that maintains all items (including unavailable)
  // in a separate cache managed by mutations via setQueryData.
  const { data: menuItems, isLoading } = useAdminMenu();
  const addMutation = useAddMenuItem();
  const updateMutation = useUpdateMenuItem();
  const toggleMutation = useToggleMenuItemAvailability();
  const deleteMutation = useDeleteMenuItem();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState<MenuItemFormData>(emptyForm);
  const [addError, setAddError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  // Track which item is currently being toggled for per-item loading state
  const [togglingItemId, setTogglingItemId] = useState<string | null>(null);
  // Track which item is currently being deleted for per-item loading state
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const handleOpenAdd = () => {
    setFormData(emptyForm);
    setAddError(null);
    addMutation.reset();
    setShowAddDialog(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setFormData({
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      category: item.category,
    });
    setEditError(null);
    updateMutation.reset();
    setEditingItem(item);
  };

  const handleCloseAdd = () => {
    setShowAddDialog(false);
    setAddError(null);
    addMutation.reset();
  };

  const handleCloseEdit = () => {
    setEditingItem(null);
    setEditError(null);
    updateMutation.reset();
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);
    try {
      await addMutation.mutateAsync({
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
      });
      handleCloseAdd();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to add item. Please try again.';
      setAddError(msg);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setEditError(null);
    try {
      await updateMutation.mutateAsync({
        itemId: editingItem.itemId,
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
      });
      handleCloseEdit();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update item. Please try again.';
      setEditError(msg);
    }
  };

  const handleToggle = async (itemId: string) => {
    setTogglingItemId(itemId);
    try {
      await toggleMutation.mutateAsync(itemId);
    } finally {
      setTogglingItemId(null);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    setDeletingItemId(itemId);
    try {
      await deleteMutation.mutateAsync(itemId);
    } finally {
      setDeletingItemId(null);
    }
  };

  // Group all items by category — includes unavailable items so toggling doesn't remove them
  const allItems: MenuItem[] = menuItems ?? [];
  const grouped = allItems.reduce<Record<string, MenuItem[]>>((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {});

  const formFields = (
    <>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full px-4 py-2.5 bg-white border border-orange-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
          placeholder="e.g. Butter Chicken"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={2}
          className="w-full px-4 py-2.5 bg-white border border-orange-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
          placeholder="Brief description..."
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
          <input
            type="number"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
            min="0"
            step="0.01"
            className="w-full px-4 py-2.5 bg-white border border-orange-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
            className="w-full px-4 py-2.5 bg-white border border-orange-200 rounded-lg text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
            placeholder="e.g. Main Course"
          />
        </div>
      </div>
    </>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-orange-500" />
          <h2 className="font-display font-bold text-xl text-gray-800">Menu Management</h2>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-orange"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-orange-100 p-4 animate-pulse">
              <div className="h-4 bg-orange-100 rounded w-1/3 mb-2" />
              <div className="h-3 bg-orange-50 rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && allItems.length === 0 && (
        <div className="bg-white rounded-xl border border-orange-100 p-10 text-center">
          <ChefHat className="w-12 h-12 text-orange-200 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No menu items yet</p>
          <p className="text-sm text-gray-400 mt-1">Click "Add Item" to create your first menu item</p>
        </div>
      )}

      {/* Grouped items */}
      {Object.entries(grouped).map(([category, categoryItems]) => (
        <div key={category}>
          <div className="flex items-center gap-3 mb-3">
            <h3 className="font-display font-semibold text-gray-700">{category}</h3>
            <div className="flex-1 h-px bg-orange-100" />
            <span className="text-xs text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
              {categoryItems.length}
            </span>
          </div>
          <div className="space-y-2">
            {categoryItems.map((item) => (
              <div
                key={item.itemId}
                className={`bg-white rounded-xl border shadow-sm p-4 flex items-center gap-3 transition-opacity ${
                  item.available ? 'border-orange-100' : 'border-gray-200 opacity-60'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-800 text-sm truncate">{item.name}</p>
                    {!item.available && (
                      <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                        Unavailable
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-xs text-gray-500 truncate mt-0.5">{item.description}</p>
                  )}
                  <p className="text-sm font-bold text-orange-600 mt-1">₹{item.price.toFixed(2)}</p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Toggle availability — only calls toggleMenuItemAvailability, never delete */}
                  <button
                    onClick={() => handleToggle(item.itemId)}
                    disabled={togglingItemId === item.itemId}
                    className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-500 hover:text-orange-600 transition-colors disabled:opacity-50"
                    title={item.available ? 'Mark unavailable' : 'Mark available'}
                  >
                    {togglingItemId === item.itemId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : item.available ? (
                      <ToggleRight className="w-5 h-5 text-orange-500" />
                    ) : (
                      <ToggleLeft className="w-5 h-5 text-gray-400" />
                    )}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 rounded-lg hover:bg-orange-50 text-gray-500 hover:text-orange-600 transition-colors"
                    title="Edit item"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(item.itemId)}
                    disabled={deletingItemId === item.itemId}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors disabled:opacity-50"
                    title="Delete item"
                  >
                    {deletingItemId === item.itemId ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => !open && handleCloseAdd()}>
        <DialogContent className="bg-white border border-orange-100">
          <DialogHeader>
            <DialogTitle className="font-display text-gray-800">Add Menu Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAdd} className="space-y-4">
            {addError && (
              <Alert variant="destructive">
                <AlertDescription>{addError}</AlertDescription>
              </Alert>
            )}
            {formFields}
            <DialogFooter>
              <button
                type="button"
                onClick={handleCloseAdd}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addMutation.isPending}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {addMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Adding...
                  </>
                ) : (
                  'Add Item'
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && handleCloseEdit()}>
        <DialogContent className="bg-white border border-orange-100">
          <DialogHeader>
            <DialogTitle className="font-display text-gray-800">Edit Menu Item</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            {editError && (
              <Alert variant="destructive">
                <AlertDescription>{editError}</AlertDescription>
              </Alert>
            )}
            {formFields}
            <DialogFooter>
              <button
                type="button"
                onClick={handleCloseEdit}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
