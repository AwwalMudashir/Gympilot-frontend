import {StyleSheet, Text} from 'react-native';

import {PrimaryButton} from '../../components/PrimaryButton';
import {Screen} from '../../components/Screen';
import {useAuthStore} from '../../store/authStore';
import {colors} from '../../theme/colors';

export function ProfileScreen() {
  const logout = useAuthStore(state => state.logout);
  const user = useAuthStore(state => state.user);

  function handleLogout() {
    logout().catch(() => undefined);
  }

  return (
    <Screen>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.email}>{user?.email}</Text>
      <PrimaryButton label="Sign out" onPress={handleLogout} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {color: colors.text, fontSize: 30, fontWeight: '800'},
  email: {color: colors.muted, fontSize: 16},
});
