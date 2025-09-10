import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      <main className="flex flex-col gap-8 items-center text-center max-w-4xl">
        <Image
          src="/images/pop-a-lock-logo.svg"
          alt="Pop-A-Lock Locksmith - Auto, Home, Business"
          width={300}
          height={120}
          priority
          className="mb-4"
        />
        
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-gray-900">Pop-A-Lock Franchise Management</h2>
          <p className="text-xl text-gray-700">Complete locksmith services management platform</p>
          
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center justify-center gap-2">
              <span>🔧</span>
              Our Services
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚗</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Automotive</h4>
                  <p className="text-gray-600">Car lockouts, key programming, ignition repair</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🏢</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Commercial</h4>
                  <p className="text-gray-600">Office locks, access control, master key systems</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🏠</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Residential</h4>
                  <p className="text-gray-600">Home lockouts, lock installation, security upgrades</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-2xl">🛣️</span>
                <div>
                  <h4 className="font-semibold text-gray-900">Roadside</h4>
                  <p className="text-gray-600">Emergency lockout assistance, 24/7 mobile service</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-6 items-center flex-wrap justify-center">
          <a
            href="/admin"
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg"
          >
            <span>⚙️</span>
            Admin Dashboard
          </a>
          <a
            href="/franchisee"
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold shadow-lg"
          >
            <span>🏢</span>
            Franchisee Portal
          </a>
          <a
            href="/tech/login"
            className="flex items-center gap-2 bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors font-semibold shadow-lg"
          >
            <span>🔧</span>
            Tech Login
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Learn
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/window.svg"
            alt="Window icon"
            width={16}
            height={16}
          />
          Examples
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="https://nextjs.org?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to nextjs.org →
        </a>
      </footer>
    </div>
  );
}
