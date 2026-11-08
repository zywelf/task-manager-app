import { Modal, View, Text, Pressable, StyleSheet } from 'react-native'
import { useTheme } from '@/contexts/ThemeContext'
import { fonts, shadow } from '@/constants/fonts'
import { PrimaryButton, SecondaryButton } from '@/components/ui'
import i18n from '@/i18n'

type CustomAlertProps = {
  visible: boolean
  onClose: () => void
  onReplayTutorial: () => void
}

/** "How it works" dialog */
export default function CustomAlert({ visible, onClose, onReplayTutorial }: CustomAlertProps) {
  const { colors } = useTheme()

  const lines = [i18n.t('info.swipeRight'), i18n.t('info.swipeLeft'), i18n.t('info.tapTask')]

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {/* Swallow taps on the card so they don't close the dialog */}
        <Pressable style={[styles.card, { backgroundColor: colors.background }]} onPress={() => {}}>
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{i18n.t('info.title')}</Text>
          </View>

          {lines.map((line, index) => (
            <View key={index} style={[styles.line, { borderBottomColor: colors.border }]}>
              <Text style={[styles.number, { color: colors.teal }]}>
                {String(index + 1).padStart(2, '0')}
              </Text>
              <Text style={[styles.lineText, { color: colors.text }]}>{line}</Text>
            </View>
          ))}

          <View style={styles.buttons}>
            <SecondaryButton
              label={i18n.t('info.replay')}
              onPress={onReplayTutorial}
              height={50}
              style={styles.button}
            />
            <PrimaryButton
              label={i18n.t('info.button')}
              onPress={onClose}
              height={50}
              style={styles.button}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  )
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(32,30,29,0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    ...shadow,
    shadowOpacity: 0.22,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 2,
  },
  title: {
    fontFamily: fonts.extrabold,
    fontSize: 24,
  },
  line: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  number: {
    width: 44,
    fontFamily: fonts.extrabold,
    fontSize: 13,
    lineHeight: 22,
  },
  lineText: {
    flex: 1,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
  },
  buttons: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  button: {
    flex: 1,
    paddingHorizontal: 14,
  },
})
