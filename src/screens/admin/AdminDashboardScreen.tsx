import { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { AppIcon } from '../../components/AppIcon';
import { Card } from '../../components/Card';
import { FormField } from '../../components/FormField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { Screen } from '../../components/Screen';
import { StateView } from '../../components/StateView';
import { adminApi } from '../../services/adminApi';
import { apiErrorMessage } from '../../services/http';
import { useAuthStore } from '../../store/authStore';
import { useTheme } from '../../theme/ThemeProvider';
import { fonts } from '../../theme/typography';
import type { AdminUser } from '../../types/admin';

export function AdminDashboardScreen() {
  const { colors } = useTheme();
  const logout = useAuthStore(state => state.logout);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyUserId, setBusyUserId] = useState<string>();
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setUsers(await adminApi.listUsers());
    } catch (caught) {
      setError(apiErrorMessage(caught, 'Could not load user accounts.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const visibleUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter(user =>
      `${user.firstName} ${user.lastName} ${user.email}`
        .toLowerCase()
        .includes(normalized),
    );
  }, [query, users]);

  const activeUsers = users.filter(user => user.status === 'ACTIVE').length;
  const inactiveUsers = users.filter(user => user.status === 'INACTIVE').length;

  async function updateUser(
    userId: string,
    action: () => Promise<AdminUser>,
    successMessage: string,
  ) {
    setBusyUserId(userId);
    setError(undefined);
    try {
      const updated = await action();
      setUsers(current =>
        current.map(user => (user.id === updated.id ? updated : user)),
      );
      Alert.alert('GymBro admin', successMessage);
    } catch (caught) {
      const message = apiErrorMessage(caught, 'Could not update this account.');
      setError(message);
      Alert.alert('Account update failed', message);
    } finally {
      setBusyUserId(undefined);
    }
  }

  function confirmStatusChange(user: AdminUser) {
    const inactive = user.status === 'INACTIVE';
    const actionLabel = inactive ? 'Reactivate' : 'Deactivate';
    Alert.alert(
      `${actionLabel} account?`,
      inactive
        ? `${user.email} will be able to sign in again.`
        : `${user.email} will be signed out and prevented from using protected features. Their data will remain stored.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionLabel,
          style: inactive ? 'default' : 'destructive',
          onPress: () =>
            updateUser(
              user.id,
              () =>
                inactive
                  ? adminApi.reactivateUser(user.id)
                  : adminApi.deactivateUser(user.id),
              inactive
                ? 'The account has been reactivated.'
                : 'The account has been deactivated.',
            ),
        },
      ],
    );
  }

  function confirmPermanentDelete(user: AdminUser) {
    Alert.alert(
      'Permanently delete account?',
      `This will delete ${user.email}, their profile, plans, workout history, wellness logs and stored media records. This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Final confirmation',
              `Delete ${user.email} and all related application data?`,
              [
                { text: 'Keep account', style: 'cancel' },
                {
                  text: 'Delete permanently',
                  style: 'destructive',
                  onPress: () => permanentlyDelete(user),
                },
              ],
            ),
        },
      ],
    );
  }

  async function permanentlyDelete(user: AdminUser) {
    setBusyUserId(user.id);
    setError(undefined);
    try {
      await adminApi.permanentlyDeleteUser(user.id, user.email);
      setUsers(current => current.filter(item => item.id !== user.id));
      Alert.alert('Account deleted', `${user.email} was permanently deleted.`);
    } catch (caught) {
      const message = apiErrorMessage(caught, 'Could not delete this account.');
      setError(message);
      Alert.alert('Account deletion failed', message);
    } finally {
      setBusyUserId(undefined);
    }
  }

  if (loading) {
    return (
      <Screen>
        <StateView
          icon="shield"
          title="Loading administration"
          message="Retrieving user accounts and their current status."
        />
      </Screen>
    );
  }

  return (
    <Screen scroll>
      <View style={styles.headingRow}>
        <View style={styles.flex}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>ADMIN</Text>
          <Text style={[styles.title, { color: colors.text }]}>
            User management
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Manage access without touching database tables manually.
          </Text>
        </View>
        <View style={[styles.shield, { backgroundColor: colors.primarySoft }]}>
          <AppIcon color={colors.primary} name="shield" size={24} />
        </View>
      </View>

      <View style={styles.metrics}>
        <Metric label="Total" value={users.length} color={colors.text} />
        <Metric label="Active" value={activeUsers} color={colors.primary} />
        <Metric label="Inactive" value={inactiveUsers} color={colors.danger} />
      </View>

      <FormField
        label="Search users"
        onChangeText={setQuery}
        placeholder="Name or email address"
        value={query}
      />

      {error ? (
        <Text style={[styles.error, { color: colors.danger }]}>{error}</Text>
      ) : null}

      <PrimaryButton
        label="Refresh accounts"
        onPress={load}
        variant="secondary"
      />

      {visibleUsers.length === 0 ? (
        <Card>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>
            No matching users
          </Text>
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            Try a different name or email address.
          </Text>
        </Card>
      ) : null}

      {visibleUsers.map(user => {
        const protectedAdmin = user.role === 'ADMIN';
        const busy = busyUserId === user.id;
        const active = user.status === 'ACTIVE';
        return (
          <Card key={user.id}>
            <View style={styles.userHeader}>
              <View style={styles.flex}>
                <Text style={[styles.userName, { color: colors.text }]}>
                  {user.firstName} {user.lastName}
                </Text>
                <Text style={[styles.email, { color: colors.muted }]}>
                  {user.email}
                </Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: active
                      ? colors.primarySoft
                      : `${colors.danger}18`,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.statusText,
                    { color: active ? colors.primary : colors.danger },
                  ]}
                >
                  {user.status}
                </Text>
              </View>
            </View>

            <View style={[styles.details, { borderTopColor: colors.border }]}>
              <Text style={[styles.detail, { color: colors.muted }]}>
                {user.emailVerified ? 'Verified' : 'Unverified'}
              </Text>
              <Text style={[styles.detail, { color: colors.muted }]}>
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </Text>
            </View>

            {protectedAdmin ? (
              <Text style={[styles.protectedText, { color: colors.warning }]}>
                Administrator accounts are protected from dashboard changes.
              </Text>
            ) : (
              <View style={styles.actions}>
                <View style={styles.action}>
                  <PrimaryButton
                    disabled={Boolean(busyUserId)}
                    label={
                      user.status === 'INACTIVE' ? 'Reactivate' : 'Deactivate'
                    }
                    loading={busy}
                    onPress={() => confirmStatusChange(user)}
                    variant="secondary"
                  />
                </View>
                <View style={styles.action}>
                  <PrimaryButton
                    disabled={Boolean(busyUserId)}
                    label="Delete"
                    loading={busy}
                    onPress={() => confirmPermanentDelete(user)}
                    variant="danger"
                  />
                </View>
              </View>
            )}
          </Card>
        );
      })}

      <PrimaryButton
        label="Sign out"
        onPress={() => logout()}
        variant="secondary"
      />
    </Screen>
  );
}

function Metric({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  const { colors } = useTheme();
  return (
    <Card style={styles.metricCard}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  headingRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 14 },
  flex: { flex: 1 },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.6,
  },
  title: { fontFamily: fonts.display, fontSize: 38, lineHeight: 43 },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },
  shield: {
    alignItems: 'center',
    borderRadius: 18,
    height: 50,
    justifyContent: 'center',
    width: 50,
  },
  metrics: { flexDirection: 'row', gap: 10 },
  metricCard: { flex: 1, padding: 13 },
  metricValue: { fontFamily: fonts.display, fontSize: 28 },
  metricLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    fontWeight: '800',
    marginTop: 2,
  },
  error: {
    fontFamily: fonts.body,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  emptyTitle: { fontFamily: fonts.displaySemibold, fontSize: 21 },
  emptyText: { fontFamily: fonts.body, fontSize: 13, marginTop: 5 },
  userHeader: { alignItems: 'flex-start', flexDirection: 'row', gap: 10 },
  userName: { fontFamily: fonts.displaySemibold, fontSize: 22 },
  email: { fontFamily: fonts.body, fontSize: 13, marginTop: 3 },
  statusBadge: { borderRadius: 20, paddingHorizontal: 9, paddingVertical: 6 },
  statusText: {
    fontFamily: fonts.body,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  details: {
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
  },
  detail: { fontFamily: fonts.body, fontSize: 11, fontWeight: '700' },
  actions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  action: { flex: 1 },
  protectedText: {
    fontFamily: fonts.body,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 14,
  },
});
