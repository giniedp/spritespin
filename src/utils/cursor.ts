export function getCursorPosition(event: any) {
  let touches = event.touches
  let source = event

  // jQuery Event normalization does not preserve the 'event.touches'
  // try to grab touches from the original event
  if (event.touches === undefined && event.originalEvent !== undefined) {
    touches = event.originalEvent.touches
  }
  // get current touch or mouse position
  if (touches !== undefined && touches.length > 0) {
    source = touches[0]
  }
  return {
    x: source.clientX || 0,
    y: source.clientY || 0
  }
}
