'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function LoginButton() {
  const router = useRouter();

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <Button
      onClick={handleLoginClick}
      className="w-full text-base bg-blue-500 hover:bg-blue-600"
    >
      Login
    </Button>
  );
}
