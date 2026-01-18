import React from 'react';

/**
 * Skeleton Loader Component for loading states
 */

export const SkeletonCard = () => {
  return (
    <div className="animate-pulse">
      <div className="bg-gray-300 rounded-lg shadow-lg" style={{ width: '323px', height: '204px' }}>
        <div className="p-6 space-y-4">
          <div className="h-6 bg-gray-400 rounded w-3/4"></div>
          <div className="h-4 bg-gray-400 rounded w-1/2"></div>
          <div className="space-y-2 mt-8">
            <div className="h-3 bg-gray-400 rounded"></div>
            <div className="h-3 bg-gray-400 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const SkeletonSidebar = () => {
  return (
    <div className="w-72 bg-white border-r border-gray-200 p-4 animate-pulse">
      <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-1/3"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const SkeletonLoader = () => {
  return (
    <div className="flex-1 flex overflow-hidden">
      <SkeletonSidebar />
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <SkeletonCard />
      </div>
    </div>
  );
};

export default SkeletonLoader;
