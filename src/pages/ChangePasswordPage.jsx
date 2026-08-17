import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { changeUserPassword } from '../services/api';

function ChangePasswordPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', old_password: '', new_password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

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
      const response = await changeUserPassword(form);
      setMessage(response?.message || 'Password changed successfully.');
      setForm({ username: '', old_password: '', new_password: '' });
    } catch (err) {
      setError(err.message || 'Unable to change password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f0ea] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-[0_20px_45px_rgba(0,0,0,0.08)]">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Sri Parshwa Cards</h1>
          <p className="mt-2 text-sm text-stone-600">Change Password</p>
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
            <label htmlFor="old_password" className="mb-2 block text-sm font-medium text-stone-700">
              Old Password
            </label>
            <div className="relative">
              <input
                id="old_password"
                name="old_password"
                type={showOldPassword ? 'text' : 'password'}
                value={form.old_password}
                onChange={handleChange}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 pr-12 text-stone-800 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                placeholder="Enter old password"
                required
              />
              <button
                type="button"
                onClick={() => setShowOldPassword((current) => !current)}
                className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-stone-600 hover:text-stone-900"
              >
                {showOldPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="new_password" className="mb-2 block text-sm font-medium text-stone-700">
              New Password
            </label>
            <div className="relative">
              <input
                id="new_password"
                name="new_password"
                type={showNewPassword ? 'text' : 'password'}
                value={form.new_password}
                onChange={handleChange}
                className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 pr-12 text-stone-800 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                placeholder="Enter new password"
                required
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((current) => !current)}
                className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-stone-600 hover:text-stone-900"
              >
                {showNewPassword ? 'Hide' : 'Show'}
              </button>
            </div>
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
            {isSubmitting ? 'Updating...' : 'Change Password'}
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

export default ChangePasswordPage;
