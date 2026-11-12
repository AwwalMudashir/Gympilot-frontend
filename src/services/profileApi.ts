import { launchImageLibrary } from 'react-native-image-picker';
import type { ApiEnvelope } from '../types/api';
import type { Profile, ProfilePayload } from '../types/profile';
import { apiClient, dataOf } from './http';
type ImageUpload = { id: string; url: string; purpose: string };

export const profileApi = {
  async get() {
    return dataOf(await apiClient.get<ApiEnvelope<Profile>>('/profile/me'));
  },
  async create(payload: ProfilePayload) {
    return dataOf(
      await apiClient.post<ApiEnvelope<Profile>>('/profile', payload),
    );
  },
  async update(payload: ProfilePayload) {
    return dataOf(
      await apiClient.put<ApiEnvelope<Profile>>('/profile', payload),
    );
  },
  async chooseAndUploadPicture() {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      selectionLimit: 1,
      quality: 0.8,
      maxWidth: 1600,
      maxHeight: 1600,
    });
    if (result.didCancel) return null;
    if (result.errorCode) {
      throw new Error(
        result.errorMessage ?? 'The photo library could not be opened.',
      );
    }
    const asset = result.assets?.[0];
    if (!asset?.uri) return null;
    if ((asset.fileSize ?? 0) > 5 * 1024 * 1024) {
      throw new Error('Choose a profile picture smaller than 5 MB.');
    }
    const form = new FormData();
    form.append('file', {
      uri: asset.uri,
      type: asset.type ?? 'image/jpeg',
      name: asset.fileName ?? 'profile.jpg',
    } as never);
    return dataOf(
      await apiClient.post<ApiEnvelope<ImageUpload>>('/profile/picture', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
    );
  },
  async deletePicture() {
    await apiClient.delete('/profile/picture');
  },
};
