import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <Image
          src="/images/pop-a-lock-logo.svg"
          alt="Pop-A-Lock Locksmith - Auto, Home, Business"
          width={300}
          height={120}
          priority
          className="mb-4"
        />
        <div className="text-center sm:text-left max-w-2xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">🔐 Pop-A-Lock Franchise Management</h2>
          <p className="text-lg text-gray-700 mb-6">Complete locksmith services management platform</p>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🔧</span>
                Our Services
              </CardTitle>
              <CardDescription>
                Professional locksmith services for all your security needs
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">🚗</Badge>
                  <div>
                    <p className="font-medium">Automotive</p>
                    <p className="text-sm text-gray-600">Car lockouts, key programming, ignition repair</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">🏢</Badge>
                  <div>
                    <p className="font-medium">Commercial</p>
                    <p className="text-sm text-gray-600">Office locks, access control, master key systems</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">🏠</Badge>
                  <div>
                    <p className="font-medium">Residential</p>
                    <p className="text-sm text-gray-600">Home lockouts, lock installation, security upgrades</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">🛣️</Badge>
                  <div>
                    <p className="font-medium">Roadside</p>
                    <p className="text-sm text-gray-600">Emergency lockout assistance, 24/7 mobile service</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <a href="/admin">
              <span>⚙️</span>
              Admin Dashboard
            </a>
          </Button>
          <Button asChild size="lg" className="bg-green-600 hover:bg-green-700">
            <a href="/franchisee">
              <span>🏢</span>
              Franchisee Portal
            </a>
          </Button>
          <Button asChild size="lg" className="bg-orange-600 hover:bg-orange-700">
            <a href="/tech/login">
              <span>🔧</span>
              Tech Login
            </a>
          </Button>
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
