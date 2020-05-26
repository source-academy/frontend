import { GameState, Role, Story } from 'src/commons/application/ApplicationTypes';
import {
    Assessment,
    AssessmentOverview,
} from 'src/commons/assessment/AssessmentTypes';
import { Notification } from 'src/commons/notificationBadge/NotificationBadgeTypes';
import { Announcement } from 'src/components/Announcements'; // TODO: Remove
import { DirectoryData, MaterialData } from 'src/components/material/materialShape'; // TODO: Remove
import { Grading, GradingOverview } from 'src/features/grading/GradingTypes';
import { HistoryHelper } from 'src/utils/history';

export type SessionState = {
    readonly accessToken?: string;
    readonly assessmentOverviews?: AssessmentOverview[];
    readonly assessments: Map<number, Assessment>;
    readonly announcements?: Announcement[]; // TODO: Remove
    readonly grade: number;
    readonly gradingOverviews?: GradingOverview[];
    readonly gradings: Map<number, Grading>;
    readonly group: string | null;
    readonly historyHelper: HistoryHelper;
    readonly materialDirectoryTree: DirectoryData[] | null;
    readonly materialIndex: MaterialData[] | null;
    readonly maxGrade: number;
    readonly maxXp: number;
    readonly refreshToken?: string;
    readonly role?: Role;
    readonly story: Story;
    readonly gameState: GameState;
    readonly name?: string;
    readonly xp: number;
    readonly notifications: Notification[];
};