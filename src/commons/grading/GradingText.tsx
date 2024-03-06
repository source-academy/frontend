import { Text } from "@blueprintjs/core";

type GradingTextProps = {
  children?: React.ReactNode;
  style?: React.CSSProperties;
  secondaryText?: boolean;
  className?: string;
} & React.RefAttributes<HTMLDivElement>;

const GradingText: React.FC<GradingTextProps> = ({ children, style, secondaryText, className = "", }: GradingTextProps) => {
  const defaultStyle: React.CSSProperties = {
    width: "max-content",
    margin: "auto 0"
  };

  return (
    <Text 
      className={"bp5-ui-text " + className + (secondaryText ? " bp5-text-muted" : "")} 
      style={{...defaultStyle, ...style}}
    >
      {children}
    </Text>
  );
}

export default GradingText;