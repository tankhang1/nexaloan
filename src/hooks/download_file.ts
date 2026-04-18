import {Platform, PermissionsAndroid, Alert} from 'react-native';
import dayjs from 'dayjs';
import ReactNativeFilesystem, {
  ReactNativeFilesystemCommonMimeTypes,
  ReactNativeFilesystemDirectoryKind,
  resolveReactNativeFilesystemFilePath,
} from 'react-native-simple-fs';

export type FileType = 'image' | 'pdf' | 'doc' | 'docx' | 'excel';

interface DownloadParams {
  url: string;
  fileType: FileType;
  filename?: string;
}

const downloadFileWithPermission = async ({
  url,
  fileType,
  filename = '',
}: DownloadParams): Promise<void> => {
  const isAndroid = Platform.OS === 'android';

  if (isAndroid) {
    const deviceVersion = parseInt(Platform.Version.toString(), 10);
    let granted = PermissionsAndroid.RESULTS.DENIED;

    if (deviceVersion >= 13) {
      granted = PermissionsAndroid.RESULTS.GRANTED;
    } else {
      granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to your storage to download files.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
    }

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      downloadFile(url, fileType, filename);
    } else {
      Alert.alert(
        'Permission Denied',
        'Storage permission is required to download files.',
      );
    }
  } else {
    // Handle iOS or other platforms
    downloadFile(url, fileType, filename);
  }
};

const downloadFile = (
  url: string,
  fileType: FileType,
  filename: string,
): void => {
  try {
    let extension: string;
    let mimeType: string | undefined;

    switch (fileType) {
      case 'image':
        extension = 'jpg';
        mimeType = ReactNativeFilesystemCommonMimeTypes.Jpeg;
        break;
      case 'pdf':
        extension = 'pdf';
        mimeType = ReactNativeFilesystemCommonMimeTypes.Pdf;
        break;
      case 'doc':
        mimeType = 'application/msword';
        extension = 'doc';
        break;
      case 'docx':
        mimeType =
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        extension = fileType;
        break;
      case 'excel':
        extension = 'xlsx';
        mimeType =
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        break;
      default:
        throw new Error(`Unsupported file extension: ${fileType}`);
    }

    const outputFilename = `${filename}-${dayjs().format(
      'DD-MM-YYYY',
    )}.${extension}`;

    void (async () => {
      const destinationPath = await resolveReactNativeFilesystemFilePath(
        {kind: ReactNativeFilesystemDirectoryKind.Documents},
        outputFilename,
      );

      const result = await ReactNativeFilesystem.downloadFile(
        url,
        destinationPath,
        {
          mimeType,
          saveToDownloads: Platform.OS === 'android',
        },
      );

      Alert.alert('Download Complete', `File saved to ${result.path}`);
      console.log('Download success:', result.path);
    })().catch(error => {
      console.log('Fetch error:', error.message);
    });
  } catch (error: any) {
    console.log('ReactNativeFilesystem ERROR:', error.message);
  }
};

export {downloadFileWithPermission};
