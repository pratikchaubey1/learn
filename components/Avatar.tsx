import React from 'react';

interface AvatarProps {
  svg: string;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ svg, className = '' }) => {
  return (
    <div
      className={className}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
};

export default Avatar;