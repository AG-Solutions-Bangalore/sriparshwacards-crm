import { useState } from 'react';

function LoginForm({ onSubmit, isSubmitting, submitError, onForgotPassword }) {
  const [form, setForm] = useState({ username: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(form);
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div>
        <label htmlFor="username" className="mb-2 block text-sm font-medium text-stone-700">
          Username
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={form.username}
          onChange={handleChange}
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-800 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          placeholder="Enter username"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-sm font-medium text-stone-700">
          Password
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 pr-12 text-stone-800 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            placeholder="Enter password"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute inset-y-0 right-3 flex items-center text-xs font-medium text-stone-600 hover:text-stone-900"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>

      {submitError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {submitError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-xl bg-stone-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400"
      >
        {isSubmitting ? 'Logging in...' : 'Login'}
      </button>

      <div className="flex items-center justify-between gap-3 pt-2 text-sm">
        <button
          type="button"
          onClick={onForgotPassword}
          className="font-medium text-stone-700 transition hover:text-stone-900"
        >
          Forgot Password
        </button>
        <button type="button" className="font-medium text-stone-700 transition hover:text-stone-900">
          Sign Up
        </button>
      </div>
    </form>
  );
}

export default LoginForm;
