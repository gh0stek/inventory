export function ProductTableSkeleton({ rows = 5 }: { rows?: number }) {
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
          {Array.from({ length: rows }).map((_, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                  <div className="h-3 bg-gray-100 rounded w-48"></div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="animate-pulse">
                  <div className="h-5 bg-blue-100 rounded-full w-20"></div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="animate-pulse flex justify-end">
                  <div className="h-4 bg-gray-200 rounded w-14"></div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="animate-pulse flex justify-end">
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="animate-pulse">
                  <div className="h-4 bg-green-100 rounded w-16"></div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="animate-pulse flex justify-end gap-4">
                  <div className="h-4 bg-gray-200 rounded w-8"></div>
                  <div className="h-4 bg-gray-200 rounded w-10"></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
