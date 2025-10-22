'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditCandidatePage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  useEffect(() => {
    // Redirect to the new rirekisho form
    // Note: The rirekisho form doesn't currently support editing existing candidates
    // This redirect maintains the URL structure for future implementation
    router.replace('/candidates/rirekisho');
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            候補者情報編集
          </h1>
          <p className="text-gray-600">
            候補者ID: {id}
          </p>
          <p className="text-gray-600 mt-4">
            履歴書フォームにリダイレクトしています...
          </p>
        </div>
      </div>
    </div>
  );
}
