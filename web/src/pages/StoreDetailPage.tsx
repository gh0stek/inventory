import { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore, useStoreStats } from '../hooks/useStores';
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useUpdateProductStock,
  useDeleteProduct,
} from '../hooks/useProducts';
import { LoadingSpinner, ErrorMessage } from '../components/common';
import {
  ProductFilters,
  ProductTable,
  ProductForm,
  Pagination,
  DeleteConfirmation,
} from '../components/products';
import type { Product, ProductFilters as Filters, CreateProductData } from '../types';

export function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const storeId = Number(id);

  const [filters, setFilters] = useState<Filters>({ page: 1, limit: 20 });
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  const { data: store, isLoading: isLoadingStore, error: storeError } = useStore(storeId);
  const { data: stats, isLoading: isLoadingStats } = useStoreStats(storeId);
  const { data: productsResponse, isLoading: isLoadingProducts } = useProducts(storeId, filters);

  const createProduct = useCreateProduct(storeId);
  const updateProduct = useUpdateProduct(storeId);
  const updateStock = useUpdateProductStock(storeId);
  const deleteProduct = useDeleteProduct(storeId);

  const categories = useMemo(() => {
    if (!stats?.categoryBreakdown) return [];
    return stats.categoryBreakdown.map((c) => c.category).sort();
  }, [stats?.categoryBreakdown]);

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product);
  };

  const handleStockUpdate = (product: Product, quantity: number) => {
    updateStock.mutate({ id: product.id, quantity });
  };

  const handleFormSubmit = (data: CreateProductData) => {
    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, data },
        {
          onSuccess: () => {
            setShowForm(false);
            setEditingProduct(null);
          },
        }
      );
    } else {
      createProduct.mutate(data, {
        onSuccess: () => {
          setShowForm(false);
        },
      });
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const handleDeleteConfirm = () => {
    if (deletingProduct) {
      deleteProduct.mutate(deletingProduct.id, {
        onSuccess: () => {
          setDeletingProduct(null);
        },
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeletingProduct(null);
  };

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

        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Products</h2>
            <button
              onClick={handleAddProduct}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
            >
              Add Product
            </button>
          </div>

          <div className="p-6">
            <ProductFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              categories={categories}
            />

            {isLoadingProducts ? (
              <div className="py-8 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : productsResponse ? (
              <>
                <ProductTable
                  products={productsResponse.data}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onStockUpdate={handleStockUpdate}
                />
                <Pagination
                  page={productsResponse.meta.page}
                  totalPages={productsResponse.meta.totalPages}
                  total={productsResponse.meta.total}
                  limit={productsResponse.meta.limit}
                  onPageChange={handlePageChange}
                />
              </>
            ) : null}
          </div>
        </div>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          isLoading={createProduct.isPending || updateProduct.isPending}
        />
      )}

      {deletingProduct && (
        <DeleteConfirmation
          productName={deletingProduct.name}
          onConfirm={handleDeleteConfirm}
          onCancel={handleDeleteCancel}
          isLoading={deleteProduct.isPending}
        />
      )}
    </div>
  );
}
