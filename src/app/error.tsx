'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f0e8' }}>
      <div className="text-center max-w-md px-4">
        <div className="text-8xl mb-6 opacity-80">☕</div>

        <h1 style={{ fontFamily: "'Nanum Pen Script', cursive" }} className="text-4xl text-gray-800 mb-4">
          500 - 시스템 오류
        </h1>

        <p style={{ fontFamily: "'Nanum Pen Script', cursive" }} className="text-xl text-gray-600 mb-2">
          커피를 쏟아 글씨가 번졌습니다...
        </p>

        <p style={{ fontFamily: "'Nanum Pen Script', cursive" }} className="text-gray-500 mb-8 text-sm">
          {error.message || '알 수 없는 오류가 발생했습니다.'}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={reset}
            className="px-8 py-3 rounded-xl text-lg transition-all hover:shadow-lg"
            style={{
              fontFamily: "'Nanum Pen Script', cursive",
              background: '#6366f1',
              color: 'white',
            }}
          >
            🔄 다시 시도하기
          </button>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}
            className="px-8 py-3 rounded-xl text-lg transition-all hover:shadow-lg"
            style={{
              fontFamily: "'Nanum Pen Script', cursive",
              background: '#ef4444',
              color: 'white',
            }}
          >
            🗑️ 로컬 데이터 초기화하고 다시 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
