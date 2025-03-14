import {eventMap} from '@testing-library/dom/dist/event-map.js'

const eventKeys = Object.fromEntries(
  Object.keys(eventMap).map(k => [k.toLowerCase(), k]),
) as {
  [k in keyof DocumentEventMap]?: keyof typeof eventMap
}

function getEventClass(type: keyof DocumentEventMap) {
  return type in eventKeys
    ? eventMap[eventKeys[type] as keyof typeof eventMap].EventType
    : 'Event'
}

const mouseEvents = ['MouseEvent', 'PointerEvent']
export function isMouseEvent(type: keyof DocumentEventMap) {
  return mouseEvents.includes(getEventClass(type))
}

export function isKeyboardEvent(type: keyof DocumentEventMap) {
  return getEventClass(type) === 'KeyboardEvent'
}
