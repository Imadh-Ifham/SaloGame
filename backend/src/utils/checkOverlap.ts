export const isOverlapping = (
  newSlot: { startTime: string; endTime: string },
  existingSlots: { startTime: string; endTime: string }[]
) => {
  return existingSlots.some(
    (slot) =>
      newSlot.startTime < slot.endTime && newSlot.endTime > slot.startTime
  );
};
