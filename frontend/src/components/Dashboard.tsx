import { motion } from 'motion/react';
import { Package, DollarSign, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Product } from '../types';

interface DashboardProps {
  products: Product[];
}

export function Dashboard({ products }: DashboardProps) {
  const totalProducts = products.length;

  const totalInventoryValue = products.reduce((acc, product) => {
    return acc + (product.price * product.quantity);
  }, 0);

  const outOfStockCount = products.filter(p => p.quantity === 0).length;
  const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= 5).length;

  const cards = [
    {
      id: 'total-products',
      title: 'Total Electronics',
      value: totalProducts,
      icon: Package,
      description: 'Unique items in catalog',
      bgClass: 'bg-white',
      textColor: 'text-slate-900',
      iconColor: 'text-[#7A1E2C]',
      borderColor: 'border-[#7A1E2C]/10',
    },
    {
      id: 'inventory-value',
      title: 'Total Stock Value',
      value: `$${totalInventoryValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      description: 'Sum of price × quantity',
      bgClass: 'bg-[#7A1E2C]',
      textColor: 'text-white',
      iconColor: 'text-[#F3EDE6]',
      borderColor: 'border-[#7A1E2C]',
    },
    {
      id: 'low-stock',
      title: 'Low Stock Alerts',
      value: lowStockCount,
      icon: AlertTriangle,
      description: '5 or fewer units remaining',
      bgClass: 'bg-white',
      textColor: 'text-slate-900',
      iconColor: 'text-amber-600',
      borderColor: 'border-amber-200',
    },
    {
      id: 'out-of-stock',
      title: 'Out of Stock',
      value: outOfStockCount,
      icon: CheckCircle2,
      description: 'Zero units remaining',
      bgClass: 'bg-white',
      textColor: 'text-slate-900',
      iconColor: outOfStockCount > 0 ? 'text-rose-600' : 'text-emerald-600',
      borderColor: outOfStockCount > 0 ? 'border-rose-200' : 'border-emerald-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            id={card.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
            className={`p-6 rounded-xl border shadow-sm transition-all duration-200 ${card.bgClass} ${card.borderColor} flex flex-col justify-between`}
          >
            <div className="flex justify-between items-start mb-3">
              <span className={`text-xs font-semibold uppercase tracking-wider ${card.textColor === 'text-white' ? 'text-cream/80' : 'text-slate-500'}`}>
                {card.title}
              </span>
              <Icon className={`w-5 h-5 ${card.iconColor}`} />
            </div>
            <div>
              <h3 className={`text-2xl sm:text-3xl font-bold tracking-tight mb-1 ${card.textColor}`}>
                {card.value}
              </h3>
              <p className={`text-xs ${card.textColor === 'text-white' ? 'text-cream/70' : 'text-slate-500'}`}>
                {card.description}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
