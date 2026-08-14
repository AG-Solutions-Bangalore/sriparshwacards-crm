import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import ProductView from '../components/product/ProductView';
import { useAuthContext } from '../context/AuthContext';
import { getActiveCardTypes } from '../services/cardTypeApi';
import { getActiveCategories } from '../services/categoryApi';
import { getActiveOccasions } from '../services/occasionApi';
import {
  createProduct,
  deleteProduct,
  deleteProductImage,
  deleteProductPlacement,
  getProductById,
  getProducts,
  updateProduct,
  updateProductStatus,
} from '../services/productApi';

function extractList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.products)) return response.products;
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

const emptyForm = {
  product_name: '',
  product_made_of: '',
  occasions_ids: '',
  categories_ids: '',
  card_types_ids: '',
  product_status: 'Active',
  images: [{ product_images: '', product_images_sort_order: '1' }],
  placements: [{ placements_id: '1' }],
};

function ProductPage() {
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingItem, setEditingItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [occasionsList, setOccasionsList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [cardTypesList, setCardTypesList] = useState([]);

  const [deletedIds, setDeletedIds] = useState(new Set());

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, occRes, catRes, ctRes] = await Promise.all([
        getProducts(),
        getActiveOccasions().catch(() => []),
        getActiveCategories().catch(() => []),
        getActiveCardTypes().catch(() => []),
      ]);

      console.log('[ProductPage] GET /products response:', prodRes);
      const rawList = extractList(prodRes);
      setItems(rawList.filter((item) => !deletedIds.has(item.id)));
      setOccasionsList(extractList(occRes));
      setCategoriesList(extractList(catRes));
      setCardTypesList(extractList(ctRes));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* Image Row Handlers */
  const handleAddImageRow = () => {
    setForm((prev) => ({
      ...prev,
      images: [
        ...(prev.images || []),
        { product_images: '', product_images_sort_order: String((prev.images?.length || 0) + 1) },
      ],
    }));
  };

  const handleRemoveImageRow = async (index, imageId) => {
    if (imageId) {
      try {
        await deleteProductImage(imageId);
        toast.success('Image deleted from server.');
      } catch (err) {
        toast.error(extractErrorMessage(err));
        return;
      }
    }
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleImageChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...(prev.images || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, images: updated };
    });
  };

  /* Placement Row Handlers */
  const handleAddPlacementRow = () => {
    setForm((prev) => ({
      ...prev,
      placements: [...(prev.placements || []), { placements_id: '' }],
    }));
  };

  const handleRemovePlacementRow = async (index, placementId) => {
    if (placementId) {
      try {
        await deleteProductPlacement(placementId);
        toast.success('Placement deleted from server.');
      } catch (err) {
        toast.error(extractErrorMessage(err));
        return;
      }
    }
    setForm((prev) => ({
      ...prev,
      placements: prev.placements.filter((_, i) => i !== index),
    }));
  };

  const handlePlacementChange = (index, field, value) => {
    setForm((prev) => {
      const updated = [...(prev.placements || [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, placements: updated };
    });
  };

  /* Submit Form */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      if (!form.product_name?.trim()) throw new Error('Product name is required.');

      let response;
      if (editingItem) {
        response = await updateProduct(editingItem.id, form);
        toast.success(response?.message || 'Product updated successfully.');
      } else {
        response = await createProduct(form);
        toast.success(response?.message || 'Product created successfully.');
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

  /* Edit Product */
  const handleEdit = async (id) => {
    try {
      const response = await getProductById(id);
      const item = response?.data || response?.product || response;
      setEditingItem(item);

      setForm({
        product_name: item?.product_name || '',
        product_made_of: item?.product_made_of || '',
        occasions_ids: item?.occasions_ids || '',
        categories_ids: item?.categories_ids || '',
        card_types_ids: item?.card_types_ids || '',
        product_status: item?.product_status || 'Active',
        images: Array.isArray(item?.images) && item.images.length > 0 ? item.images : [{ product_images: '', product_images_sort_order: '1' }],
        placements: Array.isArray(item?.placements) && item.placements.length > 0 ? item.placements : [{ placements_id: '1' }],
      });

      setIsModalOpen(true);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    }
  };

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

  /* Delete Product */
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setSubmitting(true);
    try {
      const res = await deleteProduct(id);
      toast.success(res?.message || 'Product deleted successfully.');
      setDeletedIds((prev) => new Set(prev).add(id));
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  /* Toggle Status */
  const handleToggleStatus = async (id, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    try {
      const res = await updateProductStatus(id, nextStatus);
      toast.success(res?.message || `Status changed to ${nextStatus}.`);
      await fetchData();
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
    <ProductView
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
      onDelete={handleDelete}
      submitting={submitting}
      occasionsList={occasionsList}
      categoriesList={categoriesList}
      cardTypesList={cardTypesList}
      onAddImageRow={handleAddImageRow}
      onRemoveImageRow={handleRemoveImageRow}
      onImageChange={handleImageChange}
      onAddPlacementRow={handleAddPlacementRow}
      onRemovePlacementRow={handleRemovePlacementRow}
      onPlacementChange={handlePlacementChange}
    />
  );
}

export default ProductPage;
