'use client';

import { useEffect, useState } from 'react';
import { initializeData } from '@/lib/data-init';

export function DataInitializer() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeData().catch(e => {
      console.error('Init failed:', e);
      setError(e.message);
    });
  }, []);

  if (error) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#f5f0e8]">
        <div className="max-w-md p-8 text-center">
          <div className="text-6xl mb-4">☕</div>
          <h2 className="handwritten-title text-2xl text-gray-800 mb-4">
            커피를 쏟아 글씨가 번졌습니다...
          </h2>
          <p className="handwritten text-gray-600 mb-6">
            데이터를 불러오는 중 오류가 발생했습니다.<br/>
            {error}
          </p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="px-6 py-3 bg-red-500 text-white rounded-lg handwritten text-lg hover:bg-red-600 transition-colors"
          >
            로컬 데이터 초기화하고 다시 시작하기
          </button>
        </div>
      </div>
    );
  }

  return null;
}
