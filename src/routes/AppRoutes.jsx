import { Navigate, Route, Routes } from 'react-router-dom';

import LoginPage from '../pages/LoginPage';
import DashboardPage from '../pages/DashboardPage';
import OccasionPage from '../pages/OccasionPage';
import CategoryPage from '../pages/CategoryPage';
import CardTypePage from '../pages/CardTypePage';
import ProductPage from '../pages/ProductPage';
import EnquiryPage from '../pages/EnquiryPage';
import ProfilePage from '../pages/ProfilePage';
import ForgotPasswordPage from '../pages/ForgotPasswordPage';
import ChangePasswordPage from '../pages/ChangePasswordPage';
import AuthRoute from './AuthRoute';
import ProtectedRoute from './ProtectedRoute';

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AuthRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/occasion" element={<OccasionPage />} />
        <Route path="/category" element={<CategoryPage />} />
        <Route path="/card-type" element={<CardTypePage />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/enquiry" element={<EnquiryPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRoutes;
