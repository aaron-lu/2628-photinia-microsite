import { initBotId } from "botid/client/core";

initBotId({
  protect: [
    {
      path: "/api/inquiry",
      method: "POST",
      advancedOptions: { checkLevel: "basic" },
    },
  ],
});
