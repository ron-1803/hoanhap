import { onRequest as __api_tts_js_onRequest } from "C:\\Users\\ADMIN\\Downloads\\stitch_accessible_vietnam_support_hub\\functions\\api\\tts.js"

export const routes = [
    {
      routePath: "/api/tts",
      mountPath: "/api",
      method: "",
      middlewares: [],
      modules: [__api_tts_js_onRequest],
    },
  ]