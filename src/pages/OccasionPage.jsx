import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import OccasionView from '../components/occasion/OccasionView';
import { useAuthContext } from '../context/AuthContext';
import {
  createOccasion,
  deleteOccasion,
  getActiveOccasions,
  getOccasionById,
  getOccasions,
  updateOccasion,
  updateOccasionStatus,
} from '../services/occasionApi';

/** Safely extract the array of items from whatever shape the API returns */
function extractList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.occasions)) return response.occasions;
  return [];
}

/** Extract the human-readable message from an API error */
function extractErrorMessage(err) {
  const responseErrors = err?.response?.data?.errors;
  const baseMessage =
    err?.response?.data?.message ||
    err?.message ||
    'Something went wrong.';

  if (responseErrors && typeof responseErrors === 'object') {
    const details = Object.values(responseErrors).flat().join(' ');
    if (details) return details;
  }
  return baseMessage;
}

function OccasionPage() {
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ occasions: '', occasions_status: 'Active' });
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /* ───────────── FETCH ───────────── */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [listResponse] = await Promise.all([
        getOccasions(),
        getActiveOccasions().catch(() => []), // optional – don't block list
      ]);

      console.log('[OccasionPage] GET /occasion raw response:', listResponse);

      const listData = extractList(listResponse);
      setItems(listData);

      if (listData.length === 0) {
        // Help debug – show what the raw shape was
        console.warn('[OccasionPage] No items extracted. Full response:', JSON.stringify(listResponse));
      }
    } catch (err) {
      const msg = extractErrorMessage(err);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  /* ───────────── FORM CHANGE ───────────── */
  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ───────────── CREATE / UPDATE ───────────── */
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const itemName = form.occasions?.trim();
      if (!itemName) throw new Error('Occasion name is required.');

      const payload = {
        occasions: itemName,
        occasions_status: form.occasions_status || 'Active',
      };

      let response;
      if (editingItem) {
        response = await updateOccasion(editingItem.id, payload);
        const msg = response?.message || 'Occasion updated successfully.';
        toast.success(msg);
      } else {
        response = await createOccasion(payload);
        const msg = response?.message || 'Occasion created successfully.';
        toast.success(msg);
      }

      setForm({ occasions: '', occasions_status: 'Active' });
      setEditingItem(null);
      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      const msg = extractErrorMessage(err);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ───────────── EDIT (fetch by ID) ───────────── */
  const handleEdit = async (id) => {
    try {
      const response = await getOccasionById(id);
      console.log('[OccasionPage] GET /occasion/:id raw response:', response);
      const item = response?.data || response;

      setEditingItem(item);
      setForm({
        occasions: item?.occasions || item?.occasion_name || item?.name || '',
        occasions_status: item?.occasions_status || item?.status || 'Active',
      });
      setIsModalOpen(true);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  /* ───────────── MODAL HELPERS ───────────── */
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setForm({ occasions: '', occasions_status: 'Active' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setForm({ occasions: '', occasions_status: 'Active' });
  };

  /* ───────────── DELETE ───────────── */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this occasion?')) return;
    setSubmitting(true);
    try {
      const response = await deleteOccasion(id);
      toast.success(response?.message || 'Occasion deleted successfully.');
      setEditingItem(null);
      setForm({ occasions: '', occasions_status: 'Active' });
      setItems((prev) => prev.filter((item) => item.id !== id));
      await fetchData();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  /* ───────────── TOGGLE STATUS ───────────── */
  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const response = await updateOccasionStatus(id, nextStatus);
      toast.success(response?.message || `Status changed to ${nextStatus}.`);
      await fetchData();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  /* ───────────── NAVIGATION ───────────── */
  const handleHome = () => navigate('/');
  const handleProfile = () => navigate('/profile');
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <OccasionView
      form={form}
      onChange={handleChange}
      onSubmit={handleSubmit}
      items={items}
      loading={loading}
      editingId={editingItem?.id || null}
      onEdit={handleEdit}
      onToggleStatus={handleToggleStatus}
      onCancelEdit={handleCloseModal}
      onLogout={handleLogout}
      onProfile={handleProfile}
      onHome={handleHome}
      isModalOpen={isModalOpen}
      onOpenModal={handleOpenCreateModal}
      onCloseModal={handleCloseModal}
      submitting={submitting}
    />
  );
}

export default OccasionPage;
