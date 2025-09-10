import { onRequestOptions as __api___route___ts_onRequestOptions } from "/home/nakamoto/dev/a-publico/beta/dashboard-iegm/functions/api/[[route]].ts"
import { onRequest as __api___route___ts_onRequest } from "/home/nakamoto/dev/a-publico/beta/dashboard-iegm/functions/api/[[route]].ts"

export const routes = [
    {
      routePath: "/api/:route*",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api___route___ts_onRequestOptions],
    },
  {
      routePath: "/api/:route*",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api___route___ts_onRequest],
    },
  ]