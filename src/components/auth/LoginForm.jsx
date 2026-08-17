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
            className="absolute inset-y-0 right-3 flex items-center text-[10px] font-bold uppercase tracking-wider text-[#8C857B] hover:text-[#1A1817]"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'Hide' : 'Show'}
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
        className="w-full bg-[#1A1817] px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#38332E] disabled:cursor-not-allowed disabled:bg-[#8C857B] shadow-xs cursor-pointer"
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

