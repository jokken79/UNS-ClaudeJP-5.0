'use client';

import { useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';
import {
  ArrowUpTrayIcon,
  CheckCircleIcon,
  CloudArrowUpIcon,
  DocumentMagnifyingGlassIcon,
  PhotoIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface AzureOCRUploaderProps {
  onResult: (data: Record<string, unknown>) => void;
  defaultDocumentType?: 'zairyu_card' | 'license' | 'rirekisho';
}

interface AzureOCRResponse {
  success: boolean;
  data?: Record<string, unknown>;
  message?: string;
}

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB safety limit for high-resolution scans

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif'];

function isSupportedType(file: File) {
  if (SUPPORTED_TYPES.includes(file.type)) return true;
  // Some browsers report HEIC/HEIF as application/octet-stream
  if (file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif')) {
    return true;
  }
  return false;
}

export function AzureOCRUploader({ onResult, defaultDocumentType = 'zairyu_card' }: AzureOCRUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [documentType, setDocumentType] = useState(defaultDocumentType);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const documentOptions = useMemo(
    () => [
      { value: 'zairyu_card', label: '在留カード (Zairyu Card)' },
      { value: 'license', label: '運転免許証 (Menkyosho)' },
      { value: 'rirekisho', label: '履歴書 (Rirekisho)' },
    ],
    []
  );

  const resetUploader = () => {
    setFile(null);
    setPreviewUrl(null);
    setProgress(0);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;

    if (!isSupportedType(selected)) {
      toast.error('対応していないファイル形式です。JPG / PNG / HEIC 画像を使用してください。');
      return;
    }

    if (selected.size > MAX_FILE_SIZE) {
      toast.error('ファイルサイズが大きすぎます。8MB 以下の画像を選択してください。');
      return;
    }

    setFile(selected);

    if (selected.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(selected);
    } else {
      setPreviewUrl(null);
    }
  };

  const uploadToAzure = async () => {
    if (!file) {
      toast.error('先に画像ファイルを選択してください。');
      return;
    }

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      toast.error('認証トークンが見つかりません。再ログインしてください。');
      return;
    }

    setIsUploading(true);
    setProgress(10);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    try {
      const response = await fetch('http://localhost:8000/api/azure-ocr/process', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => ({}));
        throw new Error(errorPayload.detail || 'Azure OCR の処理に失敗しました。');
      }

      setProgress(85);
      const payload = (await response.json()) as AzureOCRResponse;

      if (!payload?.success || !payload?.data) {
        throw new Error('OCR の結果が空です。もう一度お試しください。');
      }

      setProgress(100);
      toast.success('Azure OCR の解析が完了しました。');
      onResult({ ...payload.data, document_type: documentType });
    } catch (error: unknown) {
      console.error('Azure OCR upload error', error);
      const message = error instanceof Error ? error.message : 'Azure OCR の呼び出しに失敗しました。';
      toast.error(message);
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 1200);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <DocumentMagnifyingGlassIcon className="h-6 w-6 text-sky-600" />
        <div>
          <h3 className="text-lg font-semibold text-slate-900">Azure Computer Vision OCR</h3>
          <p className="text-sm text-slate-500">
            在留カード・免許証の画像をアップロードすると Azure OCR が自動で氏名や在留資格などを抽出します。
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-[220px_1fr] md:items-start">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700" htmlFor="azure-ocr-document-type">
            ドキュメント種別
          </label>
          <select
            id="azure-ocr-document-type"
            value={documentType}
            onChange={(event) => setDocumentType(event.target.value as AzureOCRUploaderProps['defaultDocumentType'])}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-200"
            disabled={isUploading}
          >
            {documentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-3 text-xs text-slate-500">
            <p className="flex items-center gap-2 font-medium text-slate-600">
              <CheckCircleIcon className="h-4 w-4 text-emerald-500" />
              推奨スキャンのポイント
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>書類の四隅が収まるように撮影してください。</li>
              <li>影や反射を避け、文字が鮮明に読める画像を使用してください。</li>
              <li>アップロード後、自動的に顔写真を切り出してフォームに挿入します。</li>
            </ul>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 p-4">
            {!file ? (
              <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-slate-300 bg-slate-50 text-center transition hover:border-sky-400 hover:bg-sky-50">
                <CloudArrowUpIcon className="h-10 w-10 text-sky-500" />
                <div className="text-sm font-medium text-slate-600">ファイルをドラッグ＆ドロップ、またはクリックして選択</div>
                <div className="text-xs text-slate-400">JPG / PNG / HEIC, 最大 8MB</div>
                <input
                  type="file"
                  accept="image/*,.heic,.heif"
                  className="hidden"
                  onChange={handleFileChange}
                  disabled={isUploading}
                />
              </label>
            ) : (
              <div className="relative overflow-hidden rounded-md border border-slate-200">
                <button
                  type="button"
                  className="absolute right-2 top-2 rounded-full bg-white/80 p-1 text-slate-500 shadow hover:text-rose-500"
                  onClick={resetUploader}
                  disabled={isUploading}
                  title="選択をクリア"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
                {previewUrl ? (
                  <img src={previewUrl} alt="ドキュメントプレビュー" className="h-48 w-full object-contain bg-white" />
                ) : (
                  <div className="flex h-48 items-center justify-center bg-slate-100 text-sm text-slate-500">
                    <PhotoIcon className="mr-2 h-6 w-6" /> プレビューなし
                  </div>
                )}
                <div className="border-t border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                  {file.name}・{(file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            )}

            {progress > 0 && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>解析進行状況</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-sky-500 transition-all"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={uploadToAzure}
              disabled={!file || isUploading}
              className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm transition ${
                !file || isUploading
                  ? 'bg-sky-300 cursor-not-allowed'
                  : 'bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-300'
              }`}
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              {isUploading ? 'Azure OCR 解析中…' : 'Azure OCR を実行'}
            </button>
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
            <p className="font-medium text-slate-600">サンプル画像でテストするには:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>リポジトリの <code className="rounded bg-slate-800/10 px-1">backend/zairyu.jpg</code> を使用してドラッグ＆ドロップ</li>
              <li><code className="rounded bg-slate-800/10 px-1">backend/menkyo.png</code> も対応しています (Menkyosho)</li>
              <li>アップロード後、抽出された氏名・在留カード番号などが自動入力されます。</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AzureOCRUploader;
