import React, { useEffect, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import 'ag-grid-community/styles/ag-theme-alpine.css';

import "src/styles/Leaderboard.scss";
import default_avatar from "../../../assets/default-avatar.jpg";
import leaderboard_background from "../../../assets/leaderboard_background.jpg";

import { useTypedSelector } from 'src/commons/utils/Hooks';
import { Role } from '../../../commons/application/ApplicationTypes';
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router";
import LeaderboardActions from "src/features/leaderboard/LeaderboardActions";
import { ContestLeaderboardRow, LeaderboardContestDetails } from "src/features/leaderboard/LeaderboardTypes";

import LeaderboardDropdown from "./LeaderboardDropdown";

type Props = {
    type: string;
    contestID: number;
}

const ContestLeaderboard: React.FC<Props> = ({type, contestID}) => {

    const courseID = useTypedSelector(store => store.session.courseId);
    const dispatch = useDispatch();
    // Retrieve Contest Score Data from store
    const rankedLeaderboard: ContestLeaderboardRow[] = useTypedSelector(store =>
                                                                            (
                                                                                type === "score"
                                                                                ? store.leaderboard.contestScore
                                                                                : store.leaderboard.contestPopularVote
                                                                            ));
    useEffect(() => {
        type === "score"
            ? dispatch(LeaderboardActions.getAllContestScores(contestID))
            : dispatch(LeaderboardActions.getAllContestPopularVotes(contestID));
    }, [dispatch, contestID, type]); 

    // Retrieve contests (For dropdown)
    const contestAssessments = useTypedSelector(store => store.session.assessmentOverviews);

    const contestDetails: LeaderboardContestDetails[] = 
        (contestAssessments ?? [])
        .filter(assessment => assessment.type === "Contests")
        .map(contest => ({
        contest_id: contest.id,
        title: contest.title,
        published: contest.isPublished
        }));
        
    // Temporary loading of leaderboard background
    useEffect(() => {
        const originalBackground = document.body.style.background;
        document.body.style.background = `url(${leaderboard_background}) center/cover no-repeat fixed`;
        return () => { // Cleanup
        document.body.style.background = originalBackground;
        };
    }, []);

    // Display constants
    const visibleEntries = 10;
    const top3 = rankedLeaderboard.filter(x => x.rank <= 3);
    const rest = rankedLeaderboard.filter(x => (x.rank <= Number(visibleEntries) && x.rank > 3));

    const role = useTypedSelector(state => state.session.role!);

    const exportCSV = () => {
        const headers = ["Rank", "Name", "Username", "Score", "Submission ID"];
        const rows = rankedLeaderboard.map(player => [
            player.rank,
            player.name,
            player.username,
            player.score,
            player.submissionId
        ]);
    
        // Combine headers and rows
        const csvContent = [
            headers.join(","),
            ...rows.map(row => row.join(",")),
        ].join("\n");
    
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `contest ${type} leaderboard.csv`; // Filename for download
        link.click();
    };

    // const workspaceLocation = 'assessment';
    const navigate = useNavigate();
    const handleLinkClick = (code: string, votingId: number) => {
        dispatch(LeaderboardActions.saveCode(code));
        navigate(`/courses/${courseID}/contests/${votingId}/0`);        
    };

    // Define column definitions for ag-Grid
    const columnDefs: ColDef<ContestLeaderboardRow>[] = useMemo(() => [
        { 
            field: "rank",
            suppressMovable: true,
            headerName: "Rank", 
            width: 84, 
            sortable: true,
            cellRenderer: (params: any) => {
                const rank = params.value;
                const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "";
                return `${rank} ${medal}`;
            }
        },
        { 
            field: "avatar",
            suppressMovable: true,
            headerName: "Avatar", 
            width: 180, 
            sortable: false,
            cellRenderer: (params: any) => (
                <img 
                    src={params.value} 
                    alt="avatar" 
                    className="avatar" 
                    onError={(e) => (e.currentTarget.src = default_avatar)} 
                    style={{ width: "40px", height: "40px", borderRadius: "50%" }} 
                />
            ) 
        },
        { field: "name", suppressMovable: true, headerName: "Name", width: 520, sortable: true},
        { field: "score", suppressMovable: true, headerName: "Score", width: 154, sortable: true, valueFormatter: (params) => params.value?.toFixed(2) },
        { 
            field: "code", 
            suppressMovable: true, 
            headerName: "Code", 
            width: 260,
            sortable: false,
            cellRenderer: (params: any) => (
                <a
                    href="code"
                    onClick={(e) => {
                        e.preventDefault();
                        handleLinkClick(params.data.code, params.data.votingId);
                    }}
                    style={{ color: "white", fontStyle: "italic" }}
                >
                    🔗 Open Code
                </a>
            )
        }
    ], []);

    return (
        <div className="leaderboard-container">
            {/* Top 3 Ranking */}
            <div className="top-three">
                {top3
                .slice(0, 3)
                .map((player, index) => (
                    <div key={player.username} className={`top-player ${player.rank === 1 ? "first" : player.rank === 2 ? "second" : "third"}`}>
                        <p className="player-name">{player.name}</p>
                        <div className="player-bar">
                            <p className="player-rank">{player.rank}</p>
                            <p className="player-xp">{player.score.toFixed(2)} </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="buttons-container">
                {/* Leaderboard Options Dropdown */}
                <LeaderboardDropdown contests={contestDetails} />

                {/* Export Button */}
                {(role === Role.Admin || role === Role.Staff) ? (
                    <button onClick={exportCSV} className="export-button">
                        Export as .csv
                    </button>
                ) : ""}
            </div>

            {/* Leaderboard Table (Top 3) */}
            <div className="ag-theme-alpine">
                <h2>Contest Winners</h2>
                <AgGridReact
                    rowData={top3}
                    columnDefs={columnDefs}
                    domLayout="autoHeight"
                    rowHeight={60}
                />
            </div>

            <div className="table-gap"></div>

            {/* Honourable Mentions */}
            <div className="ag-theme-alpine">
                <h2>Honourable Mentions</h2>
                <AgGridReact
                    rowData={rest}
                    columnDefs={columnDefs}
                    domLayout="autoHeight"
                    rowHeight={60}
                />
            </div>
        </div>
    )
};

// react-router lazy loading
// https://reactrouter.com/en/main/route/lazy
export const Component = ContestLeaderboard;
Component.displayName = 'ContestLeaderboard';

export default ContestLeaderboard;