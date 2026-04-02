import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f5f0e8' }}>
      <div className="text-center max-w-md px-4">
        {/* Torn paper effect */}
        <div className="relative inline-block mb-8">
          <div className="text-8xl transform rotate-12 opacity-60">📝</div>
          <div className="absolute -bottom-2 -right-2 text-4xl">💨</div>
        </div>

        <h1 style={{ fontFamily: "'Nanum Pen Script', cursive" }} className="text-4xl text-gray-800 mb-4">
          404 - 페이지를 찾을 수 없습니다
        </h1>

        <p style={{ fontFamily: "'Nanum Pen Script', cursive" }} className="text-xl text-gray-600 mb-2">
          아직 개발자가 여기까지 쓰지 못하고<br />도망갔습니다.
        </p>

        <p style={{ fontFamily: "'Nanum Pen Script', cursive" }} className="text-gray-500 mb-8">
          찢어진 노트 조각만 남았네요...
        </p>

        <Link
          href="/"
          className="inline-block px-8 py-3 rounded-xl text-lg transition-all hover:shadow-lg"
          style={{
            fontFamily: "'Nanum Pen Script', cursive",
            background: '#f59e0b',
            color: 'white',
          }}
        >
          🏠 메인으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
