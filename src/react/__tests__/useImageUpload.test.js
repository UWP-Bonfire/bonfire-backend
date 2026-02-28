
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, afterEach, vi } from 'vitest';
import useImageUpload from '../hooks/useImageUpload';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Mock Firebase storage and uuid
vi.mock('firebase/storage');
vi.mock('uuid', () => ({
  v4: () => 'mock-uuid',
}));
vi.mock('../../firebase', () => ({
    storage: 'mock-storage'
}));


describe('useImageUpload', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return initial state correctly', () => {
    const { result } = renderHook(() => useImageUpload());

    expect(result.current.isUploading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should set an error if no image file is provided', async () => {
    const { result } = renderHook(() => useImageUpload());

    await act(async () => {
      await result.current.uploadImage(null);
    });

    expect(result.current.error).toBe('No image file provided.');
    expect(uploadBytes).not.toHaveBeenCalled();
  });

  it('should upload an image and return the download URL on success', async () => {
    const { result } = renderHook(() => useImageUpload());
    const imageFile = new File(['test'], 'test.png', { type: 'image/png' });
    const downloadURL = 'http://example.com/test.png';

    ref.mockReturnValue('mock-ref');
    uploadBytes.mockResolvedValue({ ref: 'mock-snapshot-ref' });
    getDownloadURL.mockResolvedValue(downloadURL);

    let returnedUrl;
    await act(async () => {
        returnedUrl = await result.current.uploadImage(imageFile);
    });

    expect(ref).toHaveBeenCalledWith('mock-storage', 'Chat_Media/mock-uuid.png');
    expect(uploadBytes).toHaveBeenCalledWith('mock-ref', imageFile);
    expect(getDownloadURL).toHaveBeenCalledWith('mock-snapshot-ref');
    expect(result.current.isUploading).toBe(false);
    expect(returnedUrl).toBe(downloadURL);
    expect(result.current.error).toBe(null);
  });

  it('should set an error on upload failure', async () => {
    const { result } = renderHook(() => useImageUpload());
    const imageFile = new File(['test'], 'test.png', { type: 'image/png' });
    const error = new Error('Upload failed');

    uploadBytes.mockRejectedValue(error);

    let returnedUrl;
    await act(async () => {
        returnedUrl = await result.current.uploadImage(imageFile);
    });

    expect(result.current.isUploading).toBe(false);
    expect(result.current.error).toBe('Failed to upload image.');
    expect(returnedUrl).toBe(null);
  });
});
