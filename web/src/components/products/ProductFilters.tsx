import { useState, useEffect } from 'react';
import type { ProductFilters as Filters } from '../../types';

interface ProductFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  categories: string[];
}

export function ProductFilters({
  filters,
  onFiltersChange,
  categories,
}: ProductFiltersProps) {
  const [search, setSearch] = useState(filters.search || '');

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== filters.search) {
        onFiltersChange({ ...filters, search, page: 1 });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: category || undefined,
      page: 1,
    });
  };

  const handleInStockChange = (checked: boolean) => {
    onFiltersChange({
      ...filters,
      inStock: checked || undefined,
      page: 1,
    });
  };

  const handleSortChange = (sortBy: Filters['sortBy']) => {
    onFiltersChange({
      ...filters,
      sortBy,
      page: 1,
    });
  };

  const handleSortOrderChange = (sortOrder: Filters['sortOrder']) => {
    onFiltersChange({
      ...filters,
      sortOrder,
      page: 1,
    });
  };

  const handleMinPriceChange = (value: string) => {
    const minPrice = value ? Number(value) : undefined;
    onFiltersChange({ ...filters, minPrice, page: 1 });
  };

  const handleMaxPriceChange = (value: string) => {
    const maxPrice = value ? Number(value) : undefined;
    onFiltersChange({ ...filters, maxPrice, page: 1 });
  };

  const handleClearFilters = () => {
    setSearch('');
    onFiltersChange({ page: 1, limit: filters.limit });
  };

  const hasActiveFilters =
    filters.category ||
    filters.inStock ||
    filters.search ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined;

  return (
    <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="w-40">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={filters.category || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="w-28">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Min Price
          </label>
          <input
            type="number"
            value={filters.minPrice ?? ''}
            onChange={(e) => handleMinPriceChange(e.target.value)}
            placeholder="0"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="w-28">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Price
          </label>
          <input
            type="number"
            value={filters.maxPrice ?? ''}
            onChange={(e) => handleMaxPriceChange(e.target.value)}
            placeholder="Any"
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="w-32">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sort By
          </label>
          <select
            value={filters.sortBy || 'name'}
            onChange={(e) => handleSortChange(e.target.value as Filters['sortBy'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="quantity">Quantity</option>
            <option value="createdAt">Date Added</option>
          </select>
        </div>

        <div className="w-24">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Order
          </label>
          <select
            value={filters.sortOrder || 'asc'}
            onChange={(e) => handleSortOrderChange(e.target.value as Filters['sortOrder'])}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="asc">Asc</option>
            <option value="desc">Desc</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock || false}
            onChange={(e) => handleInStockChange(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">In Stock Only</span>
        </label>

        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
