import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

import ProductView from '../components/product/ProductView';
import { useAuthContext } from '../context/AuthContext';
import { getActiveCardTypes, getCardTypes } from '../services/cardTypeApi';
import { getActiveCategories, getCategories } from '../services/categoryApi';
import { getActiveOccasions, getOccasions } from '../services/occasionApi';
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
  if (Array.isArray(response?.occasions)) return response.occasions;
  if (Array.isArray(response?.categories)) return response.categories;
  if (Array.isArray(response?.card_types)) return response.card_types;
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
  images: [],
  placements: [],
};

function ProductPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');
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

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async (page = 1, search = searchQuery) => {
    setLoading(true);
    try {
      const [prodRes, occRes, catRes, ctRes] = await Promise.all([
        getProducts(page, search),
        getOccasions().catch(() => getActiveOccasions().catch(() => [])),
        getCategories().catch(() => getActiveCategories().catch(() => [])),
        getCardTypes().catch(() => getActiveCardTypes().catch(() => [])),
      ]);

      console.log(`[ProductPage] GET /products?page=${page}&search=${search} response:`, prodRes);
      const rawList = extractList(prodRes);
      setItems(rawList.filter((item) => !deletedIds.has(item.id)));

      // Extract pagination metadata if present
      const lastPage = prodRes?.last_page || prodRes?.data?.last_page || prodRes?.meta?.last_page;
      const total = prodRes?.total || prodRes?.data?.total || prodRes?.meta?.total;

      if (lastPage) {
        setTotalPages(lastPage);
      } else {
        setTotalPages(Math.max(1, Math.ceil((total || rawList.length) / 10)));
      }

      if (total !== undefined && total !== null) {
        setTotalCount(total);
      } else {
        setTotalCount(rawList.length);
      }

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
      if (index >= updated.length) {
        updated[index] = { product_images: '', product_images_sort_order: String(index + 1) };
      }
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
      if (!form.product_name?.trim()) {
        throw new Error('Invitation Name is required.');
      }
      if (!form.product_made_of?.trim()) {
        throw new Error('Made of / Craftsmanship details are required.');
      }
      if (!form.occasions_ids || !form.occasions_ids.trim()) {
        throw new Error('Please select at least one Occasion.');
      }
      if (!form.categories_ids || !form.categories_ids.trim()) {
        throw new Error('Please select at least one Category.');
      }
      if (!form.card_types_ids || !form.card_types_ids.trim()) {
        throw new Error('Please select at least one Card Type.');
      }

      const validImages = (form.images || []).filter(
        (img) => (img.product_images && String(img.product_images).trim()) || img._file
      );
      if (validImages.length === 0) {
        throw new Error('At least one product image is required in Media Gallery.');
      }

      let response;
      if (editingItem) {
        response = await updateProduct(editingItem.id, form);
        toast.success(response?.message || 'Product updated successfully.');
      } else {
        const payload = { ...form, product_status: form.product_status || 'Active' };
        response = await createProduct(payload);
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

      let rawImages = item?.images || item?.product_images || item?.gallery || item?.image_url || [];
      if (!Array.isArray(rawImages)) {
        rawImages = (typeof rawImages === 'string' || (typeof rawImages === 'object' && rawImages !== null)) ? [rawImages] : [];
      }

      let mappedImages = [];
      if (rawImages.length > 0) {
        const validRawImages = rawImages.filter((img) => {
          if (!img) return false;
          if (typeof img === 'string') {
            return !img.toLowerCase().includes('no_image.jpg');
          }
          if (typeof img === 'object' && img !== null) {
            if (img.image_for === 'No Image') return false;
            const urlVal = String(img.image_url || img.product_images || img.url || img.path || '').toLowerCase();
            if (urlVal.includes('no_image.jpg')) return false;
          }
          return true;
        });

        mappedImages = validRawImages.map((img, idx) => {
          if (typeof img === 'string') {
            return {
              product_images: img,
              product_images_sort_order: String(idx + 1),
              product_images_status: 'Active',
            };
          }
          const pathVal =
            img?.product_images ||
            img?.image_url ||
            img?.image ||
            img?.image_path ||
            img?.file_path ||
            img?.url ||
            img?.path ||
            img?.file_name ||
            '';
          return {
            id: img?.id,
            product_images: pathVal,
            product_images_sort_order: String(img?.product_images_sort_order || img?.sort_order || idx + 1),
            product_images_status: img?.product_images_status || img?.status || 'Active',
          };
        });
      }

      setForm({
        product_name: item?.product_name || '',
        product_made_of: item?.product_made_of || '',
        occasions_ids: item?.occasions_ids || '',
        categories_ids: item?.categories_ids || '',
        card_types_ids: item?.card_types_ids || '',
        product_status: item?.product_status || 'Active',
        images: mappedImages,
        placements: Array.isArray(item?.placements) ? item.placements : [],
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
    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, product_status: nextStatus, status: nextStatus }
          : item
      )
    );
    try {
      const res = await updateProductStatus(id, nextStatus);
      toast.success(res?.message || `Status changed to ${nextStatus}.`);
    } catch (err) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, product_status: currentStatus, status: currentStatus }
            : item
        )
      );
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
      currentPage={currentPage}
      onPageChange={handlePageChange}
      totalPages={totalPages}
      totalCount={totalCount}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      statusFilter={statusFilter}
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
