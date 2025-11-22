import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '../store/userSlice';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const onVerify = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Verification failed');

      if (data?.user) {
        dispatch(loginSuccess({ user: data.user }));
      }
      setMessage('Email verified successfully! Redirecting...');
      setTimeout(() => navigate('/profile', { replace: true }), 800);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const onResend = async () => {
    setIsLoading(true);
    setError(null);
    setMessage(null);
    try {
      const res = await fetch('http://localhost:5000/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not resend verification');
      setMessage('A new verification code has been sent to your email.');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-2">Verify your email</h1>
        <p className="text-gray-600 mb-6">Enter the email used during signup and the 6-digit code sent to you.</p>

        <form onSubmit={onVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-800 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Verification code</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="^[0-9]{6}$"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-yellow-800 focus:outline-none"
              placeholder="6-digit code"
              maxLength={6}
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</div>
          )}
          {message && (
            <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">{message}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full h-[44px] bg-[#635348] text-white rounded-lg font-medium hover:bg-[#52443a] transition disabled:opacity-60"
          >
            {isLoading ? 'Verifying…' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-600 flex items-center justify-between">
          <span>Didn't get a code?</span>
          <button onClick={onResend} disabled={isLoading || !email} className="text-yellow-800 hover:underline disabled:opacity-60">
            Resend code
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;


