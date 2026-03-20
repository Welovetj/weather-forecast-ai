import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

const CSV_HEADERS = [
  'id',
  'location',
  'latitude',
  'longitude',
  'date_from',
  'date_to',
  'temp_min',
  'temp_max',
  'condition',
  'unit',
  'created_at',
];

const escapeCsvValue = (value) => {
  if (value == null) {
    return '';
  }

  const normalized = String(value).replace(/\r?\n|\r/g, ' ');
  const escaped = normalized.replace(/"/g, '""');
  return `"${escaped}"`;
};

const recordToCsvRow = (record) => {
  const rowValues = CSV_HEADERS.map((key) => escapeCsvValue(record?.[key]));
  return rowValues.join(',');
};

const getBaseDirectory = () => {
  const baseDirectory = FileSystem.documentDirectory || FileSystem.cacheDirectory;
  if (!baseDirectory) {
    throw new Error('File system directory is not available on this device.');
  }

  return baseDirectory;
};

const ensureShareAvailability = async () => {
  const canShare = await Sharing.isAvailableAsync();
  if (!canShare) {
    throw new Error('Sharing is not available on this device.');
  }
};

export const exportToCSV = async (data) => {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array of search records.');
  }

  const headerRow = CSV_HEADERS.join(',');
  const bodyRows = data.map(recordToCsvRow);
  const csvContent = [headerRow, ...bodyRows].join('\n');

  const baseDirectory = getBaseDirectory();

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileUri = `${baseDirectory}weather-search-history-${timestamp}.csv`;

  await FileSystem.writeAsStringAsync(fileUri, csvContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  await ensureShareAvailability();

  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/csv',
    dialogTitle: 'Export Search History',
    UTI: 'public.comma-separated-values-text',
  });

  return fileUri;
};

export const exportToJSON = async (data) => {
  if (!Array.isArray(data)) {
    throw new Error('Data must be an array of search records.');
  }

  const jsonContent = JSON.stringify(data, null, 2);
  const baseDirectory = getBaseDirectory();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fileUri = `${baseDirectory}weather-search-history-${timestamp}.json`;

  await FileSystem.writeAsStringAsync(fileUri, jsonContent, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  await ensureShareAvailability();

  await Sharing.shareAsync(fileUri, {
    mimeType: 'application/json',
    dialogTitle: 'Export Search History',
    UTI: 'public.json',
  });

  return fileUri;
};
