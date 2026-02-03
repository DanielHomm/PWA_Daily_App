"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ListChecks, Refrigerator, UtensilsCrossed, Calendar } from "lucide-react";

export default function GroceriesNav() {
    const pathname = usePathname();

    const links = [
        { href: "/groceries/inventory", label: "Inventory", icon: <Refrigerator size={20} /> },
        { href: "/groceries/shopping-list", label: "Shopping List", icon: <ListChecks size={20} /> },
        { href: "/groceries/recipes", label: "Meals", icon: <UtensilsCrossed size={20} /> },
        { href: "/groceries/planner", label: "Plan", icon: <Calendar size={20} /> },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-white/10 pb-6 pt-2 z-40">
            <div className="flex justify-around items-center max-w-md mx-auto">
                {links.map(link => {
                    const isActive = pathname === link.href;
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`flex flex-col items-center gap-1 p-2 transition-colors ${isActive ? 'text-emerald-400' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            {link.icon}
                            <span className="text-[10px] uppercase font-bold tracking-wider">{link.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
