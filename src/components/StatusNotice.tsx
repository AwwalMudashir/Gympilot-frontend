import { StyleSheet, Text, View } from 'react-native';

import { useTheme } from '../theme/ThemeProvider';
import { fonts } from '../theme/typography';
import { AppIcon, type AppIconName } from './AppIcon';

type NoticeTone = 'error' | 'success' | 'info';

const toneIcon: Record<NoticeTone, AppIconName> = {
  error: 'error',
  success: 'circleCheck',
  info: 'info',
};

export function StatusNotice({
  message,
  tone = 'info',
}: {
  message?: string;
  tone?: NoticeTone;
}) {
  const { colors } = useTheme();
  if (!message) return null;

  const accent =
    tone === 'error'
      ? colors.danger
      : tone === 'success'
      ? colors.primary
      : colors.muted;
  const background =
    tone === 'error'
      ? `${colors.danger}12`
      : tone === 'success'
      ? colors.primarySoft
      : `${colors.muted}12`;

  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole={tone === 'error' ? 'alert' : 'text'}
      style={[
        styles.notice,
        { backgroundColor: background, borderColor: `${accent}35` },
      ]}
    >
      <AppIcon color={accent} name={toneIcon[tone]} size={17} />
      <Text
        style={[
          styles.message,
          { color: tone === 'info' ? colors.text : accent },
        ]}
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    alignItems: 'flex-start',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 15,
    paddingVertical: 13,
  },
  message: {
    flex: 1,
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
});
