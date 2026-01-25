import { useState } from 'react';
import type { Product } from '../../types';

interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onStockUpdate: (product: Product, quantity: number) => void;
}

export function ProductTable({
  products,
  onEdit,
  onDelete,
  onStockUpdate,
}: ProductTableProps) {
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [stockValue, setStockValue] = useState<string>('');

  const handleStockEdit = (product: Product) => {
    setEditingStockId(product.id);
    setStockValue(String(product.quantity));
  };

  const handleStockSave = (product: Product) => {
    const newQuantity = parseInt(stockValue, 10);
    if (!isNaN(newQuantity) && newQuantity >= 0) {
      onStockUpdate(product, newQuantity);
    }
    setEditingStockId(null);
    setStockValue('');
  };

  const handleStockCancel = () => {
    setEditingStockId(null);
    setStockValue('');
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0) {
      return <span className="text-red-600 font-medium">Out of Stock</span>;
    }
    if (quantity <= 5) {
      return <span className="text-yellow-600 font-medium">Low Stock</span>;
    }
    return <span className="text-green-600 font-medium">In Stock</span>;
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No products found. Add a product to get started.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Category
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              SKU
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Quantity
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {product.name}
                </div>
                {product.description && (
                  <div className="text-sm text-gray-500 truncate max-w-xs">
                    {product.description}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {product.category}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {product.sku || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                ${Number(product.price).toFixed(2)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                {editingStockId === product.id ? (
                  <div className="flex items-center justify-end gap-1">
                    <input
                      type="number"
                      value={stockValue}
                      onChange={(e) => setStockValue(e.target.value)}
                      min="0"
                      className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleStockSave(product);
                        if (e.key === 'Escape') handleStockCancel();
                      }}
                    />
                    <button
                      onClick={() => handleStockSave(product)}
                      className="text-green-600 hover:text-green-800 p-1"
                      title="Save"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleStockCancel}
                      className="text-gray-600 hover:text-gray-800 p-1"
                      title="Cancel"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStockEdit(product)}
                    className="text-sm text-gray-900 hover:text-blue-600"
                    title="Click to edit"
                  >
                    {product.quantity}
                  </button>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {getStockStatus(product.quantity)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(product)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(product)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
