'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BairrosRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/perfil');
  }, [router]);
  return null;
}
