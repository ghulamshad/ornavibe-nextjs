'use client';

import DynamicLegalContent from '@/components/legal/DynamicLegalContent';

export default function SecurityPolicyPage() {
  return <DynamicLegalContent slug="security" fallbackTitle="Security Policy" />;
}
