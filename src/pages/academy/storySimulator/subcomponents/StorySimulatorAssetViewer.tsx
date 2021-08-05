import { memo } from 'react';
import { Constants } from 'src/features/game/commons/CommonConstants';
import { toS3Path } from 'src/features/game/utils/GameUtils';

type AssetProps = {
  assetPath: string;
};

/**
 * This file renders one asset path so that story writers can preview
 * the asset
 *
 * @assetPath - the asset to render/preview
 */
const AssetViewer = memo(({ assetPath }: AssetProps) => {
  const displayAssetPath = assetPath || Constants.defaultAssetPath;
  return (
    <>
      <img
        alt="asset"
        crossOrigin={'anonymous'}
        src={toS3Path(displayAssetPath, !!assetPath)}
        width="150px"
        onError={e => {
          (e.target as any).onerror = null;
          (e.target as any).src = toS3Path(Constants.defaultAssetPath, false);
        }}
      ></img>
    </>
  );
});

export default AssetViewer;
