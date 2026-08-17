import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { sendPasswordResetEmail } from '../services/api';

function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);

    try {
      const response = await sendPasswordResetEmail(form);
      setMessage(response?.message || 'Password reset request sent successfully.');
    } catch (err) {
      setError(err.message || 'Unable to send password reset request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f0ea] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-[0_20px_45px_rgba(0,0,0,0.08)]">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Sri Parshwa Cards</h1>
          <p className="mt-2 text-sm text-stone-600">Forgot Password</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="username" className="mb-2 block text-sm font-medium text-stone-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={form.username}
              onChange={handleChange}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-800 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              placeholder="Enter username"
              required
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-stone-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-800 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
              placeholder="Enter email"
              required
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {message ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {isSubmitting ? 'Sending...' : 'Send Reset Link'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full text-sm font-medium text-stone-700 transition hover:text-stone-900"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;
