export type InputEvent =
  | { clientX: number; clientY: number; }
  | { touches: { clientX: number; clientY: number; }[]; }

export function getCursorPosition(event: InputEvent) {
  const touches = 'touches' in event ? event.touches : null
  let source = 'clientX' in event ? event : null

  // get current touch or mouse position
  if (touches != null && touches.length > 0) {
    source = touches[0]
  }

  return {
    x: source?.clientX || 0,
    y: source?.clientY || 0
  }
}
