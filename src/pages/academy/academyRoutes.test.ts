import { type LoaderFunction } from 'react-router';
import { vi } from 'vitest';

const getStateMock = vi.fn();

vi.mock('../createStore', () => ({
  store: {
    getState: getStateMock
  }
}));

describe('academyRoutes llmstats guard', () => {
  beforeEach(() => {
    getStateMock.mockReset();
    getStateMock.mockReturnValue({
      session: {
        role: 'student',
        enableGame: false,
        assessmentConfigurations: []
      }
    });
  });

  test('allows llmstats when role is admin and llm grading is enabled even if hasLlmContent is false', async () => {
    const { getAcademyRoutes } = await import('./academyRoutes');

    const routes = getAcademyRoutes();
    const llmStatsRoute = routes.find(route => route.path === 'llmstats');

    expect(llmStatsRoute).toBeDefined();
    expect(llmStatsRoute?.loader).toBeDefined();

    getStateMock.mockReturnValue({
      session: {
        role: 'admin',
        enableLlmGrading: true,
        hasLlmContent: false,
        enableGame: false,
        assessmentConfigurations: []
      }
    });

    const result = await (llmStatsRoute!.loader as LoaderFunction)({} as any);

    expect(result).toBeNull();
  });

  test('allows llmstats when role is admin and both flags are true', async () => {
    const { getAcademyRoutes } = await import('./academyRoutes');

    const routes = getAcademyRoutes();
    const llmStatsRoute = routes.find(route => route.path === 'llmstats');

    expect(llmStatsRoute).toBeDefined();
    expect(llmStatsRoute?.loader).toBeDefined();

    getStateMock.mockReturnValue({
      session: {
        role: 'admin',
        enableLlmGrading: true,
        hasLlmContent: true,
        enableGame: false,
        assessmentConfigurations: []
      }
    });

    const result = await (llmStatsRoute!.loader as LoaderFunction)({} as any);

    expect(result).toBeNull();
  });

  test('allows llmstats when hasLlmContent is still loading', async () => {
    const { getAcademyRoutes } = await import('./academyRoutes');

    const routes = getAcademyRoutes();
    const llmStatsRoute = routes.find(route => route.path === 'llmstats');

    expect(llmStatsRoute).toBeDefined();
    expect(llmStatsRoute?.loader).toBeDefined();

    getStateMock.mockReturnValue({
      session: {
        role: 'admin',
        enableLlmGrading: true,
        hasLlmContent: undefined,
        enableGame: false,
        assessmentConfigurations: []
      }
    });

    const result = await (llmStatsRoute!.loader as LoaderFunction)({} as any);

    expect(result).toBeNull();
  });

  test('redirects from llmstats when llm grading is disabled', async () => {
    const { getAcademyRoutes } = await import('./academyRoutes');

    const routes = getAcademyRoutes();
    const llmStatsRoute = routes.find(route => route.path === 'llmstats');

    expect(llmStatsRoute).toBeDefined();
    expect(llmStatsRoute?.loader).toBeDefined();

    getStateMock.mockReturnValue({
      session: {
        role: 'admin',
        enableLlmGrading: false,
        hasLlmContent: true,
        enableGame: false,
        assessmentConfigurations: []
      }
    });

    const result = await (llmStatsRoute!.loader as LoaderFunction)({} as any);

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(302);
    expect((result as Response).headers.get('Location')).toBe('not_found');
  });

  test('redirects from llmstats when user is not admin even if llm grading is enabled', async () => {
    const { getAcademyRoutes } = await import('./academyRoutes');

    const routes = getAcademyRoutes();
    const llmStatsRoute = routes.find(route => route.path === 'llmstats');

    expect(llmStatsRoute).toBeDefined();
    expect(llmStatsRoute?.loader).toBeDefined();

    getStateMock.mockReturnValue({
      session: {
        role: 'staff',
        enableLlmGrading: true,
        hasLlmContent: true,
        enableGame: false,
        assessmentConfigurations: []
      }
    });

    const result = await (llmStatsRoute!.loader as LoaderFunction)({} as any);

    expect(result).toBeInstanceOf(Response);
    expect((result as Response).status).toBe(302);
    expect((result as Response).headers.get('Location')).toBe('not_found');
  });
});
