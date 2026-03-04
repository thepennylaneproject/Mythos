import { startWorker } from "./jobs";
startWorker("convert.video", async (payload) => {
  console.log("[convert.video] stub", payload);
});
