import { Tree } from '@blueprintjs/core';
import { mount } from 'enzyme';
import { FileExplorerPanel } from '../FileExplorerPanel';

test('Test file list renders correctly', () => {
  const props = {
    repoFiles: [
      {
        id: 0,
        label: 'folder1',
        nodeData: {
          childrenRetrieved: true,
          filePath: 'folder1',
          fileType: 'dir',
          
          constructor(path: string, type: string) {
            this.filePath = path;
            this.fileType = type;
          }
        },
        childNodes: [
          {
            id: 3,
            label: 'file1',
            nodeData: {
              childrenRetrieved: false,
              filePath: 'folder1/file1',
              fileType: 'file',
              
              constructor(path: string, type: string) {
                this.filePath = path;
                this.fileType = type;
              }
            }
          },
          {
            id: 4,
            label: 'file2',
            nodeData: {
              childrenRetrieved: false,
              filePath: 'folder1/file2',
              fileType: 'file',
              
              constructor(path: string, type: string) {
                this.filePath = path;
                this.fileType = type;
              }
            }
          }
        ]
      },
      {
        id: 1,
        label: 'folder2',
        nodeData: {
          childrenRetrieved: false,
          filePath: 'folder2',
          fileType: 'dir',
          
          constructor(path: string, type: string) {
            this.filePath = path;
            this.fileType = type;
          }
        }
      },
      {
        id: 2,
        label: 'file 3',
        nodeData: {
          childrenRetrieved: false,
          filePath: 'file3',
          fileType: 'file',
          
          constructor(path: string, type: string) {
            this.filePath = path;
            this.fileType = type;
          }
        }
      }
    ],
    repoName: 'YEETREPO',
    pickerType: 'Open',
    filePath: '',
    setFilePath: () => {},
    setCommitMessage: () => {}
  };
  const FEP = mount(
    <FileExplorerPanel {...props} />
    
  );
  expect(FEP.debug()).toMatchSnapshot();

  // handleClick
  <Tree contents={props.repoFiles} />
});