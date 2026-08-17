import { useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import EnquiryReportView from '../components/reports/EnquiryReportView';
import { useAuthContext } from '../context/AuthContext';
import { getEnquiryReport } from '../services/productApi';

function extractList(response) {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.data?.data)) return response.data.data;
  if (Array.isArray(response?.enquiries)) return response.enquiries;
  if (Array.isArray(response?.enquiry)) return response.enquiry;
  if (Array.isArray(response?.reports)) return response.reports;
  if (Array.isArray(response?.report)) return response.report;
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

function getFirstDayOfCurrentMonth() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}-01`;
}

function getCurrentDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function EnquiryReportPage() {
  const navigate = useNavigate();
  const { logout } = useAuthContext();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Date input states (default to 1st of month & current date)
  const [fromDateInput, setFromDateInput] = useState(getFirstDayOfCurrentMonth());
  const [toDateInput, setToDateInput] = useState(getCurrentDate());
  const [statusInput, setStatusInput] = useState('ALL');

  // Applied filter states (initially empty until Submit is clicked)
  const [appliedFilters, setAppliedFilters] = useState({
    fromDate: '',
    toDate: '',
    statusFilter: 'ALL',
  });

  const fetchReportData = async (filters) => {
    setLoading(true);
    setHasSubmitted(true);
    try {
      const res = await getEnquiryReport({
        from_date: filters.fromDate,
        to_date: filters.toDate,
        enquiryStatus: filters.statusFilter,
      });
      console.log('[EnquiryReportPage] POST /getEnquiryReport response:', res);
      const rawList = extractList(res);
      setItems(rawList);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Handle Submit button click
  const handleSubmitFilter = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!fromDateInput || !toDateInput) {
      toast.error('Please choose both From Date and To Date.');
      return;
    }
    const newFilters = {
      fromDate: fromDateInput,
      toDate: toDateInput,
      statusFilter: statusInput,
    };
    setAppliedFilters(newFilters);
    fetchReportData(newFilters);
    toast.success('Report fetched according to chosen dates.');
  };

  const handleApplyPreset = (preset) => {
    const todayStr = getCurrentDate();

    let newFrom = '';
    let newTo = '';

    if (preset === 'today') {
      newFrom = todayStr;
      newTo = todayStr;
    } else if (preset === 'week') {
      const today = new Date();
      const firstDayOfWeek = new Date(today);
      const day = today.getDay() || 7;
      firstDayOfWeek.setDate(today.getDate() - day + 1);
      newFrom = firstDayOfWeek.toISOString().split('T')[0];
      newTo = todayStr;
    } else if (preset === 'month') {
      newFrom = getFirstDayOfCurrentMonth();
      newTo = todayStr;
    } else if (preset === 'all') {
      newFrom = '';
      newTo = '';
      setStatusInput('ALL');
    }

    setFromDateInput(newFrom);
    setToDateInput(newTo);

    const newFilters = {
      fromDate: newFrom,
      toDate: newTo,
      statusFilter: preset === 'all' ? 'ALL' : statusInput,
    };
    setAppliedFilters(newFilters);
    fetchReportData(newFilters);
  };

  const handleProfile = () => navigate('/profile');
  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <EnquiryReportView
      items={items}
      loading={loading}
      hasSubmitted={hasSubmitted}
      fromDateInput={fromDateInput}
      toDateInput={toDateInput}
      statusInput={statusInput}
      onFromDateChange={setFromDateInput}
      onToDateChange={setToDateInput}
      onStatusInputChange={setStatusInput}
      onSubmitFilter={handleSubmitFilter}
      appliedFilters={appliedFilters}
      onApplyPreset={handleApplyPreset}
      onProfile={handleProfile}
      onLogout={handleLogout}
    />
  );
}

export default EnquiryReportPage;
