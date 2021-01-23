import React, { useState } from 'react';

import { ContestEntry, ContestVotingSubmission } from '../assessment/AssessmentTypes';
import SideContentContestVoting from './SideContentContestVoting'

export type SideContentContestVoterContainerProps = DispatchProps & StateProps; 

type DispatchProps = {
    handleContestEntryClick: (studentUsername: string, program: string) => void
}; 

type StateProps = {
    contestEntries: ContestEntry[]
}

/**
 * Container to separate behaviour concerns from rendering concerns 
 * Stores component-level voting ranking state 
 * (maybe handles API calls?)
 */
const SideContentContestVoterContainer: React.FunctionComponent<SideContentContestVoterContainerProps> = props => {
    const { contestEntries, handleContestEntryClick } = props;
    const [votingSubmission, setVotingSubmission]= useState<ContestVotingSubmission>({})

    // TODO: Fix backend call to fetch entries CORS error
    // TODO: Write Backend API call to submit VotingSubmission { } JSON Data
    // TODO: Write Backend API call to fetch ordered leaderboard entries (with names)
    // TODO: Validate VotingSubmission Data
    // TODO: Find a way to persist and incorportate submission of the data
    // TODO: Conditionally render tabs based on contest state (finished, pending)

    // Submitted to the backend as result
    const handleVotingSubmissionChange = (entryId: string, rank: number): void => {
        setVotingSubmission({...votingSubmission, [entryId]: rank})
    }

    return <SideContentContestVoting 
        handleContestEntryClick={handleContestEntryClick}
        handleVotingSubmissionChange={handleVotingSubmissionChange}
        votingSubmission={votingSubmission} 
        contestEntries={contestEntries} />; 
}

export default SideContentContestVoterContainer; 