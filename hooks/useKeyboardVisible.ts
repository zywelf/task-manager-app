import { useEffect, useState } from 'react'
import { Keyboard } from 'react-native'

/**
 * True while the software keyboard is open.
 * Used to drop the bottom safe-area padding so bars sit right on top of the keyboard.
 */
export function useKeyboardVisible() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setVisible(true))
    const hide = Keyboard.addListener('keyboardDidHide', () => setVisible(false))
    return () => {
      show.remove()
      hide.remove()
    }
  }, [])

  return visible
}
