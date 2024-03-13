declare const twJustifyContentValues: readonly ["justify-start", "justify-end", "justify-center", "justify-between", "justify-around", "justify-evenly"];
declare type JustifyContent = typeof twJustifyContentValues[number];
declare const twAlignItemsValues: readonly ["items-start", "items-end", "items-center", "items-baseline", "items-stretch"];
declare type AlignItems = typeof twAlignItemsValues[number];
declare const twFlexDirectionValues: readonly ["row", "column"];
declare type FlexDirection = typeof twFlexDirectionValues[number];

type GradingFlexProps = {
    justifyContent?: JustifyContent;
    alignItems?: AlignItems;
    flexDirection?: FlexDirection;
    children?: React.ReactNode;
    style?: React.CSSProperties;
    className?: string;
} & React.RefAttributes<HTMLDivElement>;

const GradingFlex: React.FC<GradingFlexProps> = ({ justifyContent, alignItems, flexDirection, children, style, className, }: GradingFlexProps) => {
  const defaultStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: 
      (justifyContent === "justify-start"
        ? "flex-start"
        : justifyContent === "justify-end"
        ? "flex-end"
        : justifyContent === "justify-center"
        ? "center"
        : justifyContent === "justify-between"
        ? "space-between"
        : justifyContent === "justify-around"
        ? "space-around"
        : justifyContent === "justify-evenly"
        ? "space-evenly"
        : ""
      ),
    alignItems: 
      (alignItems === "items-start"
        ? "start"
        : alignItems === "items-end"
        ? "end"
        : alignItems === "items-center"
        ? "center"
        : alignItems === "items-baseline"
        ? "baseline"
        : ""
      ),
    flexDirection: flexDirection,
  };

  return (
    <div className={className} style={{...defaultStyle, ...style}}>
      {children}
    </div>
  );
}

export default GradingFlex;