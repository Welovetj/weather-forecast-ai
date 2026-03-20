import { Alert, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

export const openExternalUrl = async (url, failureMessage = 'Unable to open the link.') => {
  try {
    const canOpen = await Linking.canOpenURL(url);

    if (canOpen) {
      await Linking.openURL(url);
      return true;
    }

    await WebBrowser.openBrowserAsync(url);
    return true;
  } catch (error) {
    try {
      await WebBrowser.openBrowserAsync(url);
      return true;
    } catch {
      Alert.alert('Open Link Failed', failureMessage);
      return false;
    }
  }
};
