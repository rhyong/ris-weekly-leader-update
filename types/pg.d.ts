declare module 'pg' {
  export interface PoolConfig {
    user?: string;
    password?: string;
    host?: string;
    port?: number;
    database?: string;
    connectionString?: string;
    ssl?: boolean | object;
    max?: number;
    idleTimeoutMillis?: number;
    connectionTimeoutMillis?: number;
  }

  export interface QueryResult<T = any> {
    rows: T[];
    rowCount: number;
    command: string;
    oid: number;
    fields: any[];
  }

  export interface QueryConfig {
    text: string;
    values?: any[];
    name?: string;
    rowMode?: string;
    types?: any;
  }

  export class Pool {
    constructor(config?: PoolConfig);
    connect(): Promise<any>;
    end(): Promise<void>;
    query<T = any>(queryTextOrConfig: string | QueryConfig, values?: any[]): Promise<QueryResult<T>>;
  }

  export class Client {
    constructor(config?: PoolConfig);
    connect(): Promise<void>;
    end(): Promise<void>;
    query<T = any>(queryTextOrConfig: string | QueryConfig, values?: any[]): Promise<QueryResult<T>>;
  }
}