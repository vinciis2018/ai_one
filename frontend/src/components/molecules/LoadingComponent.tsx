import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../../assets/jsons/maiind.json';

interface LoadingComponentProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const LoadingComponent: React.FC<LoadingComponentProps> = ({
  message = "Loading...",
  size = 'md',
  className = ""
}) => {

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-32 h-32",
    lg: "w-64 h-64",
    xl: "w-96 h-96"
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <div className={`${sizeClasses[size]}`}>
        <Lottie
          animationData={animationData}
          loop={true}
          autoplay={true}
        />
      </div>
      {message && (
        <p className="text-center font-medium text-slate-500 dark:text-slate-400 animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};
