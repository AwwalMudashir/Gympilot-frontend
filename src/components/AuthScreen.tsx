import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faDumbbell } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useState, type PropsWithChildren } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useTheme } from '../theme/ThemeProvider';
import { fonts } from '../theme/typography';

const gymBackground = require('../../assets/images/auth-gym-background.png');

type AuthScreenProps = PropsWithChildren<{
  eyebrow: string;
  title: string;
  subtitle: string;
  compact?: boolean;
  softOverlay?: boolean;
}>;

export function AuthScreen({
  children,
  eyebrow,
  title,
  subtitle,
  compact = false,
  softOverlay = false,
}: AuthScreenProps) {
  const { colors, isDark } = useTheme();
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const cardBackground = isDark
    ? 'rgba(13, 23, 17, 0.96)'
    : 'rgba(250, 255, 252, 0.95)';
  const cardBorder = isDark
    ? 'rgba(119, 211, 155, 0.22)'
    : 'rgba(255, 255, 255, 0.72)';
  const overlayColors = softOverlay
    ? [
        'rgba(3, 17, 10, 0.78)',
        'rgba(28, 125, 70, 0.46)',
        'rgba(3, 16, 9, 0.84)',
      ]
    : [
        'rgba(3, 17, 10, 0.90)',
        'rgba(28, 125, 70, 0.68)',
        'rgba(3, 16, 9, 0.94)',
      ];

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSubscription = Keyboard.addListener(showEvent, () =>
      setKeyboardVisible(true),
    );
    const hideSubscription = Keyboard.addListener(hideEvent, () =>
      setKeyboardVisible(false),
    );

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />
      <View style={styles.background}>
        <Image
          source={gymBackground}
          resizeMode="cover"
          style={styles.backgroundImage}
        />
        <LinearGradient
          colors={overlayColors}
          locations={[0, 0.48, 1]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.softGlow} />
        <SafeAreaView
          edges={['top', 'bottom', 'left', 'right']}
          style={styles.safeArea}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoidingView}
          >
            <ScrollView
              automaticallyAdjustKeyboardInsets={Platform.OS === 'ios'}
              contentContainerStyle={[
                styles.content,
                compact ? styles.compactContent : null,
                keyboardVisible ? styles.keyboardContent : null,
              ]}
              keyboardDismissMode={
                Platform.OS === 'ios' ? 'interactive' : 'on-drag'
              }
              keyboardShouldPersistTaps="handled"
              nestedScrollEnabled
              showsVerticalScrollIndicator={false}
            >
              {!keyboardVisible ? (
                <>
                  <View style={styles.brandRow}>
                    <View style={styles.brandIcon}>
                      <FontAwesomeIcon
                        color="#F5FFF8"
                        icon={faDumbbell}
                        size={15}
                      />
                    </View>
                    <Text style={styles.brandName}>GYMPILOT</Text>
                  </View>

                  <View style={styles.heroCopy}>
                    <Text style={styles.eyebrow}>{eyebrow}</Text>
                    <Text
                      style={[
                        styles.title,
                        compact ? styles.compactTitle : null,
                      ]}
                    >
                      {title}
                    </Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                  </View>
                </>
              ) : null}

              <View
                style={[
                  styles.formCard,
                  {
                    backgroundColor: cardBackground,
                    borderColor: cardBorder,
                    shadowColor: colors.shadow,
                  },
                ]}
              >
                {children}
              </View>

              {!keyboardVisible ? (
                <Text style={styles.footer}>TRAIN SMARTER / MOVE BETTER</Text>
              ) : null}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#06130B' },
  background: { flex: 1 },
  backgroundImage: {
    bottom: 0,
    height: '100%',
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: '100%',
  },
  softGlow: {
    position: 'absolute',
    right: -90,
    top: 165,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(151, 246, 180, 0.10)',
  },
  safeArea: { flex: 1 },
  keyboardAvoidingView: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 22,
    paddingTop: 26,
    paddingBottom: 18,
  },
  compactContent: { paddingTop: 18 },
  keyboardContent: {
    justifyContent: 'flex-start',
    paddingTop: 12,
    paddingBottom: 28,
  },
  brandRow: {
    position: 'absolute',
    top: 26,
    left: 22,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  brandIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(65, 181, 108, 0.90)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.26)',
  },
  brandName: {
    color: '#F4FFF7',
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2.2,
  },
  heroCopy: { marginTop: 92, marginBottom: 18, maxWidth: 520 },
  eyebrow: {
    color: '#BDF6CE',
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.9,
    marginBottom: 5,
  },
  title: {
    color: '#FFFFFF',
    fontFamily: fonts.display,
    fontSize: 48,
    lineHeight: 50,
    letterSpacing: 0.2,
  },
  compactTitle: { fontSize: 41, lineHeight: 43 },
  subtitle: {
    color: 'rgba(241, 255, 246, 0.86)',
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    marginTop: 5,
    maxWidth: 430,
  },
  formCard: {
    borderRadius: 26,
    borderWidth: 1,
    gap: 14,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 20,
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.28,
    shadowRadius: 26,
    elevation: 14,
    overflow: 'hidden',
  },
  footer: {
    color: 'rgba(235, 255, 242, 0.64)',
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.8,
    textAlign: 'center',
    marginTop: 15,
  },
});
