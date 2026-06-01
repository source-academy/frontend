import type { Property } from 'csstype';

const defaultStyles: React.CSSProperties = {
  display: 'flex',
};

type Props = {
  justifyContent?: Property.JustifyContent;
  alignItems?: Property.AlignItems;
  flexDirection?: Property.FlexDirection;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  className?: string;
};

function GradingFlex({
  justifyContent,
  alignItems,
  flexDirection,
  children,
  style,
  className,
}: Props) {
  const styles: React.CSSProperties = { ...style, justifyContent, alignItems, flexDirection };
  return (
    <div className={className} style={{ ...defaultStyles, ...styles }}>
      {children}
    </div>
  );
}

export default GradingFlex;
