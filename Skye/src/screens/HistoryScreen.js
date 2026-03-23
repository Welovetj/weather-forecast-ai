import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { deleteSearch, getAllSearches, updateSearch } from '../utils/database';
import { exportToCSV, exportToJSON } from '../utils/exportUtils';

const formatDate = (value) => {
  if (!value) {
    return '--';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatDateTime = (value) => {
  if (!value) {
    return '--';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '--';
  }

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

const formatTemp = (value, unit) => {
  if (typeof value !== 'number') {
    return '--';
  }

  const suffix = unit === 'imperial' ? 'F' : 'C';
  return `${Math.round(value)}°${suffix}`;
};

const HistoryScreen = ({ theme, colors }) => {
  const [searches, setSearches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState(null);
  const [editTempMin, setEditTempMin] = useState('');
  const [editTempMax, setEditTempMax] = useState('');
  const [editCondition, setEditCondition] = useState('');
  const [editError, setEditError] = useState('');
  const [saving, setSaving] = useState(false);
  const [exportingType, setExportingType] = useState('');
  const styles = useMemo(() => createStyles(colors, theme), [colors, theme]);

  const loadHistory = useCallback(async () => {
    try {
      setError('');
      const rows = await getAllSearches({ limit: 300 });
      setSearches(Array.isArray(rows) ? rows : []);
    } catch (err) {
      setError(err?.message || 'Failed to load search history.');
      setSearches([]);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      await loadHistory();
      if (isMounted) {
        setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [loadHistory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadHistory();
    setRefreshing(false);
  }, [loadHistory]);

  const handleDelete = useCallback((id) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this record?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSearch(id);
              await loadHistory();
            } catch (err) {
              setError(err?.message || 'Failed to delete record.');
            }
          },
        },
      ],
    );
  }, [loadHistory]);

  const handleOpenEdit = useCallback((item) => {
    setEditingRecordId(item?.id ?? null);
    setEditTempMin(
      typeof item?.temp_min === 'number' && !Number.isNaN(item.temp_min)
        ? String(item.temp_min)
        : '',
    );
    setEditTempMax(
      typeof item?.temp_max === 'number' && !Number.isNaN(item.temp_max)
        ? String(item.temp_max)
        : '',
    );
    setEditCondition(item?.condition ? String(item.condition) : '');
    setEditError('');
    setIsEditModalVisible(true);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setIsEditModalVisible(false);
    setEditingRecordId(null);
    setEditTempMin('');
    setEditTempMax('');
    setEditCondition('');
    setEditError('');
  }, []);

  const handleSaveEdit = useCallback(async () => {
    const tempMinValue = Number(editTempMin);
    const tempMaxValue = Number(editTempMax);
    const nextCondition = editCondition.trim();

    if (Number.isNaN(tempMinValue) || Number.isNaN(tempMaxValue)) {
      setEditError('Temperature values must be valid numbers.');
      return;
    }

    if (tempMinValue > tempMaxValue) {
      setEditError('Temp min cannot be greater than temp max.');
      return;
    }

    if (!nextCondition) {
      setEditError('Condition cannot be empty.');
      return;
    }

    if (!editingRecordId) {
      setEditError('Unable to update this record.');
      return;
    }

    try {
      setSaving(true);
      setEditError('');
      await updateSearch(editingRecordId, {
        temp_min: tempMinValue,
        temp_max: tempMaxValue,
        condition: nextCondition,
      });
      await loadHistory();
      handleCloseEdit();
    } catch (err) {
      setEditError(err?.message || 'Failed to update record.');
    } finally {
      setSaving(false);
    }
  }, [editCondition, editTempMax, editTempMin, editingRecordId, handleCloseEdit, loadHistory]);

  const handleExport = useCallback(async (type) => {
    try {
      setExportingType(type);
      const allRecords = await getAllSearches();
      const normalizedRecords = Array.isArray(allRecords) ? allRecords : [];

      if (normalizedRecords.length === 0) {
        Alert.alert('No Records', 'There are no records to export yet.');
        return;
      }

      if (type === 'csv') {
        await exportToCSV(normalizedRecords);
        Alert.alert('Export Complete', 'CSV file is ready to share.');
      } else {
        await exportToJSON(normalizedRecords);
        Alert.alert('Export Complete', 'JSON file is ready to share.');
      }
    } catch (err) {
      Alert.alert('Export Failed', err?.message || 'Failed to export history records.');
    } finally {
      setExportingType('');
    }
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.location}>{item.location || 'Unknown location'}</Text>
        <View style={styles.actionsRow}>
          <Pressable
            onPress={() => handleOpenEdit(item)}
            style={styles.editButton}
            accessibilityRole="button"
            accessibilityLabel="Edit this history record"
          >
            <Text style={styles.editButtonText}>Edit</Text>
          </Pressable>
          <Pressable
            onPress={() => handleDelete(item.id)}
            style={styles.deleteButton}
            accessibilityRole="button"
            accessibilityLabel="Delete this history record"
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.range}>Date Range: {formatDate(item.date_from)} - {formatDate(item.date_to)}</Text>
      <Text style={styles.meta}>Temp Min: {formatTemp(item.temp_min, item.unit)}</Text>
      <Text style={styles.meta}>Temp Max: {formatTemp(item.temp_max, item.unit)}</Text>
      <Text style={styles.meta}>Condition: {item.condition || '--'}</Text>
      <Text style={styles.created}>Saved: {formatDateTime(item.created_at)}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerState}>
        <ActivityIndicator size="large" color={colors?.accent || '#0EA5E9'} />
        <Text style={styles.stateText}>Loading history...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search History</Text>

      <View style={styles.exportRow}>
        <Pressable
          onPress={() => handleExport('csv')}
          style={[styles.exportButton, exportingType === 'csv' ? styles.exportButtonDisabled : null]}
          accessibilityRole="button"
          accessibilityLabel="Export history as CSV"
          disabled={Boolean(exportingType)}
        >
          <Text style={styles.exportButtonText}>{exportingType === 'csv' ? 'Exporting CSV...' : 'Export CSV'}</Text>
        </Pressable>
        <Pressable
          onPress={() => handleExport('json')}
          style={[styles.exportButton, exportingType === 'json' ? styles.exportButtonDisabled : null]}
          accessibilityRole="button"
          accessibilityLabel="Export history as JSON"
          disabled={Boolean(exportingType)}
        >
          <Text style={styles.exportButtonText}>{exportingType === 'json' ? 'Exporting JSON...' : 'Export JSON'}</Text>
        </Pressable>
      </View>

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Could Not Load History</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <FlatList
        data={searches}
        keyExtractor={(item, index) => `${item.id ?? 'row'}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={searches.length === 0 ? styles.listEmptyContent : styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={(
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors?.accent || '#0EA5E9'}
          />
        )}
        ListEmptyComponent={(
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🗂️</Text>
            <Text style={styles.emptyTitle}>No Saved Searches Yet</Text>
            <Text style={styles.emptySubtitle}>Searches are saved automatically when you look up weather. Here's how:</Text>

            <View style={styles.stepList}>
              <View style={styles.stepRow}>
                <View style={styles.stepBadge}><Text style={styles.stepNum}>1</Text></View>
                <View style={styles.stepBody}>
                  <Text style={styles.stepHeading}>Go to the Home tab</Text>
                  <Text style={styles.stepDetail}>Tap the 🌤 Home tab at the bottom of the screen.</Text>
                </View>
              </View>

              <View style={styles.stepRow}>
                <View style={styles.stepBadge}><Text style={styles.stepNum}>2</Text></View>
                <View style={styles.stepBody}>
                  <Text style={styles.stepHeading}>Search for a city</Text>
                  <Text style={styles.stepDetail}>Type any city name (e.g. "Calgary") into the search bar and press Search.</Text>
                </View>
              </View>

              <View style={styles.stepRow}>
                <View style={styles.stepBadge}><Text style={styles.stepNum}>3</Text></View>
                <View style={styles.stepBody}>
                  <Text style={styles.stepHeading}>Wait for weather to load</Text>
                  <Text style={styles.stepDetail}>Once the weather data appears, it is automatically saved to your history.</Text>
                </View>
              </View>

              <View style={styles.stepRow}>
                <View style={styles.stepBadge}><Text style={styles.stepNum}>4</Text></View>
                <View style={styles.stepBody}>
                  <Text style={styles.stepHeading}>Come back here</Text>
                  <Text style={styles.stepDetail}>Return to the 📋 History tab and your search record will appear here.</Text>
                </View>
              </View>
            </View>

            <View style={styles.emptyTipBox}>
              <Text style={styles.emptyTipText}>💡 Tip: You can also use the locate button (📍) on the Home screen to auto-detect your city and save it.</Text>
            </View>
          </View>
        )}
      />

      <Modal
        transparent
        visible={isEditModalVisible}
        animationType="fade"
        onRequestClose={handleCloseEdit}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit Record</Text>

            <Text style={styles.inputLabel}>Temp Min</Text>
            <TextInput
              value={editTempMin}
              onChangeText={setEditTempMin}
              style={styles.input}
              keyboardType="decimal-pad"
              placeholder="Enter minimum temperature"
              placeholderTextColor={theme === 'dark' ? 'rgba(255,255,255,0.35)' : '#9CA3AF'}
            />

            <Text style={styles.inputLabel}>Temp Max</Text>
            <TextInput
              value={editTempMax}
              onChangeText={setEditTempMax}
              style={styles.input}
              keyboardType="decimal-pad"
              placeholder="Enter maximum temperature"
              placeholderTextColor={theme === 'dark' ? 'rgba(255,255,255,0.35)' : '#9CA3AF'}
            />

            <Text style={styles.inputLabel}>Condition</Text>
            <TextInput
              value={editCondition}
              onChangeText={setEditCondition}
              style={styles.input}
              placeholder="Enter weather condition"
              placeholderTextColor={theme === 'dark' ? 'rgba(255,255,255,0.35)' : '#9CA3AF'}
            />

            {editError ? <Text style={styles.modalErrorText}>{editError}</Text> : null}

            <View style={styles.modalActions}>
              <Pressable
                onPress={handleCloseEdit}
                style={styles.modalCancelButton}
                accessibilityRole="button"
                accessibilityLabel="Cancel editing"
                disabled={saving}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveEdit}
                style={[styles.modalSaveButton, saving ? styles.modalSaveButtonDisabled : null]}
                accessibilityRole="button"
                accessibilityLabel="Save record updates"
                disabled={saving}
              >
                <Text style={styles.modalSaveText}>{saving ? 'Saving...' : 'Save'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const createStyles = (colors, theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 16,
      paddingTop: 20,
    },
    title: {
      color: colors.text,
      fontSize: 28,
      fontWeight: '800',
      marginBottom: 12,
    },
    exportRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 10,
    },
    exportButton: {
      flex: 1,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(125,211,252,0.42)' : '#7DD3FC',
      backgroundColor: theme === 'dark' ? 'rgba(8,47,73,0.34)' : '#ECFEFF',
      paddingVertical: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    exportButtonDisabled: {
      opacity: 0.58,
    },
    exportButtonText: {
      color: theme === 'dark' ? '#BAE6FD' : '#0C4A6E',
      fontSize: 13,
      fontWeight: '800',
    },
    listContent: {
      gap: 10,
      paddingBottom: 24,
    },
    listEmptyContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingBottom: 24,
    },
    card: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(17,24,39,0.08)',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: theme === 'dark' ? 0.2 : 0.08,
      shadowRadius: 8,
      elevation: 3,
      gap: 5,
    },
    cardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 10,
    },
    actionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    location: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '800',
      marginBottom: 2,
      flex: 1,
    },
    editButton: {
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(125,211,252,0.48)' : '#7DD3FC',
      backgroundColor: theme === 'dark' ? 'rgba(8,47,73,0.35)' : '#ECFEFF',
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    editButtonText: {
      color: theme === 'dark' ? '#BAE6FD' : '#0C4A6E',
      fontSize: 12,
      fontWeight: '800',
    },
    deleteButton: {
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(252,165,165,0.48)' : '#FCA5A5',
      backgroundColor: theme === 'dark' ? 'rgba(127,29,29,0.26)' : '#FEF2F2',
      borderRadius: 10,
      paddingHorizontal: 10,
      paddingVertical: 6,
    },
    deleteButtonText: {
      color: theme === 'dark' ? '#FECACA' : '#991B1B',
      fontSize: 12,
      fontWeight: '800',
    },
    range: {
      color: colors.text,
      opacity: 0.86,
      fontSize: 14,
      fontWeight: '600',
    },
    meta: {
      color: colors.text,
      opacity: 0.74,
      fontSize: 14,
      lineHeight: 20,
      fontWeight: '500',
    },
    created: {
      color: colors.accent,
      fontSize: 12,
      fontWeight: '700',
      marginTop: 6,
    },
    emptyCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(17,24,39,0.08)',
      padding: 20,
      gap: 12,
    },
    emptyIcon: {
      fontSize: 40,
      textAlign: 'center',
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '800',
      textAlign: 'center',
    },
    emptySubtitle: {
      color: colors.text,
      opacity: 0.72,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
    emptyText: {
      color: colors.text,
      opacity: 0.72,
      fontSize: 14,
      textAlign: 'center',
      lineHeight: 20,
    },
    stepList: {
      gap: 14,
      marginTop: 4,
    },
    stepRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
    },
    stepBadge: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      marginTop: 1,
    },
    stepNum: {
      color: '#FFFFFF',
      fontWeight: '800',
      fontSize: 13,
    },
    stepBody: {
      flex: 1,
      gap: 2,
    },
    stepHeading: {
      color: colors.text,
      fontWeight: '700',
      fontSize: 15,
    },
    stepDetail: {
      color: colors.text,
      opacity: 0.72,
      fontSize: 13,
      lineHeight: 19,
    },
    emptyTipBox: {
      backgroundColor: theme === 'dark' ? 'rgba(14,165,233,0.12)' : 'rgba(14,165,233,0.08)',
      borderRadius: 10,
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(125,211,252,0.28)' : 'rgba(14,165,233,0.24)',
      padding: 12,
      marginTop: 4,
    },
    emptyTipText: {
      color: theme === 'dark' ? '#BAE6FD' : '#0C4A6E',
      fontSize: 13,
      lineHeight: 19,
      fontWeight: '500',
    },
    centerState: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      paddingHorizontal: 20,
    },
    stateText: {
      color: colors.text,
      opacity: 0.78,
      fontSize: 14,
      fontWeight: '600',
    },
    errorCard: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(252,165,165,0.48)' : '#FCA5A5',
      backgroundColor: theme === 'dark' ? 'rgba(127,29,29,0.28)' : '#FEF2F2',
      paddingHorizontal: 12,
      paddingVertical: 10,
      marginBottom: 10,
      gap: 4,
    },
    errorTitle: {
      color: theme === 'dark' ? '#FECACA' : '#991B1B',
      fontSize: 13,
      fontWeight: '800',
    },
    errorText: {
      color: theme === 'dark' ? '#FEE2E2' : '#7F1D1D',
      fontSize: 13,
      lineHeight: 18,
      fontWeight: '600',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(2,6,23,0.62)',
      justifyContent: 'center',
      paddingHorizontal: 18,
    },
    modalCard: {
      backgroundColor: colors.surface,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(17,24,39,0.08)',
      padding: 16,
      gap: 10,
    },
    modalTitle: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '800',
      marginBottom: 2,
    },
    inputLabel: {
      color: colors.text,
      fontSize: 12,
      fontWeight: '700',
      opacity: 0.75,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    input: {
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.16)' : 'rgba(17,24,39,0.15)',
      backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(17,24,39,0.02)',
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    modalErrorText: {
      color: theme === 'dark' ? '#FECACA' : '#991B1B',
      fontSize: 13,
      fontWeight: '700',
      lineHeight: 18,
      marginTop: 2,
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 10,
      marginTop: 4,
    },
    modalCancelButton: {
      borderWidth: 1,
      borderColor: theme === 'dark' ? 'rgba(255,255,255,0.18)' : 'rgba(17,24,39,0.15)',
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 8,
      backgroundColor: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
    },
    modalCancelText: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
    },
    modalSaveButton: {
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 8,
      backgroundColor: colors.accent,
    },
    modalSaveButtonDisabled: {
      opacity: 0.55,
    },
    modalSaveText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '800',
    },
  });

export default HistoryScreen;
