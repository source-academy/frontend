import React from 'react';

import { Icon } from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';

export type DispatchProps = {};

export type StateProps = {};

class Achievement extends React.Component {
  public render() {
    return  (
    <div className='Achievements'>
        <div className='achievement-main'>
           <div className='icons'> 
            <div> </div> 
                <AchievementCategory 
                    icon={IconNames.GLOBE}
                    category={'ALL'}
                    missions={22}
                />
                                <AchievementCategory 
                    icon={IconNames.LOCATE}
                    category={'ACTIVE'}
                    missions={15}
                />
                                <AchievementCategory 
                    icon={IconNames.ENDORSED}
                    category={'COMPLETED'}
                    missions={7}
                />
                
            </div> 
        </div>
    </div> 
    );
  }
}

type AchievementCategoryProps = {
    icon: any; 
    category: string;
    missions: number;
};

class AchievementCategory extends React.Component<AchievementCategoryProps> {
    public constructor(props: AchievementCategoryProps) {
        super(props);
      }

    public render() {
        const { icon, category, missions } = this.props;
        return (
            <div>
                <div> 
                    <Icon color={'#ffffff'} iconSize={44} icon={icon} /> 
                    <br />
                    {category} ({missions})
                </div> 
            </div>
        );
    }
}

export default Achievement;
