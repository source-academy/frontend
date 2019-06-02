import * as React from 'react';

import { shallow } from 'enzyme';

import Profile from '../Profile';

import { Role } from '../../../reducers/states';

test('Profile renders "no XP, no Grade" correctly', () => {
    const props = {
        grade: 0,
        maxGrade: 99,
        maxXp: 99,
        name: "yeet",
        role: Role.Staff,
        xp: 0,
        isOpen: true,
        onClose: () => { },
    };
    const tree = shallow(<Profile {...props} />);
    expect(tree.debug()).toMatchSnapshot();
});