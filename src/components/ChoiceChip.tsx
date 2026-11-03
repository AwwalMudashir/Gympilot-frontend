import {Pressable, StyleSheet, Text} from 'react-native';
import {useTheme} from '../theme/ThemeProvider';
import {fonts} from '../theme/typography';

export function ChoiceChip({label, selected, onPress}: {label: string; selected: boolean; onPress: () => void}) {
  const {colors} = useTheme();
  return <Pressable onPress={onPress} style={[styles.chip, {backgroundColor: selected ? colors.primarySoft : colors.surface, borderColor: selected ? colors.primary : colors.border}]}>
    <Text style={[styles.label, {color: selected ? colors.primary : colors.text}]}>{label}</Text>
  </Pressable>;
}
const styles = StyleSheet.create({chip: {borderRadius: 999, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10}, label: {fontFamily: fonts.body, fontSize: 14, fontWeight: '700'}});
