import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import CategoryView from '../components/category/CategoryView';
import { useAuthContext } from '../context/AuthContext';
import {
  createCategory,
  deleteCategory,
  getActiveCategories,
  getCategories,
  getCategoryById,
  updateCategory,
  updateCategoryStatus,
} from '../services/categoryApi';

/** Safely extract array of items from response shape */
function extractList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.categories)) return response.categories;
  if (Array.isArray(response?.category)) return response.category;
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

function CategoryPage() {
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ categories: '', categories_status: 'Active' });
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
        getCategories(page, search),
        getActiveCategories().catch(() => []),
      ]);

      console.log(`[CategoryPage] GET /category?page=${page}&search=${search} response:`, listResponse);
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
      const name = form.categories?.trim();
      if (!name) throw new Error('Category name is required.');

      const payload = {
        categories: name,
        categories_status: form.categories_status || 'Active',
      };

      let response;
      if (editingItem) {
        response = await updateCategory(editingItem.id, payload);
        toast.success(response?.message || 'Category updated successfully.');
      } else {
        response = await createCategory(payload);
        toast.success(response?.message || 'Category created successfully.');
      }

      setForm({ categories: '', categories_status: 'Active' });
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
      const response = await getCategoryById(id);
      console.log('[CategoryPage] GET /category/:id response:', response);
      const item = response?.data || response?.category || response;

      setEditingItem(item);
      setForm({
        categories: item?.categories || item?.category_name || item?.name || '',
        categories_status: item?.categories_status || item?.status || 'Active',
      });
      setIsModalOpen(true);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

  /* ───────────── MODAL HANDLERS ───────────── */
  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setForm({ categories: '', categories_status: 'Active' });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setForm({ categories: '', categories_status: 'Active' });
  };

  /* ───────────── DELETE ───────────── */
  const handleDelete = async (id) => {
    setSubmitting(true);
    try {
      const response = await deleteCategory(id);
      toast.success(response?.message || 'Category deleted successfully.');
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
          ? { ...item, categories_status: nextStatus, status: nextStatus }
          : item
      )
    );
    try {
      const response = await updateCategoryStatus(id, nextStatus);
      toast.success(response?.message || `Status changed to ${nextStatus}.`);
    } catch (err) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, categories_status: currentStatus, status: currentStatus }
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
    <CategoryView
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

export default CategoryPage;
