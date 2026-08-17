import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useSearchParams } from 'react-router-dom';

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
  const [searchParams] = useSearchParams();
  const statusFilter = searchParams.get('status');
  const { logout } = useAuthContext();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletedIds, setDeletedIds] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async (page = 1, search = searchQuery) => {
    setLoading(true);
    try {
      const res = await getEnquiries(page, search);
      console.log(`[EnquiryPage] GET /enquiry?page=${page}&search=${search} response:`, res);
      const rawList = extractList(res);
      setItems(rawList.filter((item) => !deletedIds.has(item.id)));

      const lastPage = res?.last_page || res?.data?.last_page || res?.meta?.last_page;
      const total = res?.total || res?.data?.total || res?.meta?.total;

      if (lastPage) setTotalPages(lastPage);
      else setTotalPages(Math.max(1, Math.ceil((total || rawList.length) / 10)));

      if (total !== undefined && total !== null) setTotalCount(total);
      else setTotalCount(rawList.length);
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

  const handleToggleStatus = async (id, newStatus) => {
    const currentItem = items.find((item) => item.id === id);
    const prevStatus = currentItem?.enquiryStatus || currentItem?.enquiry_status || currentItem?.status || 'Pending';

    setItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, enquiryStatus: newStatus, enquiry_status: newStatus, status: newStatus }
          : item
      )
    );
    try {
      const res = await updateEnquiryStatus(id, newStatus);
      const msg = res?.message && !res.message.toLowerCase().includes('no enquiry') ? res.message : `Enquiry status updated to ${newStatus}.`;
      toast.success(msg);
    } catch (err) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, enquiryStatus: prevStatus, enquiry_status: prevStatus, status: prevStatus }
            : item
        )
      );
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
      currentPage={currentPage}
      onPageChange={handlePageChange}
      totalPages={totalPages}
      totalCount={totalCount}
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      statusFilter={statusFilter}
    />
  );
}

export default EnquiryPage;
