import React, { useMemo } from 'react';

import { ContestEntry } from '../assessment/AssessmentTypes';
import SideContentContestEntryCard from './SideContentContestEntryCard';

export type SideContentContestVotingProps = DispatchProps & StateProps

type DispatchProps = {
    handleContestEntryClick: (studentUsername: string, program: string) => void
}; 

type StateProps = {
    contestEntries: ContestEntry[]
}

const SideContentContestVoting : React.FunctionComponent<SideContentContestVotingProps> = props => {
    const { contestEntries, handleContestEntryClick } = props; 

    const contestEntryCards = useMemo(
        () => contestEntries.map((contestEntry: ContestEntry) => (
            <SideContentContestEntryCard 
                key={contestEntry.studentUsername}
                handleContestEntryClick={handleContestEntryClick}
                contestEntry={contestEntry}
            />
        )
    ), [contestEntries, handleContestEntryClick])
    
    return (
        <div>
            <span>I'm the contests voting tab!</span>
            {contestEntryCards}
        </div>
    )
};

export default SideContentContestVoting;