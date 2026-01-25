import { useParams, Link } from 'react-router-dom';
import { useStore, useStoreStats } from '../hooks/useStores';
import { LoadingSpinner, ErrorMessage } from '../components/common';

export function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const storeId = Number(id);

  const { data: store, isLoading: isLoadingStore, error: storeError } = useStore(storeId);
  const { data: stats, isLoading: isLoadingStats } = useStoreStats(storeId);

  if (isLoadingStore) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (storeError || !store) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <ErrorMessage message="Failed to load store. Please try again later." />
        <Link to="/stores" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to stores
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/stores" className="text-blue-600 hover:underline mb-4 inline-block">
          &larr; Back to stores
        </Link>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{store.name}</h1>
          {store.address && <p className="text-gray-600">{store.address}</p>}
          {store.phone && <p className="text-gray-600">{store.phone}</p>}
        </div>

        {isLoadingStats ? (
          <LoadingSpinner />
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total Quantity</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalQuantity}</p>
            </div>
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Inventory Value</p>
              <p className="text-2xl font-bold text-green-600">${stats.totalInventoryValue.toFixed(2)}</p>
            </div>
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">{stats.outOfStockCount}</p>
            </div>
          </div>
        ) : null}

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Products</h2>
          <p className="text-gray-500">Product table coming in Task 9...</p>
        </div>
      </div>
    </div>
  );
}
