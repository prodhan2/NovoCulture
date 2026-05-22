import React from 'react';

const Shimmer = ({ className = "", width = "100%", height = "1rem", borderRadius = "0.5rem" }) => {
  return (
    <div 
      className={`shimmer ${className}`} 
      style={{ 
        width, 
        height, 
        borderRadius 
      }} 
    />
  );
};

export const CardShimmer = () => (
  <div className="rounded-2xl border-2 border-white bg-white/50 p-6 shadow-sm animate-pulse">
    <div className="flex justify-between items-start mb-6">
      <div className="flex items-center gap-3">
        <Shimmer width="40px" height="40px" borderRadius="50%" />
        <div className="space-y-2">
          <Shimmer width="80px" height="1.25rem" />
          <Shimmer width="60px" height="0.75rem" />
        </div>
      </div>
      <Shimmer width="100px" height="1.5rem" borderRadius="1rem" />
    </div>
    <div className="grid grid-cols-2 gap-4 mb-6">
      <div className="space-y-3">
        <Shimmer width="100%" height="1rem" />
        <Shimmer width="100%" height="1rem" />
      </div>
      <div className="space-y-3">
        <Shimmer width="100%" height="1rem" />
        <Shimmer width="100%" height="1rem" />
      </div>
    </div>
    <div className="flex gap-2 pt-4 border-t-2 border-white">
      <Shimmer width="50%" height="2.5rem" borderRadius="0.75rem" />
      <Shimmer width="50%" height="2.5rem" borderRadius="0.75rem" />
    </div>
  </div>
);

export const ProjectCardShimmer = () => (
  <div className="rounded-2xl border-2 border-white bg-white p-6 shadow-sm animate-pulse">
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 space-y-3">
        <Shimmer width="60%" height="1.5rem" />
        <Shimmer width="40%" height="1rem" />
      </div>
      <div className="flex gap-2">
        <Shimmer width="80px" height="2.5rem" borderRadius="0.75rem" />
        <Shimmer width="80px" height="2.5rem" borderRadius="0.75rem" />
      </div>
    </div>
  </div>
);

export const MediaShimmer = () => (
  <div className="aspect-square rounded-2xl border-2 border-white bg-white overflow-hidden animate-pulse">
    <Shimmer width="100%" height="100%" borderRadius="0" />
  </div>
);

export default Shimmer;
