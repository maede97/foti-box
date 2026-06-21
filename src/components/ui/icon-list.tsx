import { cn } from '@/utils/tailwind-override';
import React from 'react';

interface IconListProps {
  items: string[];
  iconSrc: string;
  className?: string;
}

const IconList: React.FC<IconListProps> = ({ items, iconSrc, className }) => {
  return (
    <ul className={cn('list-none pl-0', className)}>
      {items.map((item, index) => (
        <li className="relative mb-[6px] pl-[28px]" key={index}>
          <span
            aria-hidden
            className="absolute top-[4px] left-0 h-[18px] w-[18px] bg-contain bg-no-repeat"
            style={{ backgroundImage: `url(${iconSrc})` }}
          />
          {item}
        </li>
      ))}
    </ul>
  );
};

export default IconList;
