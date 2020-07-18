import React, { memo } from 'react';
import { Constants } from 'src/features/game/commons/CommonConstants';

type AssetProps = {
  assetPath: string;
};

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
