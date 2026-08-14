import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import EnquiryView from '../components/enquiry/EnquiryView';
import { useAuthContext } from '../context/AuthContext';
import { deleteEnquiry, getEnquiries, updateEnquiryStatus } from '../services/productApi';

function extractList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.enquiries)) return response.enquiries;
  if (Array.isArray(response?.enquiry)) return response.enquiry;
  return [];
}

function extractErrorMessage(err) {
  const responseErrors = err?.response?.data?.errors;
  const baseMessage = err?.response?.data?.message || err?.message || 'Something went wrong.';

  if (responseErrors && typeof responseErrors === 'object') {
    const details = Object.values(responseErrors).flat().join(' ');
    if (details) return details;
  }
  return baseMessage;
}

function EnquiryPage() {
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletedIds, setDeletedIds] = useState(new Set());

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getEnquiries();
      console.log('[EnquiryPage] GET /enquiry response:', res);
      const rawList = extractList(res);
      setItems(rawList.filter((item) => !deletedIds.has(item.id)));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleStatus = async (id, status) => {
    try {
      const res = await updateEnquiryStatus(id, status);
      toast.success(res?.message || `Enquiry status updated to ${status}.`);
      await fetchData();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      const res = await deleteEnquiry(id);
      toast.success(res?.message || 'Enquiry deleted successfully.');
      setDeletedIds((prev) => new Set(prev).add(id));
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  const handleProfile = () => navigate('/profile');
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <EnquiryView
      items={items}
      loading={loading}
      onToggleStatus={handleToggleStatus}
      onDelete={handleDelete}
      onLogout={handleLogout}
      onProfile={handleProfile}
    />
  );
}

export default EnquiryPage;
