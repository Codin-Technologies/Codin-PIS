'use client';

import { useState } from 'react';
import { Search, ShoppingBag, Plus, Minus, CreditCard, Wallet, Printer, Package, Settings, LayoutGrid, Edit, Trash2, X, Save, Image as ImageIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

// Mock Data
const INITIAL_CATEGORIES = [
    { id: 'pasta', name: 'Pasta', count: 12, image: '🍝' },
    { id: 'pizza', name: 'Pizza', count: 14, image: '🍕' },
    { id: 'steak', name: 'Steak', count: 9, image: '🥩' },
    { id: 'rice', name: 'Rice', count: 19, image: '🍚' },
    { id: 'noodle', name: 'Noodle', count: 5, image: '🍜' },
];

const INITIAL_MENU_ITEMS = [
    { id: 1, name: 'Margherita', category: 'pizza', price: 29.00, image: '🍕', desc: 'Classic Pizzas' },
    { id: 2, name: 'BBQ Chicken', category: 'pizza', price: 32.98, image: '🍗', desc: 'Meat Lovers Pizzas' },
    { id: 3, name: 'Veggie Supreme', category: 'pizza', price: 24.99, image: '🥬', desc: 'Veggie Pizzas' },
    { id: 4, name: 'Pesto Delight', category: 'pizza', price: 27.50, image: '🌿', desc: 'Veggie Pizzas' },
    { id: 5, name: 'Bolognese', category: 'pasta', price: 18.00, image: '🍝', desc: 'Classic Pasta' },
];

const TABLES = [
    { id: '16', label: '16', status: 'Dine in', orderId: '#F0945', time: 'Just now', items: ['Veggie Supreme'] },
    { id: '09', label: '09', status: 'Served', orderId: '#F0956', time: '5m ago', items: ['Steak', 'Rice'] },
    { id: '24', label: '24', status: 'Wait list', orderId: '#F0949', time: '12m ago', items: ['Pasta'] },
];

const AVAILABLE_TABLES = [
    { id: '5', label: '5', status: 'Available' },
    { id: '8', label: '8', status: 'Available' },
    { id: '12', label: '12', status: 'Available' },
    { id: '2', label: '2', status: 'Available' },
];

export default function KitchenPage() {
    const router = useRouter();
    const [categories, setCategories] = useState(INITIAL_CATEGORIES);
    const [menuItems, setMenuItems] = useState(INITIAL_MENU_ITEMS);
    const [selectedCategory, setSelectedCategory] = useState('pizza');
    const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
    const [isEditingMenu, setIsEditingMenu] = useState(false);

    // Simple state for entering new item details (could be a modal in a real app)
    const [newItemName, setNewItemName] = useState('');
    const [newItemPrice, setNewItemPrice] = useState('');
    const [isAddingItem, setIsAddingItem] = useState(false);

    // Simple state for new category
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [cart, setCart] = useState<{ item: any, qty: number }[]>([
        // Initial empty state or keep mock if needed, but logic should now be tied to table
    ]);

    // In a real app, cart would be keyed by tableId. For this demo, we'll just clear cart when switching tables (simulated)
    // or keep a simple cart state that resets. Let's keep the mock cart for 'Table 16' if selected, otherwise empty.

    const handleTableSelect = (tableId: string) => {
        setSelectedTableId(tableId);
        // Mock: If existing table (16), load its items. Else empty.
        if (tableId === '16') {
            setCart([
                { item: menuItems[2] || INITIAL_MENU_ITEMS[2], qty: 2 }, // Veggie
                { item: menuItems[0] || INITIAL_MENU_ITEMS[0], qty: 1 }, // Margherita
            ]);
        } else {
            setCart([]);
        }
    };

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) return;
        const newId = newCategoryName.toLowerCase().replace(/\s+/g, '-');
        setCategories([...categories, { id: newId, name: newCategoryName, count: 0, image: '🍽️' }]);
        setNewCategoryName('');
        setIsAddingCategory(false);
    };

    const handleDeleteCategory = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm('Delete this category?')) {
            setCategories(categories.filter(c => c.id !== id));
            if (selectedCategory === id) setSelectedCategory(categories[0]?.id || '');
        }
    };

    const handleAddItem = () => {
        if (!newItemName.trim() || !newItemPrice) return;
        const newItem = {
            id: Date.now(),
            name: newItemName,
            category: selectedCategory,
            price: parseFloat(newItemPrice),
            image: '🍱',
            desc: 'New Item'
        };
        setMenuItems([...menuItems, newItem]);

        // Update category count
        setCategories(categories.map(c =>
            c.id === selectedCategory ? { ...c, count: c.count + 1 } : c
        ));

        setNewItemName('');
        setNewItemPrice('');
        setIsAddingItem(false);
    };

    const handleDeleteItem = (item: any, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm(`Delete ${item.name}?`)) {
            setMenuItems(menuItems.filter(i => i.id !== item.id));
            // Update category count
            setCategories(categories.map(c =>
                c.id === item.category ? { ...c, count: Math.max(0, c.count - 1) } : c
            ));
        }
    };

    const addToCart = (item: any) => {
        if (!selectedTableId) {
            alert('Please select a table using the Order Line/Reference first!');
            return;
        }
        const existing = cart.find(c => c.item.id === item.id);
        if (existing) {
            setCart(cart.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c));
        } else {
            setCart([...cart, { item, qty: 1 }]);
        }
    };

    const calculateTotal = () => {
        const subtotal = cart.reduce((acc, curr) => acc + (curr.item.price * curr.qty), 0);
        const tax = subtotal * 0.10;
        return { subtotal, tax, total: subtotal + tax };
    };

    const { subtotal, tax, total } = calculateTotal();

    const handlePlaceOrder = async () => {
        // Mock API trigger
        alert('Order Placed! Stock deducted.');
        // In real implementation: POST /sales/transactions
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-6 overflow-hidden">
            {/* Left Section: Order Line & Menu */}
            <div className="flex flex-1 flex-col gap-6 overflow-hidden pr-2">

                {/* Order Line Section */}
                <div className="rounded-2xl bg-white p-6 shadow-sm flex-shrink-0 flex flex-col max-h-[45%]">
                    <div className="flex items-center justify-between mb-4 flex-shrink-0">
                        <h2 className="text-xl font-bold text-gray-900">Order Line</h2>
                        <div className="flex space-x-2">

                            <button
                                onClick={() => router.push('/kitchen/tables')}
                                className="flex items-center space-x-2 rounded-full bg-[#2a2b2d] px-3 py-1 text-xs font-bold text-white hover:bg-gray-800 transition-colors"
                            >
                                <LayoutGrid className="h-3 w-3" />
                                <span>Manage Tables</span>
                            </button>
                            {['All', 'Dine in', 'Take away', 'Delivery'].map(filter => (
                                <button key={filter} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200">
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="overflow-y-auto pr-2 scrollbar-thin -mr-2 flex-1">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-2">
                            {TABLES.map(table => (
                                <div
                                    key={table.id}
                                    onClick={() => handleTableSelect(table.id)}
                                    className={clsx(
                                        "rounded-xl border p-4 relative cursor-pointer transition-all hover:shadow-md",
                                        selectedTableId === table.id ? "border-[#2a2b2d] bg-gray-50 ring-1 ring-[#2a2b2d]" : "border-gray-100 bg-white"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-gray-900">Table {table.label}</h3>
                                            <p className="text-xs text-gray-500">Order {table.orderId}</p>
                                        </div>
                                        <span className="text-xs text-gray-400">{table.time}</span>
                                    </div>
                                    <div className="flex justify-center my-4">
                                        <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">🍽️</div>
                                    </div>
                                    <div className={`text-center rounded-full py-1 text-xs font-semibold ${table.status === 'Dine in' ? 'bg-yellow-100 text-yellow-700' :
                                        table.status === 'Served' ? 'bg-green-100 text-green-700' :
                                            'bg-orange-100 text-orange-700'
                                        }`}>
                                        {table.status}
                                    </div>
                                </div>
                            ))}

                            {/* Display Available Tables */}
                            {['All', 'Dine in'].includes('All') && AVAILABLE_TABLES.map(table => (
                                <div
                                    key={table.id}
                                    onClick={() => handleTableSelect(table.id)}
                                    className={clsx(
                                        "rounded-xl border border-dashed border-gray-300 bg-gray-50/50 p-4 relative cursor-pointer transition-all hover:bg-gray-100 hover:border-gray-400",
                                        selectedTableId === table.id && "bg-blue-50/50 border-blue-400 ring-1 ring-blue-400"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h3 className="font-bold text-gray-700">Table {table.label}</h3>
                                            <p className="text-xs text-green-600 font-medium">Available</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-center my-4 opacity-50">
                                        <div className="h-16 w-16 rounded-full bg-white border border-gray-200 flex items-center justify-center text-2xl">🪑</div>
                                    </div>
                                    <div className="text-center rounded-full py-1 text-xs font-semibold bg-gray-200 text-gray-500">
                                        Empty
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Menu Header */}
                <div className="flex items-center justify-between px-1 py-2 flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-900">Menu</h2>
                    <button
                        onClick={() => setIsEditingMenu(!isEditingMenu)}
                        className={clsx(
                            "flex items-center space-x-2 rounded-full px-3 py-1 text-xs font-bold transition-colors",
                            isEditingMenu ? "bg-red-50 text-red-600 hover:bg-red-100" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                    >
                        {isEditingMenu ? <Save className="h-3 w-3" /> : <Settings className="h-3 w-3" />}
                        <span>{isEditingMenu ? 'Done' : 'Manage'}</span>
                    </button>
                </div>

                {/* Categories */}
                <div className="flex space-x-4 overflow-x-auto pb-2 flex-shrink-0 scrollbar-thin items-center">
                    {categories.map(cat => (
                        <div key={cat.id} className="relative group">
                            <button
                                onClick={() => setSelectedCategory(cat.id)}
                                className={clsx(
                                    "flex items-center space-x-2 rounded-full px-4 py-2 min-w-[120px] transition-all relative",
                                    selectedCategory === cat.id ? "bg-gray-900 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-100"
                                )}
                            >
                                <span className="text-xl">{cat.image}</span>
                                <div className="text-left">
                                    <div className="text-sm font-bold">{cat.name}</div>
                                    <div className={clsx("text-xs", selectedCategory === cat.id ? "text-gray-400" : "text-gray-500")}>{cat.count} items</div>
                                </div>
                            </button>
                            {isEditingMenu && (
                                <button
                                    onClick={(e) => handleDeleteCategory(cat.id, e)}
                                    className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full text-white flex items-center justify-center shadow-md hover:bg-red-600"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    ))}

                    {isEditingMenu && (
                        isAddingCategory ? (
                            <div className="flex items-center space-x-2 bg-white p-1 rounded-full border border-gray-200 shadow-sm animate-in fade-in zoom-in">
                                <input
                                    autoFocus
                                    placeholder="Name"
                                    className="w-24 text-sm px-2 py-1 outline-none bg-transparent"
                                    value={newCategoryName}
                                    onChange={(e) => setNewCategoryName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddCategory()}
                                />
                                <button onClick={handleAddCategory} className="p-1.5 bg-green-500 rounded-full text-white hover:bg-green-600"><Save className="h-3 w-3" /></button>
                                <button onClick={() => setIsAddingCategory(false)} className="p-1.5 bg-gray-200 rounded-full text-gray-600 hover:bg-gray-300"><X className="h-3 w-3" /></button>
                            </div>
                        ) : (
                            <button
                                onClick={() => setIsAddingCategory(true)}
                                className="h-10 w-10 flex-shrink-0 rounded-full bg-white border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:border-gray-900 hover:text-gray-900 transition-colors"
                            >
                                <Plus className="h-5 w-5" />
                            </button>
                        )
                    )}
                </div>

                {/* Menu Grid */}
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin pb-2">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {menuItems.filter(m => m.category === selectedCategory).map(item => (
                            <div key={item.id} className={clsx("group rounded-2xl bg-white p-4 shadow-sm hover:shadow-md transition-all border border-gray-100 h-full flex flex-col relative", isEditingMenu && "border-dashed border-gray-300")}>
                                {isEditingMenu && (
                                    <button
                                        onClick={(e) => handleDeleteItem(item, e)}
                                        className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 rounded-full text-white flex items-center justify-center shadow-md hover:bg-red-600 z-10"
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                )}
                                <div className="flex justify-center mb-4 text-6xl group-hover:scale-110 transition-transform cursor-pointer flex-shrink-0" onClick={() => !isEditingMenu && addToCart(item)}>
                                    {item.image}
                                </div>
                                <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                                <p className="text-xs text-gray-500 mb-3 flex-1">{item.desc}</p>
                                <div className="flex items-center justify-between mt-auto pt-2">
                                    <span className="font-bold text-gray-900">${item.price}</span>
                                    {!isEditingMenu && (
                                        <button onClick={() => addToCart(item)} className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-colors">
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}

                        {/* Add Item Card */}
                        {isEditingMenu && (
                            isAddingItem ? (
                                <div className="rounded-2xl bg-gray-50 border-2 border-dashed border-blue-300 p-4 flex flex-col justify-center gap-3 animate-in fade-in zoom-in h-full">
                                    <input
                                        autoFocus
                                        placeholder="Item Name"
                                        className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-blue-500"
                                        value={newItemName}
                                        onChange={(e) => setNewItemName(e.target.value)}
                                    />
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">$</span>
                                        <input
                                            placeholder="Price"
                                            type="number"
                                            className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-blue-500"
                                            value={newItemPrice}
                                            onChange={(e) => setNewItemPrice(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                                        />
                                    </div>
                                    <div className="flex gap-2 mt-auto">
                                        <button onClick={handleAddItem} className="flex-1 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">Add</button>
                                        <button onClick={() => setIsAddingItem(false)} className="flex-1 py-1.5 bg-gray-200 text-gray-600 rounded-lg text-xs font-bold hover:bg-gray-300">Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsAddingItem(true)}
                                    className="rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 p-4 flex flex-col items-center justify-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-colors h-full min-h-[200px]"
                                >
                                    <div className="h-10 w-10 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                                        <Plus className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-500">Add Item</span>
                                </button>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Right Section: Sidebar Cart */}
            <div className="w-96 flex flex-col rounded-2xl bg-white p-6 shadow-sm border border-gray-100 h-full">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">
                            {selectedTableId ? `Table No #${selectedTableId}` : 'Select a Table'}
                        </h2>
                        <p className="text-sm text-gray-500">
                            {selectedTableId ? (cart.length > 0 ? 'Current Order' : 'New Order') : 'No table selected'}
                        </p>
                    </div>
                    <button className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400">
                        <Package className="h-5 w-5" />
                    </button>
                </div>

                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                    <h3 className="font-medium text-gray-900">Ordered Items ({cart.length})</h3>
                    {cart.map((line, idx) => (
                        <div key={idx} className="flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="h-12 w-12 rounded-lg bg-gray-100 flex items-center justify-center text-lg">{line.item.image}</div>
                                <div>
                                    <p className="font-bold text-gray-900 text-sm">{line.item.name}</p>
                                    <p className="text-xs text-gray-500">${line.item.price}</p>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="font-bold text-gray-900">x{line.qty}</div>
                                <div className="font-bold text-gray-900">${(line.item.price * line.qty).toFixed(2)}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Payment Summary */}
                <div className="mt-6 space-y-4 border-t border-gray-100 pt-6">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Subtotal</span>
                            <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Tax (10%)</span>
                            <span className="font-medium text-gray-900">${tax.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-base pt-2">
                            <span className="font-bold text-gray-900">Total</span>
                            <span className="font-bold text-gray-900">${total.toFixed(2)}</span>
                        </div>
                    </div>

                    {/* Payment Methods */}
                    <div>
                        <h3 className="font-medium text-gray-900 mb-3">Payment Method</h3>
                        <div className="grid grid-cols-2 gap-3">
                            <button className="flex flex-col items-center justify-center rounded-xl border border-gray-200 p-3 hover:border-gray-900 hover:bg-gray-50 transition-all">
                                <Wallet className="h-6 w-6 text-gray-700 mb-1" />
                                <span className="text-xs font-medium text-gray-700">Cash</span>
                            </button>
                            <button className="flex flex-col items-center justify-center rounded-xl border border-gray-200 p-3 hover:border-gray-900 hover:bg-gray-50 transition-all">
                                <CreditCard className="h-6 w-6 text-gray-700 mb-1" />
                                <span className="text-xs font-medium text-gray-700">Card</span>
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                        <button className="flex items-center justify-center space-x-2 rounded-xl border border-gray-200 py-3 text-sm font-bold text-gray-700 hover:bg-gray-50">
                            <Printer className="h-4 w-4" />
                            <span>Receipt</span>
                        </button>
                        <button onClick={handlePlaceOrder} className="flex items-center justify-center space-x-2 rounded-xl bg-[#2a2b2d] py-3 text-sm font-bold text-white hover:bg-gray-800 shadow-lg">
                            <ShoppingBag className="h-4 w-4" />
                            <span>Place Order</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
