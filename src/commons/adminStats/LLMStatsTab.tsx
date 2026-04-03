import {
  Button,
  Card,
  Divider,
  H3,
  H4,
  Icon,
  Intent,
  NonIdealState,
  Spinner,
  SpinnerSize,
  Tag
} from '@blueprintjs/core';
import { IconNames } from '@blueprintjs/icons';
import React, { useEffect, useMemo, useState } from 'react';

import { LLMAssessmentStat, LLMCourseStat, LLMQuestionStat } from '../assessment/AssessmentTypes';
import { getLLMCourseStats } from '../sagas/RequestsSaga';
import { useTokens } from '../utils/Hooks';

const formatNumber = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '0';
  }
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? value : parsed.toLocaleString();
  }
  return value.toLocaleString();
};

const formatCost = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '$0.00';
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    return `${value}`;
  }
  return `$${parsed.toFixed(2)}`;
};

const getTotalTokens = (assessment: LLMAssessmentStat): number => {
  return (assessment.llm_total_input_tokens || 0) + (assessment.llm_total_output_tokens || 0);
};

const getQuestionTotalTokens = (question: LLMQuestionStat): number => {
  return (question.llm_total_input_tokens || 0) + (question.llm_total_output_tokens || 0);
};

const LLMStatsTab: React.FC = () => {
  const { accessToken, refreshToken } = useTokens();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<LLMCourseStat | null>(null);
  const [sortKey, setSortKey] = useState<
    'title' | 'category' | 'total_uses' | 'total_tokens' | 'llm_total_cost' | 'avg_rating'
  >('llm_total_cost');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const resp = await getLLMCourseStats({ accessToken, refreshToken });
        if (!resp) {
          setError('Failed to load LLM statistics.');
        } else {
          setData(resp);
        }
      } catch (err) {
        setError('Failed to load LLM statistics.');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [accessToken, refreshToken]);

  const sortedAssessments: LLMAssessmentStat[] = useMemo(() => {
    if (!data?.assessments) {
      return [];
    }

    const assessments = [...data.assessments];
    const compare = (a: LLMAssessmentStat, b: LLMAssessmentStat): number => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      switch (sortKey) {
        case 'title':
          return direction * a.title.localeCompare(b.title);
        case 'category':
          return direction * a.category.localeCompare(b.category);
        case 'total_uses':
          return direction * (a.total_uses - b.total_uses);
        case 'avg_rating':
          return direction * ((a.avg_rating || 0) - (b.avg_rating || 0));
        case 'llm_total_cost':
          return direction * (Number(a.llm_total_cost || 0) - Number(b.llm_total_cost || 0));
        case 'total_tokens':
          return direction * (getTotalTokens(a) - getTotalTokens(b));
        default:
          return 0;
      }
    };

    return assessments.sort(compare);
  }, [data, sortKey, sortDirection]);

  const toggleSort = (key: typeof sortKey) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('desc');
    }
  };

  const toggleRow = (assessmentId: number) => {
    const next = new Set(expanded);
    if (next.has(assessmentId)) {
      next.delete(assessmentId);
    } else {
      next.add(assessmentId);
    }
    setExpanded(next);
  };

  const downloadReport = () => {
    if (!data) {
      return;
    }

    const headers = [
      'Assessment Title',
      'Category',
      'Question Number',
      'Uses',
      'Input Tokens',
      'Output Tokens',
      'Total Tokens',
      'Cost',
      'Avg Rating'
    ];

    const rows: string[] = [];
    data.assessments.forEach(assessment => {
      if (assessment.questions.length === 0) {
        rows.push(
          [
            assessment.title,
            assessment.category,
            '',
            assessment.total_uses.toString(),
            assessment.llm_total_input_tokens.toString(),
            assessment.llm_total_output_tokens.toString(),
            getTotalTokens(assessment).toString(),
            Number(assessment.llm_total_cost || 0).toFixed(6),
            assessment.avg_rating?.toString() ?? ''
          ].join(',')
        );
      } else {
        assessment.questions.forEach(question => {
          rows.push(
            [
              assessment.title,
              assessment.category,
              question.display_order.toString(),
              question.total_uses.toString(),
              question.llm_total_input_tokens.toString(),
              question.llm_total_output_tokens.toString(),
              getQuestionTotalTokens(question).toString(),
              Number(question.llm_total_cost || 0).toFixed(6),
              question.avg_rating?.toString() ?? ''
            ].join(',')
          );
        });
      }
    });

    const content = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.setAttribute('download', 'llm_stats_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Spinner size={SpinnerSize.STANDARD} />
      </div>
    );
  }

  if (error) {
    return (
      <NonIdealState
        icon={IconNames.ERROR}
        title="Unable to load LLM statistics"
        description={error}
      />
    );
  }

  if (!data || data.assessments.length === 0) {
    return (
      <NonIdealState
        icon={IconNames.CHART}
        title="No LLM usage data yet"
        description="Once students start generating comments, this panel will show LLM statistics."
      />
    );
  }

  return (
    <div style={{ padding: '14px' }}>
      <div style={{ display: 'flex', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <Card style={{ flex: 1, textAlign: 'center' }}>
          <H3 style={{ margin: 0 }}>{formatNumber(data.course_total_input_tokens)}</H3>
          <div>Course-wide Input Tokens</div>
        </Card>
        <Card style={{ flex: 1, textAlign: 'center' }}>
          <H3 style={{ margin: 0 }}>{formatNumber(data.course_total_output_tokens)}</H3>
          <div>Course-wide Output Tokens</div>
        </Card>
        <Card style={{ flex: 1, textAlign: 'center' }}>
          <H3 style={{ margin: 0 }}>{formatCost(data.course_total_cost)}</H3>
          <div>Total LLM Expenditure</div>
        </Card>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <H4 style={{ margin: '8px 0' }}>Assessments</H4>
        <Button icon={IconNames.DOWNLOAD} intent={Intent.PRIMARY} onClick={downloadReport}>
          Download Report
        </Button>
      </div>

      <table
        className="bp3-html-table bp3-html-table-striped bp3-html-table-condensed"
        style={{ width: '100%', marginTop: '8px' }}
      >
        <thead>
          <tr>
            <th>
              <Button minimal={true} small={true} onClick={() => toggleSort('title')}>
                Title
              </Button>
            </th>
            <th>
              <Button minimal={true} small={true} onClick={() => toggleSort('category')}>
                Category
              </Button>
            </th>
            <th>
              <Button minimal={true} small={true} onClick={() => toggleSort('total_uses')}>
                Uses
              </Button>
            </th>
            <th>
              <Button minimal={true} small={true} onClick={() => toggleSort('total_tokens')}>
                Total Tokens
              </Button>
            </th>
            <th>
              <Button minimal={true} small={true} onClick={() => toggleSort('llm_total_cost')}>
                Total Cost
              </Button>
            </th>
            <th>
              <Button minimal={true} small={true} onClick={() => toggleSort('avg_rating')}>
                Avg Rating
              </Button>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedAssessments.map(assessment => {
            const isExpanded = expanded.has(assessment.assessment_id);
            return (
              <React.Fragment key={assessment.assessment_id}>
                <tr
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleRow(assessment.assessment_id)}
                >
                  <td>
                    <span style={{ marginRight: '6px' }}>
                      <Icon icon={isExpanded ? IconNames.CARET_DOWN : IconNames.CARET_RIGHT} />
                    </span>
                    {assessment.title}
                  </td>
                  <td>{assessment.category}</td>
                  <td>{assessment.total_uses}</td>
                  <td>{formatNumber(getTotalTokens(assessment))}</td>
                  <td>{formatCost(assessment.llm_total_cost)}</td>
                  <td>
                    {assessment.avg_rating === null || assessment.avg_rating === undefined
                      ? 'N/A'
                      : assessment.avg_rating.toFixed(2)}
                  </td>
                </tr>
                {isExpanded && assessment.questions.length > 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 0, background: '#f3f3f3' }}>
                      <div style={{ padding: '8px' }}>
                        <table
                          className="bp3-html-table bp3-html-table-condensed"
                          style={{ width: '100%' }}
                        >
                          <thead>
                            <tr>
                              <th>Question</th>
                              <th>Uses</th>
                              <th>Tokens</th>
                              <th>Cost</th>
                              <th>Avg Rating</th>
                            </tr>
                          </thead>
                          <tbody>
                            {assessment.questions.map(question => (
                              <tr key={question.question_id}>
                                <td>{question.display_order}</td>
                                <td>{question.total_uses}</td>
                                <td>{formatNumber(getQuestionTotalTokens(question))}</td>
                                <td>{formatCost(question.llm_total_cost)}</td>
                                <td>
                                  {question.avg_rating === null || question.avg_rating === undefined
                                    ? 'N/A'
                                    : question.avg_rating.toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>

      <Divider style={{ marginTop: '16px' }} />

      <Tag minimal intent={Intent.PRIMARY} style={{ marginTop: '8px' }}>
        Data is shown for published assessments and questions with LLM prompts.
      </Tag>
    </div>
  );
};

export default LLMStatsTab;
