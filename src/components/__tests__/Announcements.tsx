import * as React from 'react';

import { mount } from 'enzyme';

import Announcements, { IAnnouncementsProps } from '../Announcements';

const mockUndefinedAnnouncements: IAnnouncementsProps = {
  handleAnnouncementsFetch: () => {}
};

const mockEmptyAnnouncements: IAnnouncementsProps = {
  announcements: [],
  handleAnnouncementsFetch: () => {}
};

const mockPresentAnnouncements: IAnnouncementsProps = {
  announcements: [
    {
      author: 'Aministrator',
      title: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
      content:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam non tellus non ligula consectetur feugiat a at mauris. Ut sagittis, urna id suscipit dictum, ipsum diam sollicitudin enim, sed ultricies diam turpis vel libero. Maecenas finibus nisl ac lobortis ultricies. Integer molestie urna vitae nisi pharetra porttitor. Vestibulum massa diam, tristique quis ante a, posuere placerat magna. Pellentesque at lobortis purus, vitae imperdiet diam. Nulla eu rutrum neque. Aliquam efficitur consectetur ullamcorper. Pellentesque ultricies, diam ut vestibulum pellentesque, metus arcu laoreet ex, at mattis quam est non neque. Nam velit ipsum, posuere non porttitor commodo, lobortis in urna.Nulla facilisi. Donec mollis id nibh a luctus. Mauris vitae orci id velit pulvinar pellentesque non ut sapien. Curabitur eu consequat lorem. Proin pretium blandit scelerisque. Morbi ultricies, tellus non posuere pretium, felis sem convallis magna, ut sagittis elit felis et sem. Aliquam auctor suscipit condimentum. Nam posuere nulla dolor, in maximus risus feugiat vel. Phasellus vestibulum odio nec leo vehicula condimentum. Ut et semper libero. Cras fermentum mauris quis ex sodales, sit amet hendrerit augue lobortis. Maecenas eu dapibus enim, nec auctor est. Quisque quis erat erat. Curabitur sed rutrum felis, non venenatis diam. Fusce maximus rhoncus neque, in maximus velit semper eu. Fusce tempus lorem ut sodales pulvinar.',
      pinned: true
    },
    {
      author: 'Bob the builder',
      title: 'Can we fix it? A study forged by inquiry.',
      content:
        "Bob the Builder is a British children's animated television show created by Keith Chapman. In the original series, Bob appears in a stop motion animated programme as a building contractor, specialising in masonry, along with his colleague Wendy, various neighbours and friends, and their gang of anthropomorphised work-vehicles and equipment. The show is broadcast in many countries, but originates from the United Kingdom where Bob is voiced by English actor Neil Morrissey. The show was later created using CGI animation starting with the spin-off series Ready, Steady, Build!.",
      pinned: false
    }
  ],
  handleAnnouncementsFetch: () => {}
};

test('Announcements page "loading" content renders correctly', () => {
  const app = <Announcements {...mockUndefinedAnnouncements} />;
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Announcements page with 0 announcements renders correctly', () => {
  const app = <Announcements {...mockEmptyAnnouncements} />;
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
});

test('Announcements page with multiple loaded announcements renders correctly', () => {
  const app = <Announcements {...mockPresentAnnouncements} />;
  const tree = mount(app);
  expect(tree.debug()).toMatchSnapshot();
});
