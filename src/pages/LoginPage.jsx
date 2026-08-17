import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import LoginForm from '../components/auth/LoginForm';
import { loginUser } from '../services/api';
import { useAuthContext } from '../context/AuthContext';

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (formValues) => {
    setError('');
    setIsSubmitting(true);

    try {
      const response = await loginUser({
        username: formValues.username,
        password: formValues.password,
      });

      login(response);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4f0ea] px-4 py-12">
      <div className="w-full max-w-md rounded-3xl border border-stone-200 bg-white p-8 shadow-[0_20px_45px_rgba(0,0,0,0.08)]">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-stone-900">Sri Parshwa Cards</h1>
          <p className="mt-2 text-sm text-stone-600">Admin Portal</p>
        </div>

        <LoginForm
          onSubmit={handleLogin}
          isSubmitting={isSubmitting}
          submitError={error}
          onForgotPassword={handleForgotPassword}
        />
      </div>
    </div>
  );
}

export default LoginPage;
