'use client';

import { useRef, useState } from 'react';
import CameraModal from './CameraModal';

interface FileOrCameraInputProps {
  accept?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileCapture?: (file: File) => void;
  disabled?: boolean;
  uploadLabel?: string;
  cameraLabel?: string;
  className?: string;
  uploadClassName?: string;
  cameraClassName?: string;
}

export default function FileOrCameraInput({
  accept = 'image/*',
  onChange,
  onFileCapture,
  disabled = false,
  uploadLabel = 'Escolher arquivo',
  cameraLabel = 'Tirar foto',
  uploadClassName = 'bg-gray-100 hover:bg-gray-200 text-gray-700',
  cameraClassName = 'bg-primary-50 hover:bg-primary-100 text-primary-700',
}: FileOrCameraInputProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [showCamera, setShowCamera] = useState(false);

  const handleCameraCapture = (file: File) => {
    setShowCamera(false);
    if (onFileCapture) {
      onFileCapture(file);
      return;
    }
    const dt = new DataTransfer();
    dt.items.add(file);
    const input = fileRef.current;
    if (input) {
      input.files = dt.files;
      const event = new Event('change', { bubbles: true });
      input.dispatchEvent(event);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        <label
          className={`inline-flex items-center gap-1.5 cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition ${uploadClassName} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {uploadLabel}
          <input
            ref={fileRef}
            type="file"
            accept={accept}
            onChange={onChange}
            disabled={disabled}
            className="hidden"
          />
        </label>

        <button
          type="button"
          onClick={() => setShowCamera(true)}
          disabled={disabled}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition ${cameraClassName} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {cameraLabel}
        </button>
      </div>

      {showCamera && (
        <CameraModal
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </>
  );
}
