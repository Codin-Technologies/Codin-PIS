'use client';

import { useState } from 'react';
import { Search, ShoppingBag, Plus, Minus, CreditCard, Wallet, Printer, Package } from 'lucide-react';
import clsx from 'clsx';

// Mock Data
const CATEGORIES = [
    { id: 'pasta', name: 'Pasta', count: 12, image: '🍝' },
    { id: 'pizza', name: 'Pizza', count: 14, image: '🍕' },
    { id: 'steak', name: 'Steak', count: 9, image: '🥩' },
    { id: 'rice', name: 'Rice', count: 19, image: '🍚' },
    { id: 'noodle', name: 'Noodle', count: 5, image: '🍜' },
];

const MENU_ITEMS = [
    { id: 1, name: 'Margherita', category: 'pizza', price: 29.00, image: '🍕', desc: 'Classic Pizzas' },
    { id: 2, name: 'BBQ Chicken', category: 'pizza', price: 32.98, image: '🍗', desc: 'Meat Lovers Pizzas' },
    { id: 3, name: 'Veggie Supreme', category: 'pizza', price: 24.99, image: '🥬', desc: 'Veggie Pizzas' },
    { id: 4, name: 'Pesto Delight', category: 'pizza', price: 27.50, image: '🌿', desc: 'Veggie Pizzas' },
    { id: 5, name: 'Bolognese', category: 'pasta', price: 18.00, image: '🍝', desc: 'Classic Pasta' },
];

const TABLES = [
    { id: '16', status: 'Dine in', orderId: '#F0945', time: 'Just now', items: ['Veggie Supreme'] },
    { id: '09', status: 'Served', orderId: '#F0956', time: '5m ago', items: ['Steak', 'Rice'] },
    { id: '24', status: 'Wait list', orderId: '#F0949', time: '12m ago', items: ['Pasta'] },
];

export default function KitchenPage() {
    const [selectedCategory, setSelectedCategory] = useState('pizza');
    const [cart, setCart] = useState<{ item: any, qty: number }[]>([
        { item: MENU_ITEMS[2], qty: 2 }, // Veggie
        { item: MENU_ITEMS[0], qty: 1 }, // Margherita
    ]);

    const addToCart = (item: any) => {
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
            <div className="flex flex-1 flex-col gap-6 overflow-y-auto pr-2 scrollbar-thin">

                {/* Order Line Section */}
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">Order Line</h2>
                        <div className="flex space-x-2">
                            {['All', 'Dine in', 'Take away', 'Delivery'].map(filter => (
                                <button key={filter} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200">
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {TABLES.map(table => (
                            <div key={table.id} className="rounded-xl border border-gray-100 bg-gray-50 p-4 relative">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-gray-900">Table {table.id}</h3>
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
                    </div>
                </div>

                {/* Categories */}
                <div className="flex space-x-4 overflow-x-auto pb-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={clsx(
                                "flex items-center space-x-2 rounded-full px-4 py-2 min-w-[120px] transition-all",
                                selectedCategory === cat.id ? "bg-gray-900 text-white shadow-lg" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-100"
                            )}
                        >
                            <span className="text-xl">{cat.image}</span>
                            <div className="text-left">
                                <div className="text-sm font-bold">{cat.name}</div>
                                <div className={clsx("text-xs", selectedCategory === cat.id ? "text-gray-400" : "text-gray-500")}>{cat.count} items</div>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Menu Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-10">
                    {MENU_ITEMS.filter(m => m.category === selectedCategory).map(item => (
                        <div key={item.id} className="group rounded-2xl bg-white p-4 shadow-sm hover:shadow-md transition-all border border-gray-100">
                            <div className="flex justify-center mb-4 text-6xl group-hover:scale-110 transition-transform cursor-pointer" onClick={() => addToCart(item)}>
                                {item.image}
                            </div>
                            <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                            <p className="text-xs text-gray-500 mb-3">{item.desc}</p>
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-gray-900">${item.price}</span>
                                <button onClick={() => addToCart(item)} className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-900 hover:text-white transition-colors">
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right Section: Sidebar Cart */}
            <div className="w-96 flex flex-col rounded-2xl bg-white p-6 shadow-sm border border-gray-100 h-full">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Table No #26</h2>
                        <p className="text-sm text-gray-500">Order #F0945</p>
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
