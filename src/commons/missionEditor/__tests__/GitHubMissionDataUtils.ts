import * as GitHubMissionDataUtils from '../GitHubMissionDataUtils';
import MissionMetadata from '../MissionMetadata';
import MissionRepoData from '../MissionRepoData';

test('getContentAsString correctly gets content and translates from Base64 to utf-8', async () => {
  const content = await GitHubMissionDataUtils.getContentAsString(
    'dummy owner',
    'dummy repo',
    'dummy path',
    new MocktokitA()
  );
  expect(content).toBe('Hello World!');
});

test('parseMetadataProperties correctly discovers properties', () => {
  const missionMetadata = new MissionMetadata();
  const stringPropsToExtract = ['coverImage', 'kind', 'number', 'title', 'reading', 'webSummary'];
  const numPropsToExtract = ['sourceVersion'];

  const metadataString =
    'coverImage=www.somelink.com\n' +
    'kind=Mission\n' +
    'number=M3\n' +
    'title=Dummy Mission\n' +
    'reading=Textbook Pages 1 to 234763\n' +
    'webSummary=no\n' +
    'sourceVersion=3';

  const retVal = GitHubMissionDataUtils.parseMetadataProperties<MissionMetadata>(
    missionMetadata,
    stringPropsToExtract,
    numPropsToExtract,
    metadataString
  );

  expect(retVal.coverImage).toBe('www.somelink.com');
  expect(retVal.kind).toBe('Mission');
  expect(retVal.number).toBe('M3');
  expect(retVal.title).toBe('Dummy Mission');
  expect(retVal.reading).toBe('Textbook Pages 1 to 234763');
  expect(retVal.webSummary).toBe('no');
  expect(retVal.sourceVersion).toBe(3);
});

test('getMissionData works properly', async () => {
  const missionData = await GitHubMissionDataUtils.getMissionData(
    new MissionRepoData('Pain', 'Peko'),
    new MocktokitB()
  );

  expect(missionData.missionRepoData.repoOwner).toBe('Pain');
  expect(missionData.missionRepoData.repoName).toBe('Peko');

  expect(missionData.missionBriefing).toBe('Briefing Content');

  expect(missionData.missionMetadata.coverImage).toBe('www.somelink.com');
  expect(missionData.missionMetadata.kind).toBe('Mission');
  expect(missionData.missionMetadata.number).toBe('M3');
  expect(missionData.missionMetadata.title).toBe('Dummy Mission');
  expect(missionData.missionMetadata.reading).toBe('Textbook Pages 1 to 234763');
  expect(missionData.missionMetadata.webSummary).toBe('no');
  expect(missionData.missionMetadata.sourceVersion).toBe(3);

  expect(missionData.tasksData.length).toBe(2);
  expect(missionData.tasksData[0].taskDescription).toBe('Task A');
  expect(missionData.tasksData[0].starterCode).toBe('Code A');
  expect(missionData.tasksData[1].taskDescription).toBe('Task B');
  expect(missionData.tasksData[1].starterCode).toBe('Code B');
});

class MocktokitA {
  readonly repos = {
    getContent: this.getContent
  };

  async getContent(dummyObject: any) {
    const contentObject = {
      content: Buffer.from('Hello World!', 'utf8').toString('base64')
    };

    return {
      data: contentObject
    };
  }
}

// Try to create Jest mocks failed; the mock functions were not called
// Had to rely on dependency injection for testing
class MocktokitB {
  async getContent(dummyObject: any) {
    const contentObject = MocktokitHelper.values[MocktokitHelper.index];
    MocktokitHelper.index++;

    return {
      data: contentObject
    };
  }

  readonly repos = {
    getContent: this.getContent
  };
}

class MocktokitHelper {
  static index: number = 0;

  static first = {
    content: Buffer.from('Briefing Content', 'utf8').toString('base64')
  };

  static second = {
    content: Buffer.from(
      'coverImage=www.somelink.com\n' +
        'kind=Mission\n' +
        'number=M3\n' +
        'title=Dummy Mission\n' +
        'reading=Textbook Pages 1 to 234763\n' +
        'webSummary=no\n' +
        'sourceVersion=3',
      'utf-8'
    ).toString('base64')
  };

  static third = [{ name: 'Q1' }, { name: 'Q2' }];

  static fourth = {
    content: Buffer.from('Task A', 'utf8').toString('base64')
  };

  static fifth = {
    content: Buffer.from('Code A', 'utf8').toString('base64')
  };

  static sixth = {
    content: Buffer.from('Task B', 'utf8').toString('base64')
  };

  static seventh = {
    content: Buffer.from('Code B', 'utf8').toString('base64')
  };

  static values = [
    MocktokitHelper.first,
    MocktokitHelper.second,
    MocktokitHelper.third,
    MocktokitHelper.fourth,
    MocktokitHelper.fifth,
    MocktokitHelper.sixth,
    MocktokitHelper.seventh
  ];
}
