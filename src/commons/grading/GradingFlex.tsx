import { Property } from 'csstype';

type GradingFlexProps = {
  justifyContent?: Property.JustifyContent;
  alignItems?: Property.AlignItems;
  flexDirection?: Property.FlexDirection;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
} & React.RefAttributes<HTMLDivElement>;

const GradingFlex: React.FC<GradingFlexProps> = ({
  justifyContent,
  alignItems,
  flexDirection,
  children,
  style,
  className
}: GradingFlexProps) => {
  const defaultStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: justifyContent,
    alignItems: alignItems,
    flexDirection: flexDirection
  };

  return (
    <div className={className} style={{ ...defaultStyle, ...style }}>
      {children}
    </div>
  );
};

export default GradingFlex;
