import {Platform, Alert} from 'react-native';
import dayjs from 'dayjs';
import ReactNativeFilesystem, {
  ReactNativeFilesystemCommonMimeTypes,
  ReactNativeFilesystemDirectoryKind,
  resolveReactNativeFilesystemFilePath,
} from 'react-native-simple-fs';

export const copyLocalFile = async (localUri: string, filename: string) => {
  try {
    const sourcePath = localUri.startsWith('file://')
      ? localUri.replace('file://', '')
      : localUri;

    let extension = 'file';
    if (filename.includes('.')) {
      extension = filename.split('.').pop()!;
    }

    const normalizedFilename = filename.includes('.')
      ? filename.slice(0, filename.lastIndexOf('.'))
      : filename;
    const outputFilename = `${normalizedFilename}-${dayjs().format(
      'DD-MM-YYYY',
    )}.${extension}`;

    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'];
    if (imageExtensions.includes(extension.toLowerCase())) {
      const mimeType =
        extension.toLowerCase() === 'png'
          ? ReactNativeFilesystemCommonMimeTypes.Png
          : ReactNativeFilesystemCommonMimeTypes.Jpeg;
      const asset = await ReactNativeFilesystem.saveImageToLibrary(sourcePath, {
        filename: outputFilename,
        mimeType,
      });
      Alert.alert('Success', `Image saved to library: ${asset.uri}`);
      console.log('Image saved:', asset);
      return;
    }

    const destPath = await resolveReactNativeFilesystemFilePath(
      {kind: ReactNativeFilesystemDirectoryKind.Documents},
      outputFilename,
    );
    await ReactNativeFilesystem.copy(sourcePath, destPath);

    Alert.alert('Success', `File saved to: ${destPath}`);
    console.log('File copied:', destPath);
  } catch (error) {
    console.error('Error copying file:', error);
    Alert.alert('Error', 'Failed to save file locally.');
  }
};
