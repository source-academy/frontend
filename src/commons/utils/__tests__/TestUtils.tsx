import { deepFilter, shallowRender } from '../TestUtils';

const Component: React.FC = () => (
  <div className="testing">
    <p>Some</p>
    <div>
      nested<span>text</span>
    </div>
  </div>
);
test('shallowRender renders correctly', () => {
  const result = shallowRender(<Component />);
  expect(result.type).toBe('div');
  expect(result.props.className).toBe('testing');
  expect(result.props.children).toEqual([
    <p>Some</p>,
    <div>
      nested<span>text</span>
    </div>
  ]);
});

describe('deepFilter', () => {
  const createObjectWithProps = (props: any) => ({
    props
  });
  const createNavlinkObject = (to: string) =>
    createObjectWithProps({
      children: 'Navlink Text',
      to
    });

  const MISSIONS_PATH = '/courses/0/missions';
  const QUESTS_PATH = '/courses/0/quests';
  const GRADING_PATH = '/courses/0/grading';

  const NAVLINK_MISSIONS = createNavlinkObject(MISSIONS_PATH);
  const NAVLINK_QUESTS = createNavlinkObject(QUESTS_PATH);
  const NAVLINK_GRADING = createNavlinkObject(GRADING_PATH);

  const createMatchFn = (toLink: string) => (e: any) => e.props.to === toLink;
  const getChildren = (e: any) => e.props.children;

  test('filters correctly (no nesting/ 1 level deep)', () => {
    const result1 = deepFilter(NAVLINK_MISSIONS, createMatchFn(MISSIONS_PATH), getChildren);
    expect(result1.length).toBe(1);

    const result2 = deepFilter(NAVLINK_MISSIONS, createMatchFn(QUESTS_PATH), getChildren);
    expect(result2.length).toBe(0);
  });

  test('filters correctly (2 levels deep)', () => {
    const obj = createObjectWithProps({
      children: [NAVLINK_MISSIONS, NAVLINK_QUESTS],
      to: MISSIONS_PATH
    });

    const result1 = deepFilter(obj, createMatchFn(MISSIONS_PATH), getChildren);
    expect(result1.length).toBe(2);

    const result2 = deepFilter(obj, createMatchFn(QUESTS_PATH), getChildren);
    expect(result2.length).toBe(1);

    const result3 = deepFilter(obj, createMatchFn(GRADING_PATH), getChildren);
    expect(result3.length).toBe(0);
  });

  test("filters correctly (3 levels deep and multiple 'children of same level' matches)", () => {
    const obj = createObjectWithProps({
      children: [
        createObjectWithProps({
          children: [NAVLINK_MISSIONS, NAVLINK_QUESTS],
          to: MISSIONS_PATH
        }),
        createObjectWithProps({
          children: [NAVLINK_QUESTS, NAVLINK_GRADING],
          to: MISSIONS_PATH
        }),
        createObjectWithProps({
          children: [NAVLINK_QUESTS, NAVLINK_GRADING, NAVLINK_MISSIONS],
          to: GRADING_PATH
        })
      ],
      to: MISSIONS_PATH
    });

    const result1 = deepFilter(obj, createMatchFn(MISSIONS_PATH), getChildren);
    expect(result1.length).toBe(5);

    const result2 = deepFilter(obj, createMatchFn(QUESTS_PATH), getChildren);
    expect(result2.length).toBe(3);

    const result3 = deepFilter(obj, createMatchFn(GRADING_PATH), getChildren);
    expect(result3.length).toBe(3);
  });
});
