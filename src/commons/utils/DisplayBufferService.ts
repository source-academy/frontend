import { WorkspaceLocation } from '../workspace/WorkspaceTypes';
import { consoleOverloads } from './ConsoleOverload';

class BufferService {
  private buffer: string[];
  private workspaceLocation: WorkspaceLocation | undefined;

  constructor() {
    this.buffer = [];
  }

  public dump(): string[] {
    const bufferCopy = [...this.buffer];
    this.resetBuffer();
    return bufferCopy;
  }

  public push(log: string, workspaceLocation?: WorkspaceLocation): void {
    if (workspaceLocation) {
      this.handleWorkspaceChange(workspaceLocation);
    }

    this.buffer.push(log);
  }

  public attachConsole(): () => void {
    const bufferCallback = (log: string) => this.push(log);
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

  private handleWorkspaceChange(newWorkspace: WorkspaceLocation): void {
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
