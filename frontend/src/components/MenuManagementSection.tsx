import { useState } from 'react';
import { Plus, Pencil, Trash2, AlertCircle, UtensilsCrossed, Loader2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useMenu, useAddMenuItem, useUpdateMenuItem, useToggleMenuItemAvailability, useDeleteMenuItem } from '../hooks/useQueries';
import { type MenuItem, type MenuItemInput } from '../backend';

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

function itemToFormData(item: MenuItem): MenuItemFormData {
  return {
    name: item.name,
    description: item.description,
    price: item.price.toString(),
    category: item.category,
  };
}

interface MenuItemFormProps {
  title: string;
  description: string;
  initialData?: MenuItemFormData;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: MenuItemFormData) => void;
  isSubmitting: boolean;
  submitLabel: string;
}

function MenuItemFormDialog({
  title,
  description,
  initialData = emptyForm,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  submitLabel,
}: MenuItemFormProps) {
  const [form, setForm] = useState<MenuItemFormData>(initialData);

  // Reset form when dialog opens with new initialData
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setForm(initialData);
    } else {
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  const isValid =
    form.name.trim() !== '' &&
    form.category.trim() !== '' &&
    !isNaN(parseFloat(form.price)) &&
    parseFloat(form.price) > 0;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display font-800">{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="item-name">Item Name *</Label>
            <Input
              id="item-name"
              placeholder="e.g. Chicken Biryani"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              disabled={isSubmitting}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="item-description">Description</Label>
            <Textarea
              id="item-description"
              placeholder="Describe the dish..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              disabled={isSubmitting}
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="item-price">Price (₹) *</Label>
              <Input
                id="item-price"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="item-category">Category *</Label>
              <Input
                id="item-category"
                placeholder="e.g. Mains"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                disabled={isSubmitting}
                required
              />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !isValid} className="gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function MenuManagementSection() {
  const { data: menuItems, isLoading, isError, refetch } = useMenu();
  const addMenuItem = useAddMenuItem();
  const updateMenuItem = useUpdateMenuItem();
  const toggleAvailability = useToggleMenuItemAvailability();
  const deleteMenuItem = useDeleteMenuItem();

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  // Group items by category
  const grouped = (menuItems ?? []).reduce<Record<string, MenuItem[]>>((acc, item) => {
    const cat = item.category || 'Uncategorized';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  const handleAdd = (data: MenuItemFormData) => {
    const input: MenuItemInput = {
      name: data.name.trim(),
      description: data.description.trim(),
      price: parseFloat(data.price),
      category: data.category.trim(),
    };
    addMenuItem.mutate(input, {
      onSuccess: () => {
        setShowAddDialog(false);
      },
    });
  };

  const handleEdit = (data: MenuItemFormData) => {
    if (!editingItem) return;
    updateMenuItem.mutate(
      {
        itemId: editingItem.itemId,
        name: data.name.trim(),
        description: data.description.trim(),
        price: parseFloat(data.price),
        category: data.category.trim(),
      },
      {
        onSuccess: () => {
          setEditingItem(null);
        },
      }
    );
  };

  const handleToggle = (itemId: string) => {
    toggleAvailability.mutate(itemId);
  };

  const handleDelete = () => {
    if (!deletingItemId) return;
    deleteMenuItem.mutate(deletingItemId, {
      onSuccess: () => {
        setDeletingItemId(null);
      },
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertCircle className="w-10 h-10 text-destructive mb-3" />
        <p className="font-display font-semibold text-foreground mb-1">Failed to load menu</p>
        <p className="text-sm text-muted-foreground mb-4">Please check your connection and try again.</p>
        <Button variant="outline" onClick={() => refetch()} size="sm">
          Try Again
        </Button>
      </div>
    );
  }

  const allItems = menuItems ?? [];

  return (
    <div className="space-y-6">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-800 text-foreground">Menu Items</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {allItems.length} item{allItems.length !== 1 ? 's' : ''} total ·{' '}
            {allItems.filter((i) => i.available).length} available
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Item
        </Button>
      </div>

      {/* Empty state */}
      {allItems.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-border rounded-2xl">
          <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mb-4">
            <UtensilsCrossed className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-display font-semibold text-foreground mb-1">No menu items yet</p>
          <p className="text-sm text-muted-foreground mb-4">Add your first dish to get started.</p>
          <Button onClick={() => setShowAddDialog(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add First Item
          </Button>
        </div>
      )}

      {/* Items grouped by category */}
      {Object.entries(grouped)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([category, items]) => (
          <div key={category} className="space-y-2">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">
              {category}
            </h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.itemId}
                  className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                    item.available
                      ? 'bg-card border-border'
                      : 'bg-muted/40 border-border/50 opacity-70'
                  }`}
                >
                  {/* Item info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground truncate">{item.name}</span>
                      <Badge variant={item.available ? 'default' : 'secondary'} className="text-xs shrink-0">
                        {item.available ? (
                          <><Check className="w-3 h-3 mr-1" />Available</>
                        ) : (
                          <><X className="w-3 h-3 mr-1" />Hidden</>
                        )}
                      </Badge>
                    </div>
                    {item.description && (
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-primary mt-1">
                      ₹{item.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Availability toggle */}
                    <div className="flex items-center gap-1.5">
                      <Switch
                        checked={item.available}
                        onCheckedChange={() => handleToggle(item.itemId)}
                        disabled={toggleAvailability.isPending && toggleAvailability.variables === item.itemId}
                        aria-label={`Toggle availability for ${item.name}`}
                      />
                    </div>

                    {/* Edit */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingItem(item)}
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      aria-label={`Edit ${item.name}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingItemId(item.itemId)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      aria-label={`Delete ${item.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

      {/* Add Item Dialog */}
      <MenuItemFormDialog
        title="Add New Menu Item"
        description="Fill in the details for the new dish. It will be visible to customers immediately."
        isOpen={showAddDialog}
        onClose={() => setShowAddDialog(false)}
        onSubmit={handleAdd}
        isSubmitting={addMenuItem.isPending}
        submitLabel="Add Item"
      />

      {/* Edit Item Dialog */}
      {editingItem && (
        <MenuItemFormDialog
          key={editingItem.itemId}
          title="Edit Menu Item"
          description="Update the details for this dish."
          initialData={itemToFormData(editingItem)}
          isOpen={!!editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={handleEdit}
          isSubmitting={updateMenuItem.isPending}
          submitLabel="Save Changes"
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingItemId} onOpenChange={(open) => { if (!open) setDeletingItemId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Menu Item?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove the item from the menu. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMenuItem.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteMenuItem.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              {deleteMenuItem.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
