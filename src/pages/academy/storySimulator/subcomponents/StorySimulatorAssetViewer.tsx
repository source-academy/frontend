import * as React from 'react';
import { Constants } from 'src/features/game/commons/CommonConstants';

type AssetProps = {
  assetPath: string;
};

function AssetViewer({ assetPath }: AssetProps) {
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
}

export default AssetViewer;
