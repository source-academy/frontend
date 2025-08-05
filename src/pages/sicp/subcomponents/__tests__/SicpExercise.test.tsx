import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserEvent } from '@testing-library/user-event/dist/types/setup/setup';
import { renderTreeJson } from 'src/commons/utils/TestUtils';

import SicpExercise, { noSolutionPlaceholder } from '../SicpExercise';

describe('Sicp exercise renders', () => {
  let user: UserEvent;
  beforeEach(() => {
    user = userEvent.setup();
  });

  test('correctly', async () => {
    const props = {
      title: 'Title',
      body: <div>body</div>,
      solution: <div>solution</div>
    };

    const tree = await renderTreeJson(<SicpExercise {...props} />);
    expect(tree).toMatchSnapshot();
  });

  test('correctly with solution', async () => {
    const solution = 'solution';
    const props = {
      title: 'Title',
      body: <div>body</div>,
      solution: <div>{solution}</div>
    };

    const { container } = render(<SicpExercise {...props} />);
    await user.click(screen.getByRole('button'));
    expect(container.querySelector('.sicp-solution')?.textContent).toEqual(solution);
  });

  test('correctly without solution', async () => {
    const props = {
      title: 'Title',
      body: <div>body</div>,
      solution: undefined
    };

    const { container } = render(<SicpExercise {...props} />);
    await user.click(screen.getByRole('button'));
    expect(container.querySelector('.sicp-solution')?.textContent).toEqual(
      render(noSolutionPlaceholder).container.textContent
    );
  });
});
