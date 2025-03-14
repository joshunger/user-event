import {isDisabled} from '../misc/isDisabled'
import {isElementType} from '../misc/isElementType'
import {isVisible} from '../misc/isVisible'
import {FOCUSABLE_SELECTOR} from './selector'

export function getTabDestination(activeElement: Element, shift: boolean) {
  const document = activeElement.ownerDocument
  const focusableElements = document.querySelectorAll(FOCUSABLE_SELECTOR)

  const enabledElements = Array.from(focusableElements).filter(
    el =>
      el === activeElement ||
      (el.getAttribute('tabindex') !== '-1' &&
        !isDisabled(el) &&
        // Hidden elements are not tabable
        isVisible(el)),
  )

  if (activeElement.getAttribute('tabindex') !== '-1') {
    // tabindex has no effect if the active element has tabindex="-1"
    enabledElements.sort((a, b) => {
      const i = Number(a.getAttribute('tabindex'))
      const j = Number(b.getAttribute('tabindex'))
      if (i === j) {
        return 0
      } else if (i === 0) {
        return 1
      } else if (j === 0) {
        return -1
      }
      return i - j
    })
  }

  const checkedRadio: Record<string, HTMLInputElement> = {}
  let prunedElements = [document.body]
  const activeRadioGroup = isElementType(activeElement, 'input', {
    type: 'radio',
  })
    ? activeElement.name
    : undefined
  enabledElements.forEach(currentElement => {
    const el = currentElement as HTMLInputElement

    // For radio groups keep only the active radio
    // If there is no active radio, keep only the checked radio
    // If there is no checked radio, treat like everything else
    if (isElementType(el, 'input', {type: 'radio'}) && el.name) {
      // If the active element is part of the group, add only that
      if (el === activeElement) {
        prunedElements.push(el)
        return
      } else if (el.name === activeRadioGroup) {
        return
      }

      // If we stumble upon a checked radio, remove the others
      if (el.checked) {
        prunedElements = prunedElements.filter(
          e => !isElementType(e, 'input', {type: 'radio', name: el.name}),
        )
        prunedElements.push(el)
        checkedRadio[el.name] = el
        return
      }

      // If we already found the checked one, skip
      if (typeof checkedRadio[el.name] !== 'undefined') {
        return
      }
    }

    prunedElements.push(el)
  })

  const currentIndex = prunedElements.findIndex(el => el === activeElement)

  const nextIndex = shift ? currentIndex - 1 : currentIndex + 1
  const defaultIndex = shift ? prunedElements.length - 1 : 0
  return prunedElements[nextIndex] || prunedElements[defaultIndex]
}
