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
    <div className="flex min-h-screen items-center justify-center bg-[#F7F5F0] px-4 py-12 font-sans select-none">
      <div className="w-full max-w-md rounded-xl border border-[#E2DDD5] bg-white p-10 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-3xl font-bold tracking-wider uppercase text-[#1A1817]">
            Sri Parshwa Cards
          </h1>
          <p className="mt-2 text-xs font-semibold uppercase tracking-widest text-[#8C857B]">
            Managing Craftsmanship • Admin Portal
          </p>
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

