import { Classes } from '@blueprintjs/core';
import classNames from 'classnames';

type PeripheralContainerProps = {
  src: string | React.ReactElement;
  alt?: string;
  text?: string;
};

const PeripheralContainer: React.FC<PeripheralContainerProps> = ({ src, alt = 'Image', text }) => {
  return (
    <div className="col-xs-3">
      <div
        className={classNames(Classes.ELEVATION_0)}
        style={{ textAlign: 'center', padding: 12, backgroundColor: '#2f343c' }}
      >
        {typeof src == 'string' ? <img style={{ maxWidth: 72 }} src={src} alt={alt} /> : src}
        <span style={{ whiteSpace: 'pre-wrap' }}>{text}</span>
      </div>
    </div>
  );
};

export default PeripheralContainer;
