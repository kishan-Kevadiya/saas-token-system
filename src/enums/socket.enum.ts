export enum SocketNamespace {
  GENERATE_TOKEN = 'generate-token',
  PROCESS_TOKEN = 'process-token',
}

export type moduleName = keyof typeof SocketNamespace;
