import { Button, Classes } from '@blueprintjs/core';
import classNames from 'classnames';
import React, { useEffect, useRef } from 'react';

const SideContentToneMatrix: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if ((window as any).ToneMatrix) {
      (window as any).ToneMatrix.initialise_matrix(containerRef.current!);
    }
  }, []);

  const handleClear = () => {
    (window as any).ToneMatrix.clear_matrix();
  };

  const handleRandomise = () => {
    (window as any).ToneMatrix.randomise_matrix();
  };

  return (
    <div className="sa-tone-matrix">
      <div className="row">
        <div className={classNames('controls', 'col-xs-12', Classes.DARK, Classes.BUTTON_GROUP)}>
          <Button id="clear-matrix" onClick={handleClear}>
            Clear
          </Button>
          <Button id="randomise-matrix" onClick={handleRandomise}>
            Randomise
          </Button>
        </div>
      </div>
      <div className="row">
        <div className="col-xs-12" ref={containerRef} />
      </div>
    </div>
  );
};

export default React.memo(SideContentToneMatrix, () => true);
