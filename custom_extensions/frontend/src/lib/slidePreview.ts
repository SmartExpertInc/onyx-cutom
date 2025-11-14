const SLIDE_PREVIEW_TYPE_TOKENS = [
  "slidedeck",
  "slidedeckdisplay",
  "lessonpresentation",
  "lessonpresentationdisplay",
  "videolesson",
  "videolessondisplay",
  "videolessonpresentation",
  "videolessonpresentationdisplay",
];

const normalizeDesignType = (type?: string) =>
  (type || "").trim().toLowerCase().replace(/[\s_-]/g, "");

export const isSlidePreviewEligibleType = (type?: string) => {
  if (!type) return false;
  const normalized = normalizeDesignType(type);
  return SLIDE_PREVIEW_TYPE_TOKENS.some(
    (token) => normalized === token
  );
};

