import {
  Button,
  Card,
  Dialog,
  DialogBody,
  Divider,
  H3,
  H4,
  H5,
  Icon,
  Intent,
  NonIdealState,
  Spinner,
  SpinnerSize,
  Tag
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTokens } from 'src/commons/utils/Hooks';

import {
  getLLMAssessmentStats,
  getLLMFeedback,
  getLLMQuestionStats
} from '../../../../commons/sagas/RequestsSaga';
import { getPrettyDate } from '../../../../commons/utils/DateHelper';

// =====================
// Types
// =====================
type QuestionStat = {
  question_id: number;
  display_order: number;
  total_uses: number;
  unique_submissions: number;
  unique_users: number;
};

type AssessmentStats = {
  total_uses: number;
  unique_submissions: number;
  unique_users: number;
  questions: QuestionStat[];
  llm_total_cost?: string | number;
  llm_total_input_tokens?: number;
  llm_total_output_tokens?: number;
  llm_total_cached_tokens?: number;
};

type QuestionDetailStats = {
  total_uses: number;
  unique_submissions: number;
  unique_users: number;
};

type FeedbackEntry = {
  id: number;
  rating: number | null;
  body: string;
  user_name: string;
  question_id: number | null;
  inserted_at: string;
};

// =====================
// Stat Card
// =====================
const StatCard: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <Card style={{ flex: 1, textAlign: 'center', padding: '12px', minWidth: '140px' }}>
    <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#2965cc' }}>{value}</div>
    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>{label}</div>
  </Card>
);

// =====================
// Rating Stars
// =====================
const RatingStars: React.FC<{ rating: number | null }> = ({ rating }) => {
  if (rating === null || rating === undefined) return <span style={{ color: '#888' }}>N/A</span>;
  return (
    <span>
      {Array.from({ length: 5 }, (_, i) => (
        <Icon
          key={i}
          icon={i < rating ? IconNames.STAR : IconNames.STAR_EMPTY}
          style={{ color: i < rating ? '#f5a623' : '#ccc' }}
          size={14}
        />
      ))}
    </span>
  );
};

// =====================
// Feedback List
// =====================
const FeedbackList: React.FC<{
  feedback: FeedbackEntry[];
  loading: boolean;
  emptyMessage: string;
  getTaskLabel?: (questionId: number) => string;
}> = ({ feedback, loading, emptyMessage, getTaskLabel }) => {
  if (loading) return <Spinner size={SpinnerSize.SMALL} />;
  if (feedback.length === 0) {
    return <p style={{ color: '#888', fontStyle: 'italic' }}>{emptyMessage}</p>;
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {feedback.map(f => (
        <Card key={f.id} style={{ padding: '10px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '4px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontWeight: 'bold' }}>{f.user_name}</span>
              {f.question_id !== null && (
                <Tag minimal intent={Intent.PRIMARY} style={{ fontSize: '10px' }}>
                  {getTaskLabel ? getTaskLabel(f.question_id) : `Task ${f.question_id}`}
                </Tag>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <RatingStars rating={f.rating} />
              <span style={{ fontSize: '11px', color: '#888' }}>
                {getPrettyDate(f.inserted_at)}
              </span>
            </div>
          </div>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{f.body}</p>
        </Card>
      ))}
    </div>
  );
};

// =====================
// Main Dialog Component
// =====================
type LLMStatsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  assessmentId: number;
  assessmentTitle: string;
  //for cost tracking
  llmTotalInputTokens?: number;
  llmTotalOutputTokens?: number;
  llmTotalCachedTokens?: number;
  llmTotalCost?: string | number;
};

const LLMStatsDialog: React.FC<LLMStatsDialogProps> = ({
  isOpen,
  onClose,
  assessmentId,
  assessmentTitle,
  llmTotalInputTokens,
  llmTotalOutputTokens,
  llmTotalCachedTokens,
  llmTotalCost
}) => {
  const tokens = useTokens();
  const tokensRef = useRef(tokens);
  tokensRef.current = tokens;

  // Assessment-level state
  const [stats, setStats] = useState<AssessmentStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackEntry[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  // Task (question) drill-down state
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionStat | null>(null);
  const [questionDetail, setQuestionDetail] = useState<QuestionDetailStats | null>(null);
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionFeedback, setQuestionFeedback] = useState<FeedbackEntry[]>([]);
  const [questionFeedbackLoading, setQuestionFeedbackLoading] = useState(false);

  const questionDisplayOrderById = React.useMemo(() => {
    const map = new Map<number, number>();
    stats?.questions.forEach(q => map.set(q.question_id, q.display_order));
    return map;
  }, [stats]);

  // Fetch assessment-level stats + feedback
  const fetchAssessmentData = useCallback(async () => {
    setLoading(true);
    setFeedbackLoading(true);

    const [statsData, feedbackData] = await Promise.all([
      getLLMAssessmentStats(tokensRef.current, assessmentId),
      getLLMFeedback(tokensRef.current, assessmentId)
    ]);

    setStats(statsData);
    setFeedback(feedbackData || []);
    setLoading(false);
    setFeedbackLoading(false);
  }, [assessmentId]);

  useEffect(() => {
    if (isOpen) {
      fetchAssessmentData();
      setSelectedQuestion(null);
      setQuestionDetail(null);
    }
  }, [isOpen, fetchAssessmentData]);

  // Drill into a specific task
  const handleSelectQuestion = useCallback(
    async (question: QuestionStat) => {
      setSelectedQuestion(question);
      setQuestionLoading(true);
      setQuestionFeedbackLoading(true);

      const [qStats, qFeedback] = await Promise.all([
        getLLMQuestionStats(tokensRef.current, assessmentId, question.question_id),
        getLLMFeedback(tokensRef.current, assessmentId, question.question_id)
      ]);

      setQuestionDetail(qStats);
      setQuestionFeedback(qFeedback || []);
      setQuestionLoading(false);
      setQuestionFeedbackLoading(false);
    },
    [assessmentId]
  );

  const handleBackToAssessment = useCallback(() => {
    setSelectedQuestion(null);
    setQuestionDetail(null);
    setQuestionFeedback([]);
  }, []);

  return (
    <Dialog
      icon={IconNames.CHART}
      isOpen={isOpen}
      onClose={onClose}
      title={`LLM Statistics — ${assessmentTitle}`}
      canOutsideClickClose={true}
      style={{ width: '700px', maxHeight: '80vh' }}
    >
      <DialogBody style={{ maxHeight: '70vh', overflowY: 'auto' }}>
        {loading ? (
          <NonIdealState
            description="Loading statistics..."
            icon={<Spinner size={SpinnerSize.LARGE} />}
          />
        ) : !stats ? (
          <NonIdealState description="Failed to load statistics" icon={IconNames.ERROR} />
        ) : selectedQuestion ? (
          // ============ Task (Question) Detail View ============
          <div>
            <Button
              icon={IconNames.ARROW_LEFT}
              minimal
              onClick={handleBackToAssessment}
              style={{ marginBottom: '12px' }}
            >
              Back to assessment
            </Button>
            <H3>Task {selectedQuestion.display_order}</H3>
            <Divider />

            {questionLoading ? (
              <Spinner size={SpinnerSize.STANDARD} />
            ) : questionDetail ? (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
                <StatCard label="Total Uses" value={questionDetail.total_uses} />
                <StatCard label="Unique Submissions" value={questionDetail.unique_submissions} />
                <StatCard label="Unique Users" value={questionDetail.unique_users} />
              </div>
            ) : (
              <NonIdealState description="No data for this task" icon={IconNames.SEARCH} />
            )}

            {/* Task-specific feedback */}
            <Divider style={{ margin: '16px 0' }} />
            <H4>Task Feedback</H4>
            <FeedbackList
              feedback={questionFeedback}
              loading={questionFeedbackLoading}
              emptyMessage="No feedback received for this task."
              getTaskLabel={() => `Task ${selectedQuestion.display_order}`}
            />
          </div>
        ) : (
          // ============ Assessment Overview ============
          <div>
            {/* Summary Stats */}
            <H5>Overview</H5>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
              <StatCard label="Total Uses" value={stats.total_uses} />
              <StatCard label="Unique Submissions" value={stats.unique_submissions} />
              <StatCard label="Unique Users" value={stats.unique_users} />
            </div>

            <Divider style={{ margin: '20px 0' }} />

            {/* LLM Usage & Cost */}
            <H5>LLM Usage & Cost</H5>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px' }}>
              <Card
                style={{
                  flex: 1,
                  textAlign: 'center',
                  padding: '12px',
                  minWidth: '140px',
                  borderTop: '3px solid #0F9960'
                }}
              >
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0F9960' }}>
                  {/* Read from stats first, fallback to props, then 0 */}
                  {`$${parseFloat(String(stats.llm_total_cost ?? llmTotalCost ?? 0)).toFixed(4)}`}
                </div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                  Total Cost (SGD)
                </div>
              </Card>
              <StatCard
                label="Standard Input"
                value={(stats.llm_total_input_tokens ?? llmTotalInputTokens ?? 0).toLocaleString()}
              />
              <StatCard
                label="Cached (Saved)"
                value={(
                  stats.llm_total_cached_tokens ??
                  llmTotalCachedTokens ??
                  0
                ).toLocaleString()}
              />
              <StatCard
                label="Output Tokens"
                value={(
                  stats.llm_total_output_tokens ??
                  llmTotalOutputTokens ??
                  0
                ).toLocaleString()}
              />
            </div>

            {/* Task List */}
            <Divider style={{ margin: '16px 0' }} />
            <H4>Tasks</H4>
            {stats.questions.length === 0 ? (
              <p style={{ color: '#888', fontStyle: 'italic' }}>
                No LLM usage data for any tasks yet.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {stats.questions.map(q => (
                  <Card
                    key={q.question_id}
                    interactive
                    onClick={() => handleSelectQuestion(q)}
                    style={{
                      padding: '10px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}
                  >
                    <div>
                      <strong>Task {q.display_order}</strong>
                      <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                        {q.total_uses} uses &middot; {q.unique_submissions} submissions &middot;{' '}
                        {q.unique_users} users
                      </div>
                    </div>
                    <Icon icon={IconNames.CHEVRON_RIGHT} />
                  </Card>
                ))}
              </div>
            )}

            {/* Assessment-level Feedback */}
            <Divider style={{ margin: '16px 0' }} />
            <H4>Feedback</H4>
            <FeedbackList
              feedback={feedback}
              loading={feedbackLoading}
              emptyMessage="No feedback received for this assessment."
              getTaskLabel={questionId => {
                const displayOrder = questionDisplayOrderById.get(questionId);
                return displayOrder ? `Task ${displayOrder}` : `Task ${questionId}`;
              }}
            />
          </div>
        )}
      </DialogBody>
    </Dialog>
  );
};

export default LLMStatsDialog;
