import React from 'react';

interface LoadingSkeletonProps {
  className?: string;
}

export const ImageSkeleton: React.FC<LoadingSkeletonProps> = ({ className = "" }) => (
  <div className={`animate-pulse bg-slate-200 ${className}`}>
    <div className="w-full h-full flex items-center justify-center">
      <div className="text-4xl">🏋️‍♂️</div>
    </div>
  </div>
);

export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm animate-pulse">
    <div className="aspect-[4/3] bg-slate-200">
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-4xl">🏋️‍♂️</div>
      </div>
    </div>
    <div className="p-8">
      <div className="h-6 bg-slate-200 rounded mb-3"></div>
      <div className="h-4 bg-slate-200 rounded w-2/3 mb-6"></div>
      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-200 rounded-2xl"></div>
          <div>
            <div className="h-3 bg-slate-200 rounded w-16 mb-1"></div>
            <div className="h-4 bg-slate-200 rounded w-20"></div>
          </div>
        </div>
        <div className="w-12 h-12 bg-slate-200 rounded-full"></div>
      </div>
    </div>
  </div>
);

export const EmptyState: React.FC<{
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}> = ({ icon = "🤷‍♂️", title, description, action }) => (
  <div className="py-20 text-center bg-white rounded-[40px] border border-slate-100">
    <div className="text-6xl mb-6">{icon}</div>
    <h4 className="text-2xl font-black text-slate-800 mb-3">{title}</h4>
    <p className="text-slate-500 mb-8 max-w-md mx-auto">{description}</p>
    {action && (
      <button
        onClick={action.onClick}
        className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-2xl font-black transition-all shadow-lg"
      >
        {action.label}
      </button>
    )}
  </div>
);

export default EmptyState;
