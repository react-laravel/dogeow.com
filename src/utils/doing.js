export const DOING_WITH_DOT_MAX_LENGTH = 4;

export const getDoingText = (doings, timestampSeconds) => {
  const doingWithDotMaxIndex = doings.length * DOING_WITH_DOT_MAX_LENGTH - 1;
  const doingAndDotIndex = timestampSeconds % (doingWithDotMaxIndex + 1);
  const doingIndex = Math.floor(doingAndDotIndex / DOING_WITH_DOT_MAX_LENGTH);
  const dotCount = doingAndDotIndex % DOING_WITH_DOT_MAX_LENGTH;

  return `正在${doings[doingIndex]}.${".".repeat(dotCount)}`;
};
