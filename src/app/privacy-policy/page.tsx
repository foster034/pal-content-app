'use client';

import { useState, useEffect } from 'react';

interface PrivacyPolicyData {
  lastUpdated: string;
  version: string;
  content: {
    title: string;
    sections: Array<{
      title: string;
      content: string;
    }>;
  };
  consentTypes: {
    [key: string]: {
      title: string;
      description: string;
      required: boolean;
    };
  };
}

export default function PrivacyPolicyPage() {
  const [policyData, setPolicyData] = useState<PrivacyPolicyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrivacyPolicy = async () => {
      try {
        const response = await fetch('/api/privacy-policy');
        const data = await response.json();
        
        if (data.success) {
          setPolicyData(data.privacyPolicy);
        }
      } catch (error) {
        console.error('Error fetching privacy policy:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPrivacyPolicy();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Loading privacy policy...</p>
        </div>
      </div>
    );
  }

  if (!policyData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Error loading privacy policy</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            {policyData.content.title}
          </h1>
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span>Version {policyData.version}</span>
            <span>•</span>
            <span>Last updated: {new Date(policyData.lastUpdated).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Policy Content */}
        <div className="space-y-6">
          {policyData.content.sections.map((section, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {section.title}
              </h2>
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {section.content.split('\n').map((paragraph, pIndex) => {
                  if (paragraph.trim().startsWith('•')) {
                    return (
                      <li key={pIndex} className="ml-4 mb-1">
                        {paragraph.replace('•', '').trim()}
                      </li>
                    );
                  } else if (paragraph.trim()) {
                    return (
                      <p key={pIndex} className="mb-3">
                        {paragraph.trim()}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Consent Types Reference */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-md p-6 mt-6">
          <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-4">
            Types of Consent We Request
          </h2>
          <div className="space-y-4">
            {Object.entries(policyData.consentTypes).map(([key, consent]) => (
              <div key={key} className="border-l-4 border-blue-400 pl-4">
                <h3 className="font-medium text-blue-800 dark:text-blue-200">
                  {consent.title} {consent.required && <span className="text-red-600">*</span>}
                </h3>
                <p className="text-blue-700 dark:text-blue-300 text-sm mt-1">
                  {consent.description}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-4">
            * Required consents are necessary to provide our services
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Questions About This Policy?
          </h2>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            If you have questions about how we handle your personal information or want to exercise your privacy rights, please contact us:
          </p>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <p><strong>Email:</strong> privacy@popalock.com</p>
            <p><strong>Phone:</strong> 1-800-POP-LOCK</p>
            <p><strong>Mail:</strong> Pop-A-Lock Privacy Officer, [Company Address]</p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 py-4">
          <a 
            href="/"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 text-sm underline"
          >
            ← Return to Home
          </a>
        </div>
      </div>
    </div>
  );
}