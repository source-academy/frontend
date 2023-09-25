// import { SideContentLocation } from '../redux/workspace/WorkspaceReduxTypes';
import { consoleOverloads } from './ConsoleOverload';

type SideContentLocation = 'assessment' | 'githubAssessment' | 'grading' | 'playground' | 'sicp' | 'sourcecast' | 'sourcereel' | `stories.${string}`

class BufferService {
  private buffer: string[];
  private workspaceLocation: SideContentLocation | undefined;

  constructor() {
    this.buffer = [];
  }

  public dump(): string[] {
    const bufferCopy = [...this.buffer];
    this.resetBuffer();
    return bufferCopy;
  }

  public push(log: string, workspaceLocation: SideContentLocation): void {
    this.handleWorkspaceChange(workspaceLocation);
    this.buffer.push(log);
  }

  public attachConsole(workspaceLocation: SideContentLocation): () => void {
    const bufferCallback = (log: string) => this.push(log, workspaceLocation);
    const defaultConsole = {};
    Object.entries(consoleOverloads).forEach(([method, overload]) => {
      defaultConsole[method] = console[method];
      console[method] = overload(bufferCallback);
    });

    return () => {
      Object.entries(consoleOverloads).forEach(([method]) => {
        console[method] = defaultConsole[method];
      });
    };
  }

  private handleWorkspaceChange(newWorkspace: SideContentLocation): void {
    if (!this.hasWorkspace() || newWorkspace !== this.workspaceLocation) {
      this.workspaceLocation = newWorkspace;
      this.resetBuffer();
    }
  }

  private hasWorkspace(): boolean {
    return Boolean(this.workspaceLocation);
  }

  private resetBuffer(): void {
    this.buffer = [];
  }
}

// Singleton
const DisplayBufferService: BufferService = new BufferService();
export default DisplayBufferService;
