import React, { useEffect, useState } from 'react';

interface AnimatedH1Props extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const AnimatedH1: React.FC<AnimatedH1Props> = ({
  children,
  className = '',
  ...props
}) => {
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setEntered(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <h1
      {...props}
      className={`transition-all duration-500 ease-out motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0 ${
        entered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      } ${className}`}
    >
      {children}
    </h1>
  );
};
