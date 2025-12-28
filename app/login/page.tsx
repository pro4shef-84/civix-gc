'use client';

import { signIn } from 'next-auth/react';
import { FormEvent, useState } from 'react';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('demo@gc.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const res = await signIn('credentials', { redirect: false, email, password });
    if (res?.error) {
      setError(res.error);
    } else {
      window.location.href = '/';
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow p-6 mt-10">
      <h1 className="text-2xl font-semibold mb-4">Login</h1>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" />
        </div>
        <div>
          <label className="block text-sm font-medium">Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" />
        </div>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button type="submit" className="w-full">Sign in</button>
      </form>
      <p className="text-sm mt-4 text-gray-600">Use demo credentials or create via API.</p>
      <Link className="text-blue-700 underline text-sm" href="/">Back</Link>
    </div>
  );
}
