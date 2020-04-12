export interface TouchCoordinates {
  clientX: number
  clientY: number
}

export function getCursorPosition(event: TouchCoordinates | TouchEvent | MouseEvent) {
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
