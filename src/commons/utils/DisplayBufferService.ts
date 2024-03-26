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

  public push(log: string, workspaceLocation: WorkspaceLocation): void {
    this.handleWorkspaceChange(workspaceLocation);
    this.buffer.push(log);
  }

  public attachConsole(workspaceLocation: WorkspaceLocation): () => void {
    const bufferCallback = (log: string) => this.push(log, workspaceLocation);
    const defaultConsole: Record<string, any> = {};
    Object.entries(consoleOverloads).forEach(([method, overload]) => {
      const key = method as keyof typeof consoleOverloads;
      defaultConsole[method] = console[key];
      console[key] = overload(bufferCallback);
    });

    return () => {
      Object.entries(consoleOverloads).forEach(([method]) => {
        const key = method as keyof typeof consoleOverloads;
        console[key] = defaultConsole[key];
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
