'use client';

import LoginButton from '@/components/LoginButton';

//ssss
export default function LandingPage() {
  return (
    <div className="container mx-auto text-center py-8 max-w-4xl">
      <h1 className="text-3xl font-bold">Welcome to Our Platform</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        Start managing your orders and invoices with ease!
      </p>
      <div className="mt-6 max-w-xs mx-auto">
        <LoginButton />
      </div>
    </div>
  );
}
