import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { mount } from 'enzyme';

import { FileExplorerPanel } from '../FileExplorerPanel';

test('Test file/folder click calls setFilePath', () => {
  act(() => {
    render(<FileExplorerPanel {...props} />);
  });
  const leftClick = { button: 1 };
  fireEvent.click(screen.getByText('folder1'), leftClick);
  expect(props.setFilePath).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByText('folder2'), leftClick);
  expect(props.setFilePath).toHaveBeenCalledTimes(2);
  fireEvent.click(screen.getByText('file3'), leftClick);
  expect(props.setFilePath).toHaveBeenCalledTimes(3);
});

test('Test file/folder clicked twice sets filepath to empty string', () => {
  act(() => {
    render(<FileExplorerPanel {...props} />);
  });
  const leftClick = { button: 1 };
  fireEvent.click(screen.getByText('file3'), leftClick);
  expect(props.setFilePath).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByText('file3'), leftClick);
  expect(props.setFilePath).toHaveBeenCalledTimes(2);
  expect(props.filePath).toBe('');
});

test('Test file name input typed calls setFilePath', () => {
  act(() => {
    render(<FileExplorerPanel {...props} />);
  });
  userEvent.type(screen.getByPlaceholderText('Enter File Name'), 'a');
  expect(props.setFilePath).toHaveBeenCalledTimes(1);
  userEvent.type(screen.getByPlaceholderText('Enter File Name'), 'file3');
  expect(props.setFilePath).toHaveBeenCalledTimes(6);
});

test('Test commit message input typed calls setCommitMessage', () => {
  act(() => {
    render(<FileExplorerPanel {...props} />);
  });
  userEvent.type(screen.getByPlaceholderText('Enter Commit Message'), 'a');
  expect(props.setCommitMessage).toHaveBeenCalledTimes(1);
  userEvent.type(screen.getByPlaceholderText('Enter Commit Message'), 'message');
  expect(props.setCommitMessage).toHaveBeenCalledTimes(8);
});

test('Test file list renders correctly', () => {
  const FEP = mount(<FileExplorerPanel {...props} />);
  expect(FEP.debug()).toMatchSnapshot();
});

const repoFiles = [
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
    label: 'file3',
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
];

const props = {
  repoFiles: repoFiles,
  repoName: 'YEETREPO',
  pickerType: 'Save',
  filePath: '',
  setFilePath: jest.fn(),
  setCommitMessage: jest.fn()
};
