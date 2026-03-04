export { postInstagramReel, postFacebookVideo } from "./meta";
export { postLinkedInVideo } from "./linkedin";

export async function postTikTok(_: { videoUrl: string; caption: string; accessToken: string; }) {
  return { vendorPostId: "tiktok_placeholder" };
}
