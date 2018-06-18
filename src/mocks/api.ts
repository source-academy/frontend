let i = 0
const mockId = () => i++

export const mockOpenAssessmentsResult = [
  {
    title: 'An Odessey to Runes',
    summary_short:
      'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum.',
    summary_long:
      'This is the mission briefing. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas viverra, sem scelerisque ultricies ullamcorper, sem nibh sollicitudin enim, at ultricies sem orci eget odio. Pellentesque varius et mauris quis vestibulum. Etiam in egestas dolor. Nunc consectetur, sapien sodales accumsan convallis, lectus mi tempus ipsum, vel ornare metus turpis sed justo. Vivamus at tellus sed ex convallis commodo at in lectus. Pellentesque pharetra pulvinar sapien pellentesque facilisis. Curabitur efficitur malesuada urna sed aliquam. Quisque massa metus, aliquam in sagittis non, cursus in sem. Morbi vel nunc at nunc pharetra lobortis. Aliquam feugiat ultricies ipsum vel sollicitudin. Vivamus nulla massa, hendrerit sit amet nibh quis, porttitor convallis nisi. ',
    order: 0,
    open_at: '2018-06-18T05:24:26.026Z',
    mission_pdf: 'www.google.com',
    max_xp: 3000,
    id: mockId(),
    cover_picture: 'www.imgur.com',
    close_at: '2048-06-18T05:24:26.026Z',
    category: 'mission'
  },
  {
    title: 'The Secret to Streams',
    summary_short:
      'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum.',
    summary_long:
      'This is the mission briefing. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas viverra, sem scelerisque ultricies ullamcorper, sem nibh sollicitudin enim, at ultricies sem orci eget odio. Pellentesque varius et mauris quis vestibulum. Etiam in egestas dolor. Nunc consectetur, sapien sodales accumsan convallis, lectus mi tempus ipsum, vel ornare metus turpis sed justo. Vivamus at tellus sed ex convallis commodo at in lectus. Pellentesque pharetra pulvinar sapien pellentesque facilisis. Curabitur efficitur malesuada urna sed aliquam. Quisque massa metus, aliquam in sagittis non, cursus in sem. Morbi vel nunc at nunc pharetra lobortis. Aliquam feugiat ultricies ipsum vel sollicitudin. Vivamus nulla massa, hendrerit sit amet nibh quis, porttitor convallis nisi. ',
    order: 1,
    open_at: '2018-07-18T05:24:26.026Z',
    mission_pdf: 'www.google.com',
    max_xp: 3000,
    id: mockId(),
    cover_picture: 'www.imgur.com',
    close_at: '2048-06-18T05:24:26.026Z',
    category: 'mission'
  },
  {
    title: 'A sample Sidequest',
    summary_short:
      'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum.',
    summary_long:
      'This is the sidequest briefing. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas viverra, sem scelerisque ultricies ullamcorper, sem nibh sollicitudin enim, at ultricies sem orci eget odio. Pellentesque varius et mauris quis vestibulum. Etiam in egestas dolor. Nunc consectetur, sapien sodales accumsan convallis, lectus mi tempus ipsum, vel ornare metus turpis sed justo. Vivamus at tellus sed ex convallis commodo at in lectus. Pellentesque pharetra pulvinar sapien pellentesque facilisis. Curabitur efficitur malesuada urna sed aliquam. Quisque massa metus, aliquam in sagittis non, cursus in sem. Morbi vel nunc at nunc pharetra lobortis. Aliquam feugiat ultricies ipsum vel sollicitudin. Vivamus nulla massa, hendrerit sit amet nibh quis, porttitor convallis nisi. ',
    order: 0,
    open_at: '2018-07-18T05:24:26.026Z',
    mission_pdf: 'www.google.com',
    max_xp: 3000,
    id: mockId(),
    cover_picture: 'www.imgur.com',
    close_at: '2048-06-18T05:24:26.026Z',
    category: 'sidequest'
  }
]

const mockClosedAssessments = [
  {
    title: 'A closed Mission',
    summary_short:
      'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum.',
    summary_long:
      'This is the sidequest briefing. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas viverra, sem scelerisque ultricies ullamcorper, sem nibh sollicitudin enim, at ultricies sem orci eget odio. Pellentesque varius et mauris quis vestibulum. Etiam in egestas dolor. Nunc consectetur, sapien sodales accumsan convallis, lectus mi tempus ipsum, vel ornare metus turpis sed justo. Vivamus at tellus sed ex convallis commodo at in lectus. Pellentesque pharetra pulvinar sapien pellentesque facilisis. Curabitur efficitur malesuada urna sed aliquam. Quisque massa metus, aliquam in sagittis non, cursus in sem. Morbi vel nunc at nunc pharetra lobortis. Aliquam feugiat ultricies ipsum vel sollicitudin. Vivamus nulla massa, hendrerit sit amet nibh quis, porttitor convallis nisi. ',
    order: 0,
    open_at: '2007-07-18T05:24:26.026Z',
    mission_pdf: 'www.google.com',
    max_xp: 3000,
    id: mockId(),
    cover_picture: 'www.imgur.com',
    close_at: '2008-06-18T05:24:26.026Z',
    category: 'mission'
  },
  {
    title: 'A closed sidequest',
    summary_short:
      'Once upon a time, Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin nec vulputate sapien. Fusce vel lacus fermentum, efficitur ipsum.',
    summary_long:
      'This is the sidequest briefing. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas viverra, sem scelerisque ultricies ullamcorper, sem nibh sollicitudin enim, at ultricies sem orci eget odio. Pellentesque varius et mauris quis vestibulum. Etiam in egestas dolor. Nunc consectetur, sapien sodales accumsan convallis, lectus mi tempus ipsum, vel ornare metus turpis sed justo. Vivamus at tellus sed ex convallis commodo at in lectus. Pellentesque pharetra pulvinar sapien pellentesque facilisis. Curabitur efficitur malesuada urna sed aliquam. Quisque massa metus, aliquam in sagittis non, cursus in sem. Morbi vel nunc at nunc pharetra lobortis. Aliquam feugiat ultricies ipsum vel sollicitudin. Vivamus nulla massa, hendrerit sit amet nibh quis, porttitor convallis nisi. ',
    order: 0,
    open_at: '2007-07-18T05:24:26.026Z',
    mission_pdf: 'www.google.com',
    max_xp: 3000,
    id: mockId(),
    cover_picture: 'www.imgur.com',
    close_at: '2008-06-18T05:24:26.026Z',
    category: 'sidequest'
  }
]

export const mockAssessmentsResult = [...mockOpenAssessmentsResult, ...mockClosedAssessments]
