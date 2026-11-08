import { Pressable, StyleSheet, Text, View } from 'react-native'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'
import { useTheme } from '@/contexts/ThemeContext'
import { useTutorial } from '@/contexts/TutorialContext'
import { fonts, shadow } from '@/constants/fonts'
import i18n from '@/i18n'

/** Floating tutorial card shown above the quick-add bar */
export default function CoachCard({ bottom }: { bottom: number }) {
  const { colors } = useTheme()
  const { step, finish } = useTutorial()

  if (step === 0) return null

  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      exiting={FadeOut.duration(150)}
      style={[styles.card, { bottom, backgroundColor: colors.card, borderColor: colors.teal }]}
    >
      <View style={styles.top}>
        <Text style={[styles.kicker, { color: colors.teal }]}>{i18n.t('tutorial.step', { n: step })}</Text>
        <Pressable onPress={finish} hitSlop={10} style={styles.skip}>
          <Text style={[styles.skipText, { color: colors.text }]}>{i18n.t('tutorial.skip')}</Text>
        </Pressable>
      </View>
      <Text style={[styles.title, { color: colors.text }]}>{i18n.t(`tutorial.step${step}Title`)}</Text>
      <Text style={[styles.body, { color: colors.text }]}>{i18n.t(`tutorial.step${step}Body`)}</Text>
      <View style={styles.dots}>
        {[1, 2, 3].map(n => (
          <View
            key={n}
            style={[
              styles.dot,
              {
                backgroundColor: n <= step ? colors.highlight : 'rgba(128,128,128,0.35)',
              },
            ]}
          />
        ))}
      </View>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    left: 16,
    right: 16,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderWidth: 1,
    borderRadius: 16,
    gap: 6,
    ...shadow,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  kicker: {
    fontFamily: fonts.semibold,
    fontSize: 11,
    letterSpacing: 1.3,
    textTransform: 'uppercase',
  },
  skip: {
    paddingVertical: 4,
  },
  skipText: {
    fontFamily: fonts.semibold,
    fontSize: 13,
    opacity: 0.7,
  },
  title: {
    fontFamily: fonts.extrabold,
    fontSize: 19,
    lineHeight: 23,
  },
  body: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.78,
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 6,
  },
  dot: {
    flex: 1,
    height: 4,
    borderRadius: 999,
  },
})
