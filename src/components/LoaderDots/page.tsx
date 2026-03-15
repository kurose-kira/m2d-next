'use client';

interface LoaderDotsProps {
  style?: React.CSSProperties;
}

export default function LoaderDots({ style }: LoaderDotsProps) {
  return (
    <div className="loader-dots" style={style}>
      <div /><div /><div /><div />
    </div>
  );
}
