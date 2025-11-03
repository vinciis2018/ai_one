interface CircleProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  circleColor?: string;
  progressColor?: string;
  textColor?: string;
}

export function CircleProgress({
  value,
  size = 100,
  strokeWidth = 8,
  circleColor = '#EAE0FF',
  progressColor = '#7850CD',
  textColor = '#7850CD',
}: CircleProgressProps) {
  // Ensure value is between 0 and 100
  const progress = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes progress {
            0% { 
              stroke-dashoffset: ${circumference};
            }
            100% { 
              stroke-dashoffset: ${offset};
            }
          }
          @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          .progress-circle {
            transform-origin: center;
            transform: rotate(-90deg);
          }
          .progress-circle.rotating {
            animation: rotate 2s linear infinite;
          }
        `
      }} />
      <svg width={size} height={size}>
        <circle
          className="transition-all duration-300 ease-in-out"
          stroke={circleColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`progress-circle ${progress < 100 ? 'rotating' : ''}`}
          stroke={progressColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeDasharray={circumference}
          strokeDashoffset={progress === 100 ? offset : circumference - (progress / 100) * circumference}
        />
      </svg>
      <span 
        className="absolute text-center font-medium blur"
        style={{ 
          color: textColor,
          fontSize: size * 0.25,
          lineHeight: 1 
        }}
      >
        {Math.round(progress)}%
      </span>
    </div>
  );
}