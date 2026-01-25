import { useStores, useStoreStats } from '../hooks/useStores';
import { StoreCard } from '../components/stores';
import { LoadingSpinner, ErrorMessage } from '../components/common';
import type { Store } from '../types';

function StoreCardWithStats({ store }: { store: Store }) {
  const { data: stats, isLoading } = useStoreStats(store.id);

  return <StoreCard store={store} stats={stats} isLoadingStats={isLoading} />;
}

export function StoreListPage() {
  const { data: stores, isLoading, error } = useStores();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <ErrorMessage message="Failed to load stores. Please try again later." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Stores</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Add Store
          </button>
        </div>

        {!stores || stores.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No stores found.</p>
            <p className="text-gray-400 mt-2">Create your first store to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <StoreCardWithStats key={store.id} store={store} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
