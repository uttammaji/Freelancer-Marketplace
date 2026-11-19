import React, { useState } from 'react';
import { Star } from 'lucide-react';

export function Rating({
  value = 5.0,
  max = 5,
  size = 'sm', // 'xs', 'sm', 'md', 'lg'
  showNumber = true,
  reviewsCount,
  interactive = false,
  onChange,
  className = ''
}) {
  const [hoverValue, setHoverValue] = useState(0);

  const starSizes = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const textSizes = {
    xs: 'text-xs',
    sm: 'text-xs',
    md: 'text-sm font-semibold',
    lg: 'text-base font-semibold'
  };

  const currentVal = interactive && hoverValue ? hoverValue : value;

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div className="flex items-center gap-0.5">
        {[...Array(max)].map((_, i) => {
          const starIndex = i + 1;
          const isFilled = starIndex <= Math.round(currentVal);

          return (
            <button
              key={i}
              type="button"
              disabled={!interactive}
              onClick={() => interactive && onChange && onChange(starIndex)}
              onMouseEnter={() => interactive && setHoverValue(starIndex)}
              onMouseLeave={() => interactive && setHoverValue(0)}
              className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
            >
              <Star
                className={`${starSizes[size] || starSizes.sm} ${
                  isFilled
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-slate-300 dark:text-slate-700'
                } transition-colors`}
              />
            </button>
          );
        })}
      </div>

      {showNumber && (
        <div className={`flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium ${textSizes[size] || textSizes.sm}`}>
          <span>{Number(value).toFixed(1)}</span>
          {reviewsCount !== undefined && (
            <span className="text-slate-400 dark:text-slate-500 font-normal">
              ({reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'})
            </span>
          )}
        </div>
      )}
    </div>
  );
}
