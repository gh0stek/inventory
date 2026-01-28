import { useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useStore, useStoreStats, useDeleteStore } from "../hooks/useStores";
import {
  useProducts,
  useCreateProduct,
  useUpdateProduct,
  useUpdateProductStock,
  useDeleteProduct,
} from "../hooks/useProducts";
import { LoadingSpinner, ErrorMessage } from "../components/common";
import {
  ProductFilters,
  ProductTable,
  ProductTableSkeleton,
  ProductForm,
  Pagination,
  DeleteConfirmation,
} from "../components/products";
import { getErrorMessage, getValidationErrors } from "../utils/errors";
import type {
  Product,
  ProductFilters as Filters,
  CreateProductData,
} from "../types";
import { useToast } from "../hooks/useToast";

export function StoreDetailPage() {
  const { id } = useParams<{ id: string }>();
  const storeId = Number(id);
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [filters, setFilters] = useState<Filters>({ page: 1, limit: 20 });
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [showDeleteStoreConfirm, setShowDeleteStoreConfirm] = useState(false);
  const [formServerErrors, setFormServerErrors] = useState<
    Record<string, string>
  >({});
  const [stockUpdateError, setStockUpdateError] = useState<{
    id: number;
    message: string;
  } | null>(null);

  const {
    data: store,
    isLoading: isLoadingStore,
    error: storeError,
    refetch: refetchStore,
  } = useStore(storeId);
  const {
    data: stats,
    isLoading: isLoadingStats,
    error: statsError,
    refetch: refetchStats,
  } = useStoreStats(storeId);
  const {
    data: productsResponse,
    isLoading: isLoadingProducts,
    error: productsError,
    refetch: refetchProducts,
  } = useProducts(storeId, filters);

  const createProduct = useCreateProduct(storeId);
  const updateProduct = useUpdateProduct(storeId);
  const updateStock = useUpdateProductStock(storeId);
  const deleteProduct = useDeleteProduct(storeId);
  const deleteStore = useDeleteStore();

  const categories = useMemo(() => {
    if (!stats?.categoryBreakdown) return [];
    return [...stats.categoryBreakdown.map((c) => c.category)].sort();
  }, [stats]);

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
    setStockUpdateError(null);
    updateStock.mutate(
      { id: product.id, quantity },
      {
        onSuccess: () => {
          showSuccess("Stock updated successfully");
        },
        onError: (error) => {
          const message = getErrorMessage(error);
          setStockUpdateError({ id: product.id, message });
          showError(message);
        },
      },
    );
  };

  const handleFormSubmit = (data: CreateProductData) => {
    setFormServerErrors({});
    if (editingProduct) {
      updateProduct.mutate(
        { id: editingProduct.id, data },
        {
          onSuccess: () => {
            setShowForm(false);
            setEditingProduct(null);
            showSuccess("Product updated successfully");
          },
          onError: (error) => {
            const validationErrors = getValidationErrors(error);
            if (validationErrors) {
              setFormServerErrors(validationErrors);
            }
            showError(getErrorMessage(error));
          },
        },
      );
    } else {
      createProduct.mutate(data, {
        onSuccess: () => {
          setShowForm(false);
          showSuccess("Product created successfully");
        },
        onError: (error) => {
          const validationErrors = getValidationErrors(error);
          if (validationErrors) {
            setFormServerErrors(validationErrors);
          }
          showError(getErrorMessage(error));
        },
      });
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormServerErrors({});
  };

  const handleDeleteConfirm = () => {
    if (deletingProduct) {
      deleteProduct.mutate(deletingProduct.id, {
        onSuccess: () => {
          setDeletingProduct(null);
          showSuccess("Product deleted successfully");
        },
        onError: (error) => {
          showError(getErrorMessage(error));
        },
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeletingProduct(null);
  };

  const handleDeleteStore = () => {
    deleteStore.mutate(storeId, {
      onSuccess: () => {
        showSuccess("Store deleted successfully");
        navigate("/stores");
      },
      onError: (error) => {
        showError(getErrorMessage(error));
        setShowDeleteStoreConfirm(false);
      },
    });
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
        <ErrorMessage
          message="Failed to load store. Please try again later."
          onRetry={() => refetchStore()}
        />
        <Link
          to="/stores"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          Back to stores
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/stores"
          className="text-blue-600 hover:underline mb-4 inline-block"
        >
          &larr; Back to stores
        </Link>

        <div className="bg-white rounded-lg shadow border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {store.name}
              </h1>
              {store.address && <p className="text-gray-600">{store.address}</p>}
              {store.phone && <p className="text-gray-600">{store.phone}</p>}
            </div>
            <button
              onClick={() => setShowDeleteStoreConfirm(true)}
              className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50"
            >
              Remove Store
            </button>
          </div>
        </div>

        {isLoadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-white rounded-lg shadow border border-gray-200 p-4 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : statsError ? (
          <div className="mb-8">
            <ErrorMessage
              message="Failed to load store statistics."
              onRetry={() => refetchStats()}
            />
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalProducts}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Total Quantity</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats.totalQuantity}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Inventory Value</p>
              <p className="text-2xl font-bold text-green-600">
                ${stats.totalInventoryValue.toFixed(2)}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow border border-gray-200 p-4">
              <p className="text-sm text-gray-500">Out of Stock</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.outOfStockCount}
              </p>
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
              <ProductTableSkeleton rows={5} />
            ) : productsError ? (
              <ErrorMessage
                message="Failed to load products."
                onRetry={() => refetchProducts()}
              />
            ) : productsResponse ? (
              <>
                <ProductTable
                  products={productsResponse.data}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onStockUpdate={handleStockUpdate}
                  stockUpdatingId={
                    updateStock.isPending
                      ? updateStock.variables?.id
                      : undefined
                  }
                  stockUpdateError={stockUpdateError}
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
          serverErrors={formServerErrors}
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

      {showDeleteStoreConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Remove Store
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove "{store.name}"? This will also
              delete all products in this store. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteStoreConfirm(false)}
                disabled={deleteStore.isPending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteStore}
                disabled={deleteStore.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteStore.isPending ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
