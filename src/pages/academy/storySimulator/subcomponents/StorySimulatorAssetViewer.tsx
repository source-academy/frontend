import React, { memo } from 'react';
import { Constants } from 'src/features/game/commons/CommonConstants';

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
        src={Constants.assetsFolder + displayAssetPath}
        width="150px"
      ></img>
    </>
  );
});

export default AssetViewer;
