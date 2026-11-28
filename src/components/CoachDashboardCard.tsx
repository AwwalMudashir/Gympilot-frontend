import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { fonts } from '../theme/typography';
import type { CoachBrief } from '../types/coach';
import { AppIcon } from './AppIcon';
import { Card } from './Card';

export function CoachDashboardCard({
  brief,
  onPress,
}: {
  brief?: CoachBrief;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      <Card style={{ backgroundColor: colors.surfaceRaised }}>
        <View style={styles.heading}>
          <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
            <AppIcon name="bolt" color={colors.primary} size={18} />
          </View>
          <View style={styles.flex}>
            <Text style={[styles.eyebrow, { color: colors.primary }]}>
              GYMBRO COACH
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              Latest coach brief
            </Text>
          </View>
          {brief ? (
            <View
              style={[
                styles.sourcePill,
                { backgroundColor: colors.primarySoft },
              ]}
            >
              <Text style={[styles.sourceText, { color: colors.primary }]}>
                {brief.generationSource === 'OLLAMA' ? 'AI' : 'INSIGHT'}
              </Text>
            </View>
          ) : null}
          <AppIcon name="chevron" color={colors.muted} size={14} />
        </View>

        <Text
          numberOfLines={2}
          style={[styles.summary, { color: colors.text }]}
        >
          {brief?.summary ??
            'Open your coaching brief for guidance based on your recent training and recovery data.'}
        </Text>
        {brief ? (
          <View style={[styles.focus, { backgroundColor: colors.primarySoft }]}>
            <Text style={[styles.focusLabel, { color: colors.primary }]}>
              TODAY’S FOCUS
            </Text>
            <Text
              numberOfLines={2}
              style={[styles.focusText, { color: colors.text }]}
            >
              {brief.focusToday}
            </Text>
          </View>
        ) : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  heading: { alignItems: 'center', flexDirection: 'row', gap: 11 },
  icon: {
    alignItems: 'center',
    borderRadius: 14,
    height: 43,
    justifyContent: 'center',
    width: 43,
  },
  flex: { flex: 1 },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1.3,
  },
  title: { fontFamily: fonts.displaySemibold, fontSize: 22, marginTop: 1 },
  sourcePill: {
    borderRadius: 99,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  sourceText: {
    fontFamily: fonts.body,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  summary: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 15,
  },
  focus: { borderRadius: 14, marginTop: 13, padding: 12 },
  focusLabel: {
    fontFamily: fonts.body,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  focusText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 4,
  },
});
