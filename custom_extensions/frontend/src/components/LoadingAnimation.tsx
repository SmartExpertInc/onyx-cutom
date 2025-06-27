import React from "react";

interface LoadingProps {
  message?: string;
}

const LoadingAnimation: React.FC<LoadingProps> = ({ message = "Processing..." }) => (
  <div className="flex flex-col items-center gap-4 py-8">
    <div className="flex items-center justify-center">
      {/* Animated dots */}
      <div className="flex space-x-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.6s",
            }}
          />
        ))}
      </div>
    </div>
    {message && (
      <p className="text-sm text-gray-600 text-center max-w-xs leading-relaxed">
        {message}
      </p>
    )}
  </div>
);

export default LoadingAnimation; 