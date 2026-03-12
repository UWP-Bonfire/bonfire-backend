
import { renderHook, act } from '@testing-library/react';
import useVoiceUpload from '../hooks/useVoiceUpload';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../../firebase';

// Mock dependencies
vi.mock('../../firebase', () => ({
  storage: 'mock-storage',
}));

vi.mock('firebase/storage', () => ({
  ref: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
}));

vi.mock('uuid', () => ({
  v4: vi.fn(),
}));

describe('useVoiceUpload hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with correct default states', () => {
    const { result } = renderHook(() => useVoiceUpload());

    expect(result.current.isUploading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should set error when no audio file is provided', async () => {
    const { result } = renderHook(() => useVoiceUpload());

    await act(async () => {
      const downloadURL = await result.current.uploadVoiceMessage(null);
      expect(downloadURL).toBeUndefined();
    });

    expect(result.current.error).toBe('No audio file provided.');
    expect(result.current.isUploading).toBe(false);
  });

  it('should successfully upload a voice message and return a download URL', async () => {
    const mockFile = new File(['dummy-audio-content'], 'voice.mp3', { type: 'audio/mpeg' });
    const mockUrl = 'https://firebasestorage.googleapis.com/.../voice.mp3';
    const mockStorageRef = 'mock-storage-ref';

    uuidv4.mockReturnValue('mock-uuid');
    ref.mockReturnValue(mockStorageRef);
    uploadBytes.mockResolvedValue({ ref: mockStorageRef });
    getDownloadURL.mockResolvedValue(mockUrl);

    const { result } = renderHook(() => useVoiceUpload());

    let downloadURL;
    await act(async () => {
      downloadURL = await result.current.uploadVoiceMessage(mockFile);
    });

    expect(uuidv4).toHaveBeenCalled();
    expect(ref).toHaveBeenCalledWith(storage, 'Voice_Messages/mock-uuid.mp3');
    expect(uploadBytes).toHaveBeenCalledWith(mockStorageRef, mockFile);
    expect(getDownloadURL).toHaveBeenCalledWith(mockStorageRef);
    expect(downloadURL).toBe(mockUrl);
    expect(result.current.isUploading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should handle errors during the upload process', async () => {
    const mockFile = new File(['dummy-audio-content'], 'voice.mp3', { type: 'audio/mpeg' });
    const mockError = new Error('Upload failed');
    const mockStorageRef = 'mock-storage-ref';

    uuidv4.mockReturnValue('mock-uuid');
    ref.mockReturnValue(mockStorageRef);
    uploadBytes.mockRejectedValue(mockError);

    const { result } = renderHook(() => useVoiceUpload());

    let downloadURL;
    await act(async () => {
      downloadURL = await result.current.uploadVoiceMessage(mockFile);
    });

    expect(uploadBytes).toHaveBeenCalled();
    expect(getDownloadURL).not.toHaveBeenCalled();
    expect(downloadURL).toBe(null);
    expect(result.current.isUploading).toBe(false);
    expect(result.current.error).toBe('Failed to upload audio.');
  });
});
