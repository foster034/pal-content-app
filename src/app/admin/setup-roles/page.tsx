"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, CheckCircle, Shield } from "lucide-react";

export default function SetupRolesPage() {
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [roles, setRoles] = useState<any[]>([]);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    checkRoles();
  }, []);

  const checkRoles = async () => {
    try {
      setChecking(true);
      const response = await fetch("/api/populate-roles");
      const data = await response.json();
      setRoles(data.roles || []);
    } catch (error) {
      console.error("Error checking roles:", error);
    } finally {
      setChecking(false);
    }
  };

  const handlePopulateRoles = async () => {
    try {
      setLoading(true);
      setResult(null);

      const response = await fetch("/api/populate-roles", {
        method: "POST",
      });

      const data = await response.json();
      setResult(data);

      // Refresh the roles list
      if (data.success) {
        await checkRoles();
      }
    } catch (error: any) {
      setResult({
        success: false,
        error: error.message || "Failed to populate roles",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Setup Roles
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Populate the roles table with standard system roles
        </p>
      </div>

      {/* Current Roles */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Current Roles
        </h2>

        {checking ? (
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
          </div>
        ) : roles.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No roles found. Click the button below to populate.
          </div>
        ) : (
          <div className="space-y-2">
            {roles.map((role) => (
              <div
                key={role.id}
                className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-neutral-800 rounded"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-300 font-bold text-sm">
                    {role.id}
                  </div>
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {role.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {role.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Populate Button */}
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2">Populate Roles</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            This will create the following standard roles if they don't exist:
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-gray-600 dark:text-gray-400">
            <li><strong>super_admin</strong> - Full system access</li>
            <li><strong>admin</strong> - Manage franchisees and techs</li>
            <li><strong>franchisee</strong> - Manage their franchise</li>
            <li><strong>tech</strong> - Submit jobs and photos (default)</li>
          </ul>
        </div>

        <Button
          onClick={handlePopulateRoles}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              Populating Roles...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-5 w-5" />
              Populate Roles Table
            </>
          )}
        </Button>
      </div>

      {/* Result */}
      {result && (
        <div
          className={`rounded-lg p-6 ${
            result.success
              ? "bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800"
              : "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
          }`}
        >
          <div className="flex items-start gap-3">
            <CheckCircle
              className={`h-6 w-6 flex-shrink-0 mt-0.5 ${
                result.success ? "text-green-600" : "text-red-600"
              }`}
            />
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">
                {result.success ? "Success!" : "Error"}
              </h3>
              <p className="text-sm mb-4">{result.message || result.error}</p>

              {result.success && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Roles inserted:
                    </span>
                    <span className="font-semibold text-green-600">
                      {result.inserted}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Roles skipped (already exist):
                    </span>
                    <span className="font-semibold">{result.skipped}</span>
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
