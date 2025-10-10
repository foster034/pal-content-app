"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, XCircle } from "lucide-react";

export default function SyncUsersPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSync = async () => {
    try {
      setLoading(true);
      setResult(null);

      const response = await fetch("/api/sync-existing-users", {
        method: "POST",
      });

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "Failed to sync users",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Sync Existing Users
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Create profiles for all users in Supabase Auth that don't have a profile yet
        </p>
      </div>

      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">What this does:</h2>
          <ul className="list-disc list-inside space-y-1 text-gray-600 dark:text-gray-400">
            <li>Scans all users in Supabase Auth</li>
            <li>Creates profiles for users without them</li>
            <li>Assigns default role: <code className="px-2 py-1 bg-gray-100 dark:bg-neutral-800 rounded">tech</code></li>
            <li>You can change roles later in the profiles table</li>
          </ul>
        </div>

        <Button
          onClick={handleSync}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              Syncing Users...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-5 w-5" />
              Sync Existing Users
            </>
          )}
        </Button>
      </div>

      {result && (
        <div
          className={`rounded-lg p-6 ${
            result.success
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          }`}
        >
          <div className="flex items-start gap-3 mb-4">
            {result.success ? (
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                {result.success ? "Success!" : "Error"}
              </h3>
              <p className="text-sm mb-4">{result.message || result.error}</p>

              {result.success && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Total users in auth:
                    </span>
                    <span className="font-semibold">{result.totalUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Existing profiles:
                    </span>
                    <span className="font-semibold">
                      {result.existingProfiles}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Profiles created:
                    </span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {result.created}
                    </span>
                  </div>
                </div>
              )}

              {result.newProfiles && result.newProfiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">New profiles created:</h4>
                  <div className="bg-white dark:bg-neutral-800 rounded p-3 space-y-2">
                    {result.newProfiles.map((profile: any, idx: number) => (
                      <div
                        key={idx}
                        className="text-sm flex justify-between items-center"
                      >
                        <span className="text-gray-700 dark:text-gray-300">
                          {profile.email}
                        </span>
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                          {profile.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
