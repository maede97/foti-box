'use client';
import React from 'react';

interface IconListProps {
  items: string[];
  iconSrc: string; // path to your icon
  className: string;
}

const IconList: React.FC<IconListProps> = ({ items, iconSrc, className }) => {
  return (
    <ul className={`icon-list ${className}`}>
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
      <style jsx>{`
        .icon-list {
          list-style: none;
          padding-left: 0;
        }

        .icon-list li {
          position: relative;
          padding-left: 28px; /* space for the icon */
          margin-bottom: 6px;
        }

        .icon-list li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 4px;
          width: 18px;
          height: 18px;
          background-image: url('${iconSrc}');
          background-size: contain;
          background-repeat: no-repeat;
        }
      `}</style>
    </ul>
  );
};

export default IconList;
