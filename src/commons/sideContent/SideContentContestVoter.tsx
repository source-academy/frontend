import * as React from 'react';

import { ContestEntry } from '../assessment/AssessmentTypes';
import SideContentContestEntryCard from './SideContentContestEntryCard';

export type SideContentContestVotingProps = {}

const handleContestEntryClick = (studentUsername: string) => {
    console.log(`Voting for ${studentUsername}`)
}; 

const dummyEntry: ContestEntry = {
    studentUsername: 'e010000x',
    program: 'console.log(\'Hello World\')'
}

const SideContentContestVoting : React.FunctionComponent<SideContentContestVotingProps> = props => {
    return (
        <div>
            <span>I'm the contests voting tab!</span>
            <SideContentContestEntryCard 
                handleContestEntryClick={handleContestEntryClick}
                contestEntry={dummyEntry}
            />
        </div>
    )
};

export default SideContentContestVoting;