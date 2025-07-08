'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingScreen } from '@/components/ui';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Редирект на сторінку "Мої матеріали"
    router.replace('/materials');
  }, [router]);

  return <LoadingScreen />;
}
