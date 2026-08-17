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
        <label htmlFor="username" className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#8C857B]">
          USERNAME
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          value={form.username}
          onChange={handleChange}
          className="w-full rounded-md border border-[#E2DDD5] bg-[#FAF8F5] px-4 py-3 text-xs text-[#1A1817] outline-none placeholder:text-[#A39C93] focus:border-[#1A1817] focus:bg-white transition"
          placeholder="Enter username"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#8C857B]">
          PASSWORD
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={form.password}
            onChange={handleChange}
            className="w-full rounded-md border border-[#E2DDD5] bg-[#FAF8F5] px-4 py-3 pr-12 text-xs text-[#1A1817] outline-none placeholder:text-[#A39C93] focus:border-[#1A1817] focus:bg-white transition"
            placeholder="Enter password"
            required
          />

          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute inset-y-0 right-3 flex items-center text-[#8C857B] hover:text-[#1A1817] transition-colors focus:outline-none cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12c1.73-4.39 6.078-7.5 11.164-7.5 5.086 0 9.434 3.11 11.164 7.5-1.73 4.39-6.078 7.5-11.164 7.5-5.086 0-9.434-3.11-11.164-7.5z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {submitError ? (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          {submitError}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-[#1A1817] px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#38332E] disabled:cursor-not-allowed disabled:bg-[#8C857B] shadow-xs cursor-pointer"
      >
        {isSubmitting ? 'LOGGING IN...' : 'LOGIN'}
      </button>

      <div className="flex items-center justify-between gap-3 pt-2 text-xs">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-[#8C857B] transition hover:text-[#1A1817] underline"
        >
          Forgot Password?
        </button>
      </div>
    </form>
  );
}

export default LoginForm;

