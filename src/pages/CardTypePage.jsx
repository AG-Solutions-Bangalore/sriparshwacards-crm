import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import CardTypeView from '../components/cardType/CardTypeView';
import { useAuthContext } from '../context/AuthContext';
import {
  createCardType,
  deleteCardType,
  getActiveCardTypes,
  getActivePlacements,
  getCardTypeById,
  getCardTypes,
  updateCardType,
  updateCardTypeStatus,
} from '../services/cardTypeApi';

/** Safely extract array of items from response shape */
function extractList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;  
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.card_types)) return response.card_types;
  if (Array.isArray(response?.cardtype)) return response.cardtype;
  return [];
}

/** Extract human-readable error message */
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

function CardTypePage() {
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const emptyForm = { card_types: '', card_types_images: '' };
  const [form, setForm] = useState(emptyForm);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  /* ───────────── FETCH DATA ───────────── */
  const fetchData = async (page = 1, search = searchQuery) => {
    setLoading(true);
    try {
      const [listResponse] = await Promise.all([
        getCardTypes(page, search),
        getActiveCardTypes().catch(() => []),
        getActivePlacements().catch(() => []),
      ]);

      console.log(`[CardTypePage] GET /cardtype?page=${page}&search=${search} response:`, listResponse);
      const listData = extractList(listResponse);
      setItems(listData);

      const lastPage = listResponse?.last_page || listResponse?.data?.last_page || listResponse?.meta?.last_page;
      const total = listResponse?.total || listResponse?.data?.total || listResponse?.meta?.total;

      if (lastPage) setTotalPages(lastPage);
      else setTotalPages(Math.max(1, Math.ceil((total || listData.length) / 10)));

      if (total !== undefined && total !== null) setTotalCount(total);
      else setTotalCount(listData.length);
    } catch (err) {
      const msg = extractErrorMessage(err);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, searchQuery);
  }, [currentPage, searchQuery]);

  const handleSearchChange = (query) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  };

  /* ───────────── FORM HANDLERS ───────────── */
  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const name = form.card_types?.trim();
      if (!name) throw new Error('Card type name is required.');

      const payload = {
        card_types: name,
        card_types_images: form.card_types_images || '',
      };
      if (editingItem && form.card_types_status) {
        payload.card_types_status = form.card_types_status;
        payload.status = form.card_types_status;
      }

      let response;
      if (editingItem) {
        response = await updateCardType(editingItem.id, payload);
        toast.success(response?.message || 'Card type updated successfully.');
      } else {
        response = await createCardType(payload);
        toast.success(response?.message || 'Card type created successfully.');
      }

      setForm(emptyForm);
      setEditingItem(null);
      setIsModalOpen(false);
      await fetchData();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  /* ───────────── EDIT BY ID ───────────── */
  const handleEdit = async (id) => {
    try {
      const response = await getCardTypeById(id);
      console.log('[CardTypePage] GET /cardtype/:id response:', response);
      const item = response?.data || response?.card_type || response;

      setEditingItem(item);
      setForm({
        card_types: item?.card_types || item?.card_type_name || item?.name || '',
        card_types_images: item?.card_types_images || item?.image || item?.file_path || '',
        card_types_status: item?.card_types_status || item?.status || 'Active',
      });
      setIsModalOpen(true);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  /* ───────────── MODAL HANDLERS ───────────── */
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  };

  /* ───────────── DELETE ───────────── */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this card type?')) return;
    setSubmitting(true);
    try {
      const response = await deleteCardType(id);
      toast.success(response?.message || 'Card type deleted successfully.');
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
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, card_types_status: nextStatus, status: nextStatus }
          : item
      )
    );
    try {
      const response = await updateCardTypeStatus(id, nextStatus);
      toast.success(response?.message || `Status changed to ${nextStatus}.`);
    } catch (err) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, card_types_status: currentStatus, status: currentStatus }
            : item
        )
      );
      toast.error(extractErrorMessage(err));
    }
  };

  /* ───────────── NAVIGATION ───────────── */
  const handleProfile = () => navigate('/profile');
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <CardTypeView
      form={form}
      onChange={handleChange}
      onSubmit={handleSubmit}
      items={items}
      loading={loading}
      editingId={editingItem?.id || null}
      onEdit={handleEdit}
      onToggleStatus={handleToggleStatus}
      onLogout={handleLogout}
      onProfile={handleProfile}
      isModalOpen={isModalOpen}
      onOpenModal={handleOpenCreateModal}
      onCloseModal={handleCloseModal}
      submitting={submitting}
      currentPage={currentPage}
      onPageChange={handlePageChange}
      totalPages={totalPages}
      totalCount={totalCount}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
    />
  );
}

export default CardTypePage;
