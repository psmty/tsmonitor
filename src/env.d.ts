/// <reference path="../.astro/types.d.ts" />

type KVNamespace = import("@cloudflare/workers-types").KVNamespace & {
  prepare: (sql: string, values?: any[]) => { run: (values?: any[]) => Promise<{ results: any[] }>};
};
type ENV = {
  // replace `MY_KV` with your KV namespace
  DATABASE: KVNamespace;
};

// use a default runtime configuration (advanced mode).
type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;
declare namespace App {
  interface Locals extends Runtime {
  }
}

