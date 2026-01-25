import { Link } from 'react-router-dom';
import type { Store, StoreStats } from '../../types';

interface StoreCardProps {
  store: Store;
  stats?: StoreStats;
  isLoadingStats?: boolean;
}

export function StoreCard({ store, stats, isLoadingStats }: StoreCardProps) {
  return (
    <Link
      to={`/stores/${store.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200"
    >
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">{store.name}</h3>

        {store.address && (
          <p className="text-sm text-gray-600 mb-1">{store.address}</p>
        )}

        {store.phone && (
          <p className="text-sm text-gray-600 mb-3">{store.phone}</p>
        )}

        <div className="border-t border-gray-100 pt-3 mt-3">
          {isLoadingStats ? (
            <div className="animate-pulse flex space-x-4">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          ) : stats ? (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">
                <span className="font-medium text-gray-900">{stats.totalProducts}</span> products
              </span>
              <span className="text-gray-600">
                Total: <span className="font-medium text-green-600">${stats.totalInventoryValue.toFixed(2)}</span>
              </span>
            </div>
          ) : (
            <p className="text-sm text-gray-400">No stats available</p>
          )}
        </div>
      </div>
    </Link>
  );
}
