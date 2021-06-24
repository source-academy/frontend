import { act } from '@testing-library/react';
import { shallow } from 'enzyme';
import { useSelector } from 'react-redux';

import GitHubClassroom from '../GitHubClassroom';

type objectPerPage = {
  per_page: number;
};

async function listOrgsForAuthenticatedUser(orgProp: objectPerPage) {
  return {
    data: [
      { login: 'source-academy-course-test' },
      { login: 'not' },
      { login: 'source-academy-course-second' },
      { login: 'valid' },
      { login: 'source-academy-course-third' }
    ]
  };
}

async function listReposForAuthenticatedUser(repoProp: objectPerPage) {
  return {
    data: [
      { name: 'course-info', owner: { login: 'source-academy-course-test' } },
      { name: 'sa-test-mission', owner: { login: 'source-academy-course-test' } },
      { name: 'sa-demo-mission', owner: { login: 'source-academy-course-test' } },
      { name: 'sa-autotester-test', owner: { login: 'source-academy-course-test' } }
    ]
  };
}

const mockCourseInfo =
  'ewogICJDb3Vyc2VOYW1lIjogIkNTMTEwMVMiLAogICJ0eXBlcyI6CiAgWwogICAgewogICAgICAidHlwZU5hbWUiOiAiTm90TWlzc2lvbnMiLAogICAgICAiYXNzZXNzbWVudHMiOgogICAgICBbCiAgICAgICAgewogICAgICAgICAgImlkIjogIjEiLAogICAgICAgICAgInRpdGxlIjogIkN1cnZlIEludHJvZHVjdGlvbiIsCiAgICAgICAgICAib3BlbkF0IjogIjIwMjAtMTItMDFUMDA6MDA6MDArMDg6MDAiLAogICAgICAgICAgImNsb3NlQXQiOiAiMjAyMS0xMi0zMVQyMzo1OTo1OSswODowMCIsCiAgICAgICAgICAicHVibGlzaGVkIjogInllcyIsCiAgICAgICAgICAiY292ZXJJbWFnZSI6ICJodHRwczovL2kuaW1ndXIuY29tL3EyTzRpd2EucG5nIiwKICAgICAgICAgICJzaG9ydFN1bW1hcnkiOiAiSW4gdGhpcyBtaXNzaW9uLCB5b3UgZ2V0IGludHJvZHVjZWQgdG8gdmlzaWJsZSBmdW5jdGlvbnMsIGNhbGxlZCBDdXJ2ZXMhIiwKICAgICAgICAgICJhY2NlcHRMaW5rIjogImh0dHBzOi8vY2xhc3Nyb29tLmdpdGh1Yi5jb20vYS9QeUFVaGRmZSIsCiAgICAgICAgICAicmVwb1ByZWZpeCI6ICJzYS10ZXN0LW1pc3Npb24iCiAgICAgICAgfSwKICAgICAgICB7CiAgICAgICAgICAiaWQiOiAiMiIsCiAgICAgICAgICAidGl0bGUiOiAiRGVtbyBNaXNzaW9uIiwKICAgICAgICAgICJvcGVuQXQiOiAiMjAyMC0xMi0wMVQwMDowMDowMCswODowMCIsCiAgICAgICAgICAiY2xvc2VBdCI6ICIyMDIxLTEyLTMxVDIzOjU5OjU5KzA4OjAwIiwKICAgICAgICAgICJwdWJsaXNoZWQiOiAieWVzIiwKICAgICAgICAgICJjb3ZlckltYWdlIjogImh0dHBzOi8vYXZhdGFycy5naXRodWJ1c2VyY29udGVudC5jb20vdS8zNTYyMDcwNT9zPTQwMCZ1PTMyZjcyZmQxZDY1YTBkNjg3N2FkMWQ1ODcwZmZhMzI3ZGRhNzU0ZjEmdj00IiwKICAgICAgICAgICJzaG9ydFN1bW1hcnkiOiAiUXVpY2tzb3J0IGFzc2lnbm1lbnQgZGVzY3JpcHRpb24hIiwKICAgICAgICAgICJhY2NlcHRMaW5rIjogImh0dHBzOi8vY2xhc3Nyb29tLmdpdGh1Yi5jb20vYS9DeGxxakxhUCIsCiAgICAgICAgICAicmVwb1ByZWZpeCI6ICJzYS1kZW1vLW1pc3Npb24iCiAgICAgICAgfSwKICAgICAgICB7CiAgICAgICAgICAiaWQiOiAiMyIsCiAgICAgICAgICAidGl0bGUiOiAiU29ydGluZyBUaGluZ3MgT3V0IiwKICAgICAgICAgICJvcGVuQXQiOiAiMjAyMC0xMi0wMVQwMDowMDowMCswODowMCIsCiAgICAgICAgICAiY2xvc2VBdCI6ICIyMDIxLTEyLTMxVDIzOjU5OjU5KzA4OjAwIiwKICAgICAgICAgICJwdWJsaXNoZWQiOiAieWVzIiwKICAgICAgICAgICJjb3ZlckltYWdlIjogIi8vczMtYXAtc291dGhlYXN0LTEuYW1hem9uYXdzLmNvbS9taXNzaW9uLWFzc2V0cy9taXNzaW9ucy9RdWlja3NvcnQucG5nIiwKICAgICAgICAgICJzaG9ydFN1bW1hcnkiOiAiQSBxdWljayBsb29rIGF0IHF1aWNrc29ydC4iLAogICAgICAgICAgImFjY2VwdExpbmsiOiAiaHR0cHM6Ly9jbGFzc3Jvb20uZ2l0aHViLmNvbS9hL0QxNmhXdmpBIiwKICAgICAgICAgICJyZXBvUHJlZml4IjogInNhLWF1dG90ZXN0ZXItdGVzdCIKICAgICAgICB9CiAgICAgIF0KICAgIH0sCiAgICB7CiAgICAgICJ0eXBlTmFtZSI6ICJOb3RRdWVzdHMiLAogICAgICAiYXNzZXNzbWVudHMiOgogICAgICBbCiAgICAgICAgewogICAgICAgICAgImlkIjogIjQiLAogICAgICAgICAgInRpdGxlIjogIkZha2UgUXVlc3QiLAogICAgICAgICAgIm9wZW5BdCI6ICIyMDIwLTEyLTAxVDAwOjAwOjAwKzA4OjAwIiwKICAgICAgICAgICJjbG9zZUF0IjogIjIwMjEtMTItMzFUMjM6NTk6NTkrMDg6MDAiLAogICAgICAgICAgInB1Ymxpc2hlZCI6ICJ5ZXMiLAogICAgICAgICAgImNvdmVySW1hZ2UiOiAiaHR0cHM6Ly9pLmt5bS1jZG4uY29tL2VudHJpZXMvaWNvbnMvZmFjZWJvb2svMDAwLzAzNy8wMzcvcGFpbnBla29jb3Zlci5qcGciLAogICAgICAgICAgInNob3J0U3VtbWFyeSI6ICJBIGZha2UgcXVlc3QgdGhhdCBzaG91bGQgc2hvdyB1cC4iLAogICAgICAgICAgImFjY2VwdExpbmsiOiAiaHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1NNVZfSVhNZXdsNCIsCiAgICAgICAgICAicmVwb1ByZWZpeCI6ICJzYS10aGlzLWRvZXMtbm90LWV4aXN0IgogICAgICAgIH0KICAgICAgXQogICAgfSwKICAgIHsKICAgICAgInR5cGVOYW1lIjoiTm90UGF0aHMiLAogICAgICAiYXNzZXNzbWVudHMiOltdCiAgICB9LAogICAgewogICAgICAidHlwZU5hbWUiOiJOb3RDb250ZXN0cyIsCiAgICAgICJhc3Nlc3NtZW50cyI6W10KICAgIH0sCiAgICB7CiAgICAgICJ0eXBlTmFtZSI6Ik90aGVycyIsCiAgICAgICJhc3Nlc3NtZW50cyI6W10KICAgIH0KICBdCn0=';

type getContentProp = {
  owner: string;
  repo: string;
  path: string;
};

async function getContent(getContentProp: getContentProp) {
  const owner = getContentProp.owner;
  const repo = getContentProp.repo;
  const path = getContentProp.path;
  if (owner === 'source-academy-course-test' && repo === 'course-info') {
    if (path === '' || path === undefined) {
      return {
        data: [{ name: 'course-info.json' }]
      };
    }
    if (path === 'course-info.json') {
      return {
        data: {
          content: mockCourseInfo
        }
      };
    }
  }
  return {
    data: [{ name: 'not' }, { name: 'important' }]
  };
}

async function getAuthenticated() {
  return {
    data: {
      login: 'Fubuki'
    }
  };
}

const mockStore = {
  session: {
    githubOctokitObject: {
      octokit: {
        orgs: {
          listForAuthenticatedUser: listOrgsForAuthenticatedUser
        },
        repos: {
          listForAuthenticatedUser: listReposForAuthenticatedUser,
          getContent: getContent
        },
        users: {
          getAuthenticated: getAuthenticated
        }
      }
    }
  }
};

jest.mock('react-redux', () => ({
  ...jest.requireActual('react-redux'),
  useSelector: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({
    state: undefined
  }),
  useParams: () => ({
    selectedType: undefined
  })
}));

describe('GitHubClassroom', () => {
  beforeEach(() => {
    (useSelector as jest.Mock).mockImplementation(callback => {
      return callback(mockStore);
    });
  });

  const mockProps = {
    handleGitHubLogIn: () => {},
    handleGitHubLogOut: () => {}
  };

  it('renders correctly', async () => {
    await act(async () => {
      const tree = shallow(<GitHubClassroom {...mockProps} />);
      expect(tree.debug()).toMatchSnapshot();
    });
  });
});
