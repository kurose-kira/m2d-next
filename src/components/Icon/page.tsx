interface IconProps {
  svg: string;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export default function Icon({ svg, size = 24, className = "", style = {} }: IconProps) {
  return (
    <span
      className={`inline-icon ${className}`}
      style={{
        display: "inline-flex",
        width: size,
        height: size,
        flexShrink: 0,
        ...style,
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
