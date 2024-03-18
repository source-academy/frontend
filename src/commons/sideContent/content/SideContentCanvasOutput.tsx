import React, { useEffect, useRef } from 'react';

type Props = {
  canvas: HTMLCanvasElement;
};

/**
 * Takes the output of the rendered graphics (in a hidden canvas tag under <body>)
 * and makes it into a new <canvas> output for viewing.
 */
const SideContentCanvasOutput: React.FC<Props> = ({ canvas }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    parentRef.current!.appendChild(canvas);
    canvas.hidden = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={parentRef} className="canvas-container" />;
};

export default SideContentCanvasOutput;
