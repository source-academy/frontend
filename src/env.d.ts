declare module '*.svg' {
  const content: string;
  export default content;
}
declare module '*.svg?react' {
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}
declare module '*.module.scss' {
  const content: { [className: string]: string };
  export default content;
}
declare module '*.jpg' {
  const content: string;
  export default content;
}
