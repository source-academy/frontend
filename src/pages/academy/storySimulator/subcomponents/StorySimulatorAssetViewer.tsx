import * as React from 'react';
import { Constants } from 'src/features/game/commons/CommonConstants';

type AssetProps = {
  assetPath: string;
};

function AssetViewer({ assetPath }: AssetProps) {
  return <img alt="asset" src={Constants.assetsFolder + assetPath} width="150px"></img>;
}

export default AssetViewer;
