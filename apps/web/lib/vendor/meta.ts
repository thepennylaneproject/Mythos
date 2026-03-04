export async function postInstagramReel(_: { videoUrl: string; caption: string; accessToken: string; }) {
  return { vendorPostId: "ig_placeholder" };
}
export async function postFacebookVideo(_: { videoUrl: string; description: string; pageToken: string; }) {
  return { vendorPostId: "fb_placeholder" };
}
