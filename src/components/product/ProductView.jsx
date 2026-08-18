import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { api } from '../../services/api';
import Sidebar from '../dashboard/Sidebar';
import LogoutConfirmModal from '../common/LogoutConfirmModal';
import DeleteConfirmModal from '../common/DeleteConfirmModal';

/* Toggleable Columns */
const TOGGLEABLE_COLUMNS = [
  { key: 'slno', label: 'Sl.no' },
  { key: 'image', label: 'Image' },
  { key: 'name', label: 'Product Name' },
  { key: 'made_of', label: 'Made Of' },
  { key: 'occasions', label: 'Occasions' },
  { key: 'categories', label: 'Categories' },
  { key: 'card_types', label: 'Card Types' },
  { key: 'status', label: 'Status' },
];

/* Helper function to resolve IDs to array of names */
function getNameArrayFromIds(rawInput, list = [], primaryField = 'name') {
  if (rawInput === undefined || rawInput === null || rawInput === '') return [];

  const map = new Map();
  if (Array.isArray(list)) {
    list.forEach((item) => {
      if (item && item.id !== undefined && item.id !== null) {
        const name =
          item[primaryField] ||
          item.occasions ||
          item.categories ||
          item.card_types ||
          item.occasion_name ||
          item.category_name ||
          item.card_type_name ||
          item.name ||
          item.title;

        if (name) {
          map.set(String(item.id), name);
        }
      }
    });
  }

  let itemsToProcess = [];
  if (Array.isArray(rawInput)) {
    itemsToProcess = rawInput;
  } else if (typeof rawInput === 'string' || typeof rawInput === 'number') {
    itemsToProcess = String(rawInput)
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
  } else if (typeof rawInput === 'object') {
    itemsToProcess = [rawInput];
  }

  if (itemsToProcess.length === 0) return [];

  const names = itemsToProcess.map((el) => {
    if (typeof el === 'object' && el !== null) {
      const directName =
        el[primaryField] ||
        el.occasions ||
        el.categories ||
        el.card_types ||
        el.occasion_name ||
        el.category_name ||
        el.card_type_name ||
        el.name ||
        el.title;
      if (directName) return directName;
      if (el.id !== undefined) return map.get(String(el.id)) || `ID: ${el.id}`;
    }

    const key = String(el);
    return map.get(key) || `ID: ${key}`;
  });

  return names.filter(Boolean);
}

function toggleIdInString(currentIdsStr, id) {
  const str = currentIdsStr ? String(currentIdsStr) : '';
  const currentArray = str ? str.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const idStr = String(id);

  let newArray;
  if (currentArray.includes(idStr)) {
    newArray = currentArray.filter((item) => item !== idStr);
  } else {
    newArray = [...currentArray, idStr];
  }
  return newArray.join(',');
}

function renderChips(names, variant = 'stone') {
  if (!names || names.length === 0) {
    return <span className="text-[#A39C93] text-xs font-mono">N/A</span>;
  }

  const variantStyles = {
    amber: 'bg-[#FFF8EE] border border-[#F3E2C8] text-[#8A5A18]',
    stone: 'bg-[#F6F4EE] border border-[#E2DDD3] text-[#4A443D]',
    bronze: 'bg-[#FAF3F0] border border-[#EADAD5] text-[#7C4A3E]',
  };

  const style = variantStyles[variant] || variantStyles.stone;

  return (
    <div className="flex flex-wrap gap-1.5">
      {names.map((name, idx) => (
        <span
          key={idx}
          className={`inline-flex items-center rounded-md px-2.5 py-0.5 text-[11px] font-semibold tracking-wide shadow-2xs whitespace-nowrap ${style}`}
        >
          {name}
        </span>
      ))}
    </div>
  );
}

function getImageUrl(path) {
  if (!path) return 'https://sriparshwacards.in/crmapi/public/assets/images/no_image.jpg';
  if (typeof path !== 'string') return 'https://sriparshwacards.in/crmapi/public/assets/images/no_image.jpg';
  if (path.startsWith('data:') || path.startsWith('blob:')) {
    return path;
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  let cleanPath = path.trim().replace(/^\//, '');
  if (cleanPath.startsWith('public/')) {
    cleanPath = cleanPath.replace(/^public\//, '');
  }

  const baseImgUrl = 'https://sriparshwacards.in/crmapi/public/assets/images/product_images';
  const siteUrl = 'https://sriparshwacards.in/crmapi/public';

  if (cleanPath.startsWith('assets/images/product_images/')) {
    return `${siteUrl}/${cleanPath}`;
  }

  cleanPath = cleanPath.replace(/^(product_images|products)\//, '');
  return `${baseImgUrl}/${cleanPath}`;
}

function handleImageError(e, originalPath) {
  if (!originalPath || typeof originalPath !== 'string') {
    e.target.src = 'https://sriparshwacards.in/crmapi/public/assets/images/no_image.jpg';
    return;
  }
  if (originalPath.startsWith('data:') || originalPath.startsWith('blob:')) return;

  const siteUrl = 'https://sriparshwacards.in/crmapi/public';
  let clean = originalPath.trim().replace(/^\//, '').replace(/^public\//, '');
  clean = clean.replace(/^(assets\/images\/product_images|product_images|products)\//, '');

  const triedCount = parseInt(e.target.getAttribute('data-try-count') || '0', 10);
  const candidates = [
    `${siteUrl}/assets/images/product_images/${clean}`,
    `${siteUrl}/storage/products/${clean}`,
    `${siteUrl}/storage/${clean}`,
    `${siteUrl}/products/${clean}`,
    `${siteUrl}/uploads/products/${clean}`,
    `${siteUrl}/${clean}`,
    `https://sriparshwacards.in/crmapi/public/assets/images/no_image.jpg`,
  ];

  if (triedCount < candidates.length) {
    e.target.setAttribute('data-try-count', String(triedCount + 1));
    const nextUrl = candidates[triedCount];
    if (nextUrl && nextUrl !== e.target.src) {
      e.target.src = nextUrl;
    }
  } else {
    e.target.src = 'https://sriparshwacards.in/crmapi/public/assets/images/no_image.jpg';
  }
}



function MultiSelectDropdown({ label, itemsList = [], nameKey = 'name', selectedIdsStr = '', onChange, name }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedIds = String(selectedIdsStr || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const toggleSelect = (idStr) => {
    let nextIds;
    if (selectedIds.includes(idStr)) {
      nextIds = selectedIds.filter((id) => id !== idStr);
    } else {
      nextIds = [...selectedIds, idStr];
    }
    onChange({ target: { name, value: nextIds.join(',') } });
  };

  const removeId = (e, idStr) => {
    e.stopPropagation();
    const nextIds = selectedIds.filter((id) => id !== idStr);
    onChange({ target: { name, value: nextIds.join(',') } });
  };

  const getItemName = (item) => {
    return (
      item[nameKey] ||
      item.occasions ||
      item.categories ||
      item.card_types ||
      item.occasion_name ||
      item.category_name ||
      item.card_type_name ||
      item.name ||
      item.title ||
      `ID: ${item.id}`
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#8C857B]">
        {label}
      </label>

      <div
        onClick={() => setIsOpen((prev) => !prev)}
        className="min-h-[42px] w-full cursor-pointer rounded-md border border-[#E2DDD5] bg-[#FAF8F5] p-2 text-xs text-[#1A1817] transition hover:border-[#1A1817] flex flex-wrap items-center gap-1.5 focus:bg-white select-none"
      >
        {selectedIds.length > 0 ? (
          selectedIds.map((idStr) => {
            const foundItem = itemsList.find((it) => String(it.id) === idStr);
            const itemName = foundItem ? getItemName(foundItem) : `ID: ${idStr}`;
            return (
              <span
                key={idStr}
                className="inline-flex items-center gap-1 rounded bg-[#EFECE6] border border-[#D5CFC5] px-2 py-0.5 text-[11px] font-medium text-[#1A1817]"
              >
                {itemName}
                <button
                  type="button"
                  onClick={(e) => removeId(e, idStr)}
                  className="hover:text-red-600 font-bold ml-0.5 cursor-pointer"
                >
                  ×
                </button>
              </span>
            );
          })
        ) : (
          <span className="text-[#A39C93]">Select {label.toLowerCase()}...</span>
        )}

        <span className="ml-auto text-[#8C857B] pointer-events-none pl-1 text-[10px]">▼</span>
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-40 mt-1 max-h-48 overflow-y-auto rounded-md border border-[#E2DDD5] bg-white p-1.5 shadow-lg select-none">
          {itemsList.length > 0 ? (
            itemsList.map((item) => {
              const idStr = String(item.id);
              const isSelected = selectedIds.includes(idStr);
              const itemName = getItemName(item);

              return (
                <div
                  key={item.id}
                  onClick={() => toggleSelect(idStr)}
                  className={`flex cursor-pointer items-center justify-between rounded px-3 py-2 text-xs transition ${isSelected ? 'bg-[#FAF5EC] font-semibold text-[#8A5A18]' : 'text-[#1A1817] hover:bg-[#F7F5F0]'
                    }`}
                >
                  <span>{itemName}</span>
                  {isSelected && <span className="text-[#8A5A18] font-bold">✓</span>}
                </div>
              );
            })
          ) : (
            <div className="px-3 py-2 text-xs text-[#8C857B]">No options available</div>
          )}
        </div>
      )}
    </div>
  );
}

function ProductImageCarousel({ item, getImageUrl, handleImageError, openPreview }) {
  const [activeIdx, setActiveIdx] = useState(0);

  const rawImgs = item?.images || item?.product_images || item?.gallery || item?.image_url || [];
  const imgList = (Array.isArray(rawImgs) ? rawImgs : [rawImgs])
    .map((img) => {
      if (typeof img === 'string') return img;
      return (
        img?.product_images ||
        img?.image_url ||
        img?.image ||
        img?.url ||
        img?.file_path ||
        img?.path ||
        ''
      );
    })
    .filter((path) => {
      if (!path) return false;
      const str = String(path).toLowerCase();
      return !str.includes('no_image.jpg');
    });

  const displayList = imgList.length > 0 ? imgList : [item?.image || ''];

  useEffect(() => {
    if (displayList.length <= 1) return;

    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % displayList.length);
    }, 2500);

    return () => clearInterval(timer);
  }, [displayList.length]);

  return (
    <div className="relative h-12 w-12 rounded-lg border border-[#E2DDD5] bg-[#FAF8F5] overflow-hidden shadow-xs flex items-center justify-center">
      <div
        className="flex h-full w-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${activeIdx * 100}%)` }}
      >
        {displayList.map((path, idx) => {
          const fullUrl = getImageUrl(path);
          return (
            <div key={idx} className="h-full w-full shrink-0">
              <img
                src={fullUrl}
                alt={item.product_name || 'Product'}
                referrerPolicy="no-referrer"
                onError={(e) => handleImageError(e, path)}
                className="h-full w-full object-cover cursor-pointer"
                onClick={() => openPreview(displayList, idx)}
                title={`Click to preview full-size image (${idx + 1}/${displayList.length})`}
              />
            </div>
          );
        })}
      </div>

      {displayList.length > 1 && (
        <div className="absolute bottom-1 inset-x-0 flex justify-center gap-0.5 pointer-events-none z-10">
          {displayList.map((_, dotIdx) => (
            <span
              key={dotIdx}
              className={`h-1 rounded-full transition-all duration-300 ${
                dotIdx === activeIdx ? 'bg-white shadow-xs w-2.5' : 'bg-black/40 w-1'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductView({
  form,
  onChange,
  onSubmit,
  items,
  loading,
  editingId,
  onEdit,
  onToggleStatus,
  onLogout,
  onProfile,
  isModalOpen,
  onOpenModal,
  onCloseModal,
  onDelete,
  submitting,
  occasionsList = [],
  categoriesList = [],
  cardTypesList = [],
  placementsList = [],
  currentPage = 1,
  onPageChange,
  totalPages = 1,
  totalCount = 0,
  searchQuery = '',
  onSearchChange,
  statusFilter,
  onAddImageRow,
  onRemoveImageRow,
  onImageChange,
  onAddPlacementRow,
  onRemovePlacementRow,
  onPlacementChange,
}) {
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
  });

  const handleConfirmLogout = async () => {
    setLoggingOut(true);
    if (onLogout) await onLogout();
    setLoggingOut(false);
    setShowLogoutConfirm(false);
  };
  const [visibleCols, setVisibleCols] = useState({
    slno: true,
    image: true,
    name: true,
    made_of: true,
    occasions: true,
    categories: true,
    card_types: true,
    status: true,
  });
  const [selectedTiers, setSelectedTiers] = useState([]);
  const [selectedTraditions, setSelectedTraditions] = useState([]);
  const [selectedStyles, setSelectedStyles] = useState([]);
  const [previewModalData, setPreviewModalData] = useState(null);

  const openPreview = (urls, activeIndex = 0) => {
    let list = [];
    if (Array.isArray(urls)) {
      list = urls.map((u) => getImageUrl(u)).filter(Boolean);
    } else if (typeof urls === 'string' && urls) {
      list = [getImageUrl(urls)];
    }
    if (list.length === 0) return;
    setPreviewModalData({
      images: list,
      activeIndex: Math.min(activeIndex, list.length - 1),
    });
  };

  useEffect(() => {
    if (isModalOpen && !editingId) {
      setSelectedTiers([]);
      setSelectedTraditions([]);
      setSelectedStyles([]);
    }
  }, [isModalOpen, editingId]);

  const toggleSelection = (item, currentList, setList) => {
    if (currentList.includes(item)) {
      setList(currentList.filter((i) => i !== item));
    } else {
      setList([...currentList, item]);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.occasions_ids || !form.occasions_ids.trim()) {
      toast.error('Please select at least one Occasion.');
      return;
    }
    if (!form.categories_ids || !form.categories_ids.trim()) {
      toast.error('Please select at least one Category.');
      return;
    }
    if (!form.card_types_ids || !form.card_types_ids.trim()) {
      toast.error('Please select at least one Card Type.');
      return;
    }
    if (onSubmit) {
      onSubmit(e);
    }
  };

  const dropdownRef = useRef(null);

  const handleFileChange = async (e, targetIdx = null) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Check if any file is not WebP
    const nonWebpFiles = files.filter(
      (file) => !file.type.includes('webp') && !file.name.toLowerCase().endsWith('.webp')
    );
    if (nonWebpFiles.length > 0) {
      toast.error('Only WebP images (.webp) are allowed!');
      if (e.target) e.target.value = '';
      return;
    }

    // Read all selected files concurrently into Data URLs
    const readPromises = files.map((file) => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.readAsDataURL(file);
      });
    });

    const base64Urls = await Promise.all(readPromises);

    let currentImgs = [...(form.images || [])];

    // If initial array is just one empty object [{ product_images: '' }]
    if (currentImgs.length === 1 && !currentImgs[0].product_images) {
      currentImgs = [];
    }

    if (targetIdx !== null && targetIdx !== undefined) {
      // Replacing targetIdx with first image, and appending remaining picked files
      base64Urls.forEach((url, i) => {
        const idxToUpdate = targetIdx + i;
        const rawFile = files[i];
        if (idxToUpdate < currentImgs.length) {
          currentImgs[idxToUpdate] = {
            ...currentImgs[idxToUpdate],
            product_images: url,
            _file: rawFile,
          };
        } else {
          currentImgs.push({
            product_images: url,
            _file: rawFile,
            product_images_sort_order: String(currentImgs.length + 1),
          });
        }
      });
    } else {
      // Append all new multi-selected images
      base64Urls.forEach((url, i) => {
        const rawFile = files[i];
        currentImgs.push({
          product_images: url,
          _file: rawFile,
          product_images_sort_order: String(currentImgs.length + 1),
        });
      });
    }

    onChange({
      target: {
        name: 'images',
        value: currentImgs,
      },
    });

    if (e.target) e.target.value = '';
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setColumnsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const itemsPerPage = 10;

  const toggleCol = (key) => {
    setVisibleCols((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredItems = items.filter((item) => {
    const itemStatus = item.product_status || item.status || 'Active';
    if (statusFilter && String(itemStatus).toLowerCase() !== String(statusFilter).toLowerCase()) {
      return false;
    }

    const name = item.product_name || item.name || '';
    const madeOf = item.product_made_of || '';
    const occNames = getNameArrayFromIds(item.occasions_ids || item.occasions, occasionsList, 'occasions').join(' ');
    const catNames = getNameArrayFromIds(item.categories_ids || item.categories, categoriesList, 'categories').join(' ');
    const ctNames = getNameArrayFromIds(item.card_types_ids || item.card_types, cardTypesList, 'card_types').join(' ');

    const q = searchQuery.toLowerCase();
    return (
      name.toLowerCase().includes(q) ||
      madeOf.toLowerCase().includes(q) ||
      occNames.toLowerCase().includes(q) ||
      catNames.toLowerCase().includes(q) ||
      ctNames.toLowerCase().includes(q)
    );
  });

  // If server pagination is handled via onPageChange, use items directly (which are 10 items for current page)
  const isServerPaginated = typeof onPageChange === 'function';
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedItems = isServerPaginated ? filteredItems : filteredItems.slice(startIndex, startIndex + itemsPerPage);
  const calculatedTotalPages = isServerPaginated ? totalPages : Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const displayTotal = isServerPaginated ? (totalCount || items.length) : filteredItems.length;
  const startNum = startIndex + 1;
  const endNum = isServerPaginated ? Math.min(currentPage * itemsPerPage, displayTotal) : Math.min(startIndex + itemsPerPage, filteredItems.length);

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F5F0] text-[#1A1817] font-sans">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* ── PAGE HEADER ── */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight text-[#1A1817]">
              Product Overview
            </h1>
            <p className="mt-1 text-xs text-[#8C857B]">Manage luxury invitation suites & craftsmanship listings</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onProfile}
              className="flex items-center gap-2.5 rounded-full bg-white px-3.5 py-1.5 shadow-xs border border-[#E5E0D8] hover:border-[#C99C4B] transition cursor-pointer text-left"
              title="View Profile"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EFECE6] text-[11px] font-serif font-bold text-[#1A1817] border border-[#D5CFC5]">
                A
              </div>
              <div className="pr-1">
                <p className="text-xs font-bold text-[#1A1817] leading-tight">Admin</p>
                <p className="text-[10px] text-[#8C857B] leading-tight">Manager</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-2.5 rounded-full bg-white px-3.5 py-1.5 shadow-xs border border-[#E5E0D8] hover:border-red-500 hover:bg-red-50/40 transition cursor-pointer text-left"
              title="Log out"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-50 text-red-600 border border-red-200">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div className="pr-1">
                <p className="text-xs font-bold text-red-600 leading-tight">Logout</p>
                <p className="text-[10px] text-red-500/80 leading-tight">Exit</p>
              </div>
            </button>
          </div>
        </div>

        {/* ── MAIN CARD / TABLE CONTAINER ── */}
        <div className="rounded-xl border border-[#E8E3DA] bg-white shadow-xs">
          <div className="border-b border-[#F0ECE1] px-6 py-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-normal text-[#1A1817]">Product List</h2>
          </div>

          {/* Search + Action bar */}
          <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#F0ECE1] bg-[#FAF8F5]">
            <div className="relative w-full sm:w-80">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8C857B]">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Search products by name, made of..."
                value={searchQuery}
                onChange={(e) => onSearchChange ? onSearchChange(e.target.value) : null}
                className="w-full rounded-md border border-[#E2DDD5] bg-white py-2 pl-10 pr-4 text-xs text-[#1A1817] outline-none placeholder:text-[#A39C93] focus:border-[#1A1817] transition"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Columns Toggle Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setColumnsOpen((o) => !o)}
                  className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 font-serif text-xs font-normal tracking-wide transition shadow-xs cursor-pointer ${columnsOpen
                      ? 'border-[#1A1817] bg-[#F5CE93] text-[#1A1817]'
                      : 'border-[#E2DDD5] bg-white text-[#1A1817] hover:bg-[#F7F5F0]'
                    }`}
                >
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="7" height="18" rx="1" />
                    <rect x="14" y="3" width="7" height="18" rx="1" />
                  </svg>
                  Columns
                </button>

                {columnsOpen && (
                  <div className="absolute right-0 top-full z-30 mt-2 w-56 rounded-lg border border-[#E2DDD5] bg-white shadow-lg">
                    <p className="border-b border-[#F0ECE1] px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-[#8C857B]">
                      Toggle Columns
                    </p>
                    <ul className="p-2 space-y-1">
                      {TOGGLEABLE_COLUMNS.map((col) => (
                        <li key={col.key}>
                          <label className="flex cursor-pointer items-center gap-3 rounded-md px-3 py-1.5 text-xs text-[#1A1817] hover:bg-[#F7F5F0] select-none">
                            <input
                              type="checkbox"
                              checked={visibleCols[col.key]}
                              onChange={() => toggleCol(col.key)}
                              className="h-3.5 w-3.5 rounded border-[#C5C0B6] accent-[#1A1817]"
                            />
                            {col.label}
                          </label>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Add Product Button */}
              <button
                type="button"
                onClick={onOpenModal}
                className="flex items-center gap-1.5 rounded-full bg-[#1A1817] hover:bg-[#38332E] px-4 py-1.5 font-serif text-xs font-normal tracking-wide text-white transition shadow-xs cursor-pointer"
              >
                <span className="font-serif text-xs leading-none">+</span>
                Add New Product
              </button>
            </div>
          </div>

          {/* ── TABLE ── */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-[#E2DDD5] bg-[#EFECE6]">
                <tr className="text-[10px] font-semibold uppercase tracking-wider text-[#59534C]">
                  {visibleCols.slno && <th className="w-16 px-6 py-2.5">Sl.no</th>}
                  {visibleCols.image && <th className="w-20 px-6 py-2.5">Image</th>}
                  {visibleCols.name && <th className="px-6 py-2.5">Product Name</th>}
                  {visibleCols.made_of && <th className="px-6 py-2.5">Made Of</th>}
                  {visibleCols.occasions && <th className="px-6 py-2.5">Occasion</th>}
                  {visibleCols.categories && <th className="px-6 py-2.5">Category</th>}
                  {visibleCols.card_types && <th className="px-6 py-2.5">Card Type</th>}
                  {visibleCols.status && <th className="w-32 px-6 py-3.5">Status</th>}
                  <th className="w-28 px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#F7F5F0] bg-white">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-[#8C857B]">
                      Loading products...
                    </td>
                  </tr>
                ) : paginatedItems.length > 0 ? (
                  paginatedItems.map((item, index) => {
                    const status = item.product_status || item.status || 'Active';
                    const rawImgs = item.images || item.product_images || item.gallery || [];
                    const firstImgObj = Array.isArray(rawImgs) && rawImgs.length > 0 ? rawImgs[0] : null;
                    const imgPath = typeof firstImgObj === 'string'
                      ? firstImgObj
                      : firstImgObj?.product_images || firstImgObj?.image || firstImgObj?.url || firstImgObj?.file_path || item.image || '';
                    const fullUrl = getImageUrl(imgPath);

                    return (
                      <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                        {visibleCols.slno && <td className="px-6 py-4 font-mono text-[#8C857B]">{startIndex + index + 1}</td>}
                        {visibleCols.image && (
                          <td className="px-6 py-3">
                            <ProductImageCarousel
                              item={item}
                              getImageUrl={getImageUrl}
                              handleImageError={handleImageError}
                              openPreview={openPreview}
                            />
                          </td>
                        )}
                        {visibleCols.name && (
                          <td className="px-6 py-4 font-bold text-[#1A1817]">
                            {item.product_name}
                          </td>
                        )}
                        {visibleCols.made_of && <td className="px-6 py-4 text-[#59534C]">{item.product_made_of || 'N/A'}</td>}
                        {visibleCols.occasions && (
                          <td className="px-6 py-4">
                            {renderChips(getNameArrayFromIds(item.occasions_ids || item.occasions, occasionsList, 'occasions'), 'amber')}
                          </td>
                        )}
                        {visibleCols.categories && (
                          <td className="px-6 py-4">
                            {renderChips(getNameArrayFromIds(item.categories_ids || item.categories, categoriesList, 'categories'), 'stone')}
                          </td>
                        )}
                        {visibleCols.card_types && (
                          <td className="px-6 py-4">
                            {renderChips(getNameArrayFromIds(item.card_types_ids || item.card_types, cardTypesList, 'card_types'), 'bronze')}
                          </td>
                        )}
                        {visibleCols.status && (
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => onToggleStatus && onToggleStatus(item.id, status)}
                              className={`inline-block border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md cursor-pointer transition ${
                                status === 'Active'
                                  ? 'border-emerald-500 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                                  : 'border-rose-400 text-rose-700 bg-rose-50 hover:bg-rose-100'
                              }`}
                            >
                              {status}
                            </button>
                          </td>
                        )}
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => onEdit(item.id)}
                              className="p-1.5 text-[#59534C] hover:text-[#1A1817] transition cursor-pointer"
                              title="Edit Product"
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center text-[#8C857B]">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* ── PAGINATION BAR ── */}
          <div className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between border-t border-[#F0ECE1] bg-[#FAF8F5]">
            <p className="text-xs text-[#8C857B]">
              Showing <span className="font-semibold text-[#1A1817]">{displayTotal > 0 ? startNum : 0}</span> to{' '}
              <span className="font-semibold text-[#1A1817]">{endNum}</span> of{' '}
              <span className="font-semibold text-[#1A1817]">{displayTotal}</span> products
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onPageChange && onPageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="inline-flex items-center gap-1 rounded-full border border-[#E2DDD5] bg-white px-3 py-1 text-[10px] font-semibold text-[#1A1817] shadow-xs hover:bg-[#EFECE6] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <div className="flex items-center gap-1 px-3 text-[10px] font-semibold text-[#59534C]">
                <span>Page</span>
                <span className="text-[#1A1817] font-bold">{currentPage}</span>
                <span>of</span>
                <span className="text-[#1A1817] font-bold">{calculatedTotalPages}</span>
              </div>

              <button
                type="button"
                onClick={() => onPageChange && onPageChange(currentPage + 1)}
                disabled={currentPage >= calculatedTotalPages}
                className="inline-flex items-center gap-1 rounded-full border border-[#E2DDD5] bg-white px-3 py-1 text-[10px] font-semibold text-[#1A1817] shadow-xs hover:bg-[#EFECE6] disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
              >
                Next
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ─────────── LUXURY REDESIGNED MODAL (Image 2 Parity) ─────────── */}
      {isModalOpen && (
        <div
          onClick={onCloseModal}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative my-6 w-full max-w-5xl rounded-xl bg-[#F7F5F0] p-8 shadow-2xl border border-[#E2DDD5] max-h-[92vh] overflow-y-auto cursor-default"
          >
            {/* Top Modal Header Bar (Image 2 style) */}
            <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E2DDD5] pb-6">
              <div>
                <h2 className="font-serif text-3xl font-normal text-[#1A1817]">
                  {editingId ? 'Edit Product' : 'Add New Invitation'}
                </h2>
                <p className="mt-1 text-xs text-[#8C857B]">
                  Create a new product listing in the catalog.
                </p>
              </div>

              {/* Action Buttons top right */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onCloseModal}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E2DDD5] bg-white text-[#59534C] hover:bg-[#EFECE6] hover:text-[#1A1817] transition cursor-pointer"
                  title="Close modal"
                  aria-label="Close modal"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              {/* ── LEFT COLUMN (2 Cols): Product Details & Media Gallery ── */}
              <div className="lg:col-span-2 space-y-6">
                {/* 1. Product Details Card */}
                <div className="rounded-xl border border-[#E8E3DA] bg-white p-6 shadow-xs">
                  <h3 className="font-serif text-2xl font-normal text-[#1A1817] mb-6">
                    Product Details
                  </h3>

                  {/* Invitation Name */}
                  <div className="mb-6">
                    <label htmlFor="product_name" className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#8C857B]">
                      INVITATION NAME <span className="text-red-600 font-bold">*</span>
                    </label>
                    <input
                      id="product_name"
                      name="product_name"
                      type="text"
                      autoFocus
                      value={form.product_name || ''}
                      onChange={onChange}
                      placeholder="e.g. The Royal Crest Suite"
                      required
                      className="w-full rounded-md border border-[#E2DDD5] bg-[#FAF8F5] px-4 py-3 text-sm text-[#1A1817] outline-none placeholder:text-[#A39C93] focus:border-[#1A1817] focus:bg-white transition"
                    />
                  </div>

                  {/* Made Of */}
                  <div className="mb-6">
                    <label htmlFor="product_made_of" className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#8C857B]">
                      MADE OF / CRAFTSMANSHIP DETAILS <span className="text-red-600 font-bold">*</span>
                    </label>
                    <input
                      id="product_made_of"
                      name="product_made_of"
                      type="text"
                      value={form.product_made_of || ''}
                      onChange={onChange}
                      placeholder="e.g. Handmade Paper & Gold Foil Stamp"
                      className="w-full rounded-md border border-[#E2DDD5] bg-[#FAF8F5] px-4 py-3 text-sm text-[#1A1817] outline-none placeholder:text-[#A39C93] focus:border-[#1A1817] focus:bg-white transition"
                    />
                  </div>
                </div>

                {/* 2. Media Gallery Card */}
                <div className="rounded-xl border border-[#E8E3DA] bg-white p-6 shadow-xs">
                  <div className="mb-6 flex items-baseline justify-between">
                    <h3 className="font-serif text-2xl font-normal text-[#1A1817]">Media Gallery</h3>
                    <span className="text-xs text-[#8C857B]">Upload high-res images (WebP format)</span>
                  </div>

                  {/* Primary Image dropzone + Guidelines Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Primary Image Preview or Dropzone */}
                    {form.images?.[0]?.product_images ? (
                      <div className="md:col-span-2 relative h-48 w-full rounded-lg overflow-hidden border border-[#E2DDD5] bg-black/5 group">
                        <img
                          src={getImageUrl(form.images[0].product_images)}
                          alt="Primary Product"
                          referrerPolicy="no-referrer"
                          onClick={() => {
                            const galleryUrls = (form.images || []).map((i) => i.product_images).filter(Boolean);
                            openPreview(galleryUrls, 0);
                          }}
                          onError={(e) => handleImageError(e, form.images[0].product_images)}
                          className="h-full w-full object-cover cursor-pointer hover:opacity-90 transition"
                          title="Click to preview full-size image"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setConfirmDeleteModal({
                              isOpen: true,
                              title: 'Delete Primary Image',
                              message: 'Do you really want to delete this primary product image?',
                              onConfirm: async () => {
                                await onRemoveImageRow(0, form.images[0]?.id);
                                setConfirmDeleteModal({ isOpen: false });
                              },
                            });
                          }}
                          className="absolute top-2 right-2 rounded-full bg-red-600/90 text-white p-1.5 hover:bg-red-700 transition cursor-pointer shadow-md opacity-90 group-hover:opacity-100"
                          title="Remove primary image"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="md:col-span-2 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#E2DDD5] bg-[#FAF8F5] p-8 text-center cursor-pointer hover:border-[#1A1817] transition select-none">
                        <input
                          type="file"
                          accept=".webp,image/webp"
                          multiple
                          className="hidden"
                          onChange={(e) => handleFileChange(e, 0)}
                        />
                        <div className="mb-3 text-[#A39C93]">
                          <svg className="mx-auto h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                          </svg>
                        </div>
                        <p className="text-xs font-semibold text-[#1A1817]">Drag & drop or click to upload primary WebP image</p>
                        <span className="mt-1 text-[10px] text-[#8C857B]">Only .webp images allowed</span>
                        <span className="mt-3 inline-block border border-[#2D2926] bg-white px-5 py-1.5 text-xs font-semibold text-[#1A1817] hover:bg-[#EFECE6] transition rounded-lg">
                          Browse WebP
                        </span>
                      </label>
                    )}

                    {/* Guidelines Box */}
                    <div className="rounded-lg bg-[#F7F5F0] p-4 text-xs text-[#59534C] space-y-3">
                      <p className="font-bold text-[#1A1817]">Image Guidelines</p>
                      <div className="flex items-start gap-2 text-[11px]">
                        <span className="text-[#1A1817] font-bold">✓</span>
                        <p>Only WebP images (.webp) are allowed.</p>
                      </div>
                      <div className="flex items-start gap-2 text-[11px]">
                        <span className="text-[#1A1817] font-bold">✓</span>
                        <p>Recommended size: 1200x1600px.</p>
                      </div>
                      <div className="flex items-start gap-2 text-[11px]">
                        <span className="text-[#1A1817] font-bold">✓</span>
                        <p>Max file size: 5MB per image.</p>
                      </div>
                    </div>
                  </div>

                  {/* Supporting Images */}
                  <div>
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8C857B]">
                        SUPPORTING IMAGES
                      </p>
                      <label className="inline-flex items-center gap-1.5 rounded-lg border border-[#2D2926] bg-white px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1A1817] hover:bg-[#EFECE6] transition shadow-xs cursor-pointer select-none">
                        <span className="text-xs leading-none">+</span>
                        ADD WEBP IMAGE
                        <input
                          type="file"
                          accept=".webp,image/webp"
                          multiple
                          className="hidden"
                          onChange={(e) => handleFileChange(e)}
                        />
                      </label>
                    </div>

                    {(form.images || []).slice(1).length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {form.images.slice(1).map((img, idx) => {
                          const realIdx = idx + 1;
                          return (
                            <div key={realIdx} className="rounded-lg border border-[#E2DDD5] bg-[#FAF8F5] p-3 flex flex-col justify-between">
                              {img.product_images ? (
                                <div className="relative h-32 w-full rounded-md overflow-hidden border border-[#E2DDD5] bg-black/5">
                                  <img
                                    src={getImageUrl(img.product_images)}
                                    alt={`Product image ${realIdx + 1}`}
                                    referrerPolicy="no-referrer"
                                    onClick={() => {
                                      const galleryUrls = (form.images || []).map((i) => i.product_images).filter(Boolean);
                                      openPreview(galleryUrls, realIdx);
                                    }}
                                    onError={(e) => handleImageError(e, img.product_images)}
                                    className="h-full w-full object-cover cursor-pointer hover:opacity-90 transition"
                                    title="Click to preview full-size image"
                                  />
                                </div>
                              ) : (
                                <label className="h-32 w-full rounded-md border-2 border-dashed border-[#E2DDD5] bg-white flex flex-col items-center justify-center text-xs text-[#8C857B] cursor-pointer hover:border-[#1A1817] transition select-none">
                                  <span className="text-[#1A1817] font-semibold text-xs">+ Upload WebP</span>
                                  <span className="text-[10px] text-[#8C857B] mt-0.5">Only .webp format</span>
                                  <input
                                    type="file"
                                    accept=".webp,image/webp"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e, realIdx)}
                                  />
                                </label>
                              )}

                              <div className="flex items-center justify-between text-[11px] pt-2 gap-1">
                                <span className="text-[#8C857B] text-[10px]">Sort: {img.product_images_sort_order || realIdx + 1}</span>
                                <select
                                  value={img.product_images_status || 'Active'}
                                  onChange={(e) => {
                                    const newImgs = [...(form.images || [])];
                                    newImgs[realIdx] = { ...newImgs[realIdx], product_images_status: e.target.value };
                                    onChange({ target: { name: 'images', value: newImgs } });
                                  }}
                                  className={`rounded border px-1.5 py-0.5 text-[10px] font-bold outline-none cursor-pointer ${
                                    (img.product_images_status || 'Active') === 'Active'
                                      ? 'border-emerald-500 text-emerald-700 bg-emerald-50'
                                      : 'border-rose-400 text-rose-700 bg-rose-50'
                                  }`}
                                >
                                  <option value="Active" className="text-emerald-700 bg-white font-bold">Active</option>
                                  <option value="Inactive" className="text-rose-700 bg-white font-bold">Inactive</option>
                                </select>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setConfirmDeleteModal({
                                      isOpen: true,
                                      title: 'Delete Image',
                                      message: 'Do you really want to delete this supporting image?',
                                      onConfirm: async () => {
                                        await onRemoveImageRow(realIdx, img.id);
                                        setConfirmDeleteModal({ isOpen: false });
                                      },
                                    });
                                  }}
                                  className="p-1 text-[#8C857B] hover:text-red-600 transition cursor-pointer"
                                  title="Delete Image"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-xs text-[#8C857B] italic py-2">No supporting images added yet. Click "+ ADD WEBP IMAGE" to add extra views.</p>
                    )}
                  </div>
                </div>
              </div>

              {/* ── RIGHT COLUMN (1 Col): Placement & Categorization ── */}
              <div className="space-y-6">
                {/* 1. Placement Card */}
                <div className="rounded-xl border border-[#E8E3DA] bg-white p-6 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-serif text-2xl font-normal text-[#1A1817]">Placement</h3>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8C857B] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#E2DDD5]">Optional</span>
                  </div>
                  <p className="text-xs text-[#8C857B] mb-6">Select optional promotional placements for this product</p>
                  <div className="space-y-3.5 text-xs text-[#1A1817]">
                    {[
                      { id: '1', label: 'Show on Homepage' },
                      { id: '2', label: 'Mark as Bestseller' },
                      { id: '3', label: 'Mark as New Arrival' },
                      { id: '4', label: 'Featured Product' },
                    ].map((item) => {
                      const isChecked = (form.placements || []).some(
                        (p) => String(p.placements_id || p.id || p) === item.id
                      );
                      return (
                        <label key={item.id} className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              const current = form.placements || [];
                              const exists = current.some(
                                (p) => String(p.placements_id || p.id || p) === item.id
                              );
                              let updated;
                              if (exists) {
                                updated = current.filter(
                                  (p) => String(p.placements_id || p.id || p) !== item.id
                                );
                              } else {
                                updated = [...current, { placements_id: item.id }];
                              }
                              onChange({ target: { name: 'placements', value: updated } });
                            }}
                            className="h-4 w-4 rounded border-[#C5C0B6] accent-[#1A1817]"
                          />
                          <span>{item.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Categorization Card */}
                <div className="rounded-xl border border-[#E8E3DA] bg-white p-6 shadow-xs space-y-6">
                  <h3 className="font-serif text-2xl font-normal text-[#1A1817]">Categorization</h3>

                  {/* OCCASIONS */}
                  <div className="border-t border-[#F0ECE1] pt-5">
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#8C857B]">
                      OCCASIONS <span className="text-red-600 font-bold">*</span>
                    </label>
                    {(() => {
                      const activeOccs = (occasionsList || []).filter((occ) => {
                        const status = occ.occasions_status || occ.status || 'Active';
                        const occIdStr = String(occ.id);
                        const isSelected = (form.occasions_ids || '').split(',').map(s => s.trim()).includes(occIdStr);
                        return String(status).toLowerCase() === 'active' || isSelected;
                      });
                      return activeOccs.length > 0 ? (
                        <div className="flex flex-wrap gap-2 text-xs">
                          {activeOccs.map((occ) => {
                            const occIdStr = String(occ.id);
                            const isSelected = (form.occasions_ids || '').split(',').map(s => s.trim()).includes(occIdStr);
                            const occName = occ.occasions || occ.occasion_name || occ.name || `Occasion #${occ.id}`;
                            return (
                              <button
                                key={occ.id}
                                type="button"
                                onClick={() => {
                                  const next = toggleIdInString(form.occasions_ids, occ.id);
                                  onChange({ target: { name: 'occasions_ids', value: next } });
                                }}
                                className={`rounded-lg px-3 py-1.5 font-medium transition cursor-pointer border ${isSelected
                                    ? 'bg-[#1A1817] text-white border-[#1A1817] shadow-xs'
                                    : 'bg-[#FAF8F5] text-[#1A1817] border-[#E2DDD5] hover:border-[#1A1817]'
                                  }`}
                              >
                                {occName} {isSelected && '✓'}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-[#8C857B]">No active occasions available.</p>
                      );
                    })()}
                  </div>

                  {/* CATEGORIES */}
                  <div className="border-t border-[#F0ECE1] pt-5">
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#8C857B]">
                      CATEGORIES <span className="text-red-600 font-bold">*</span>
                    </label>
                    {(() => {
                      const activeCats = (categoriesList || []).filter((cat) => {
                        const status = cat.categories_status || cat.status || 'Active';
                        const catIdStr = String(cat.id);
                        const isSelected = (form.categories_ids || '').split(',').map(s => s.trim()).includes(catIdStr);
                        return String(status).toLowerCase() === 'active' || isSelected;
                      });
                      return activeCats.length > 0 ? (
                        <div className="flex flex-wrap gap-2 text-xs">
                          {activeCats.map((cat) => {
                            const catIdStr = String(cat.id);
                            const isSelected = (form.categories_ids || '').split(',').map(s => s.trim()).includes(catIdStr);
                            const catName = cat.categories || cat.category_name || cat.name || `Category #${cat.id}`;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  const next = toggleIdInString(form.categories_ids, cat.id);
                                  onChange({ target: { name: 'categories_ids', value: next } });
                                }}
                                className={`rounded-lg px-3 py-1.5 font-medium transition cursor-pointer border ${isSelected
                                    ? 'bg-[#1A1817] text-white border-[#1A1817] shadow-xs'
                                    : 'bg-[#FAF8F5] text-[#1A1817] border-[#E2DDD5] hover:border-[#1A1817]'
                                  }`}
                              >
                                {catName} {isSelected && '✓'}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-[#8C857B]">No active categories available.</p>
                      );
                    })()}
                  </div>

                  {/* CARD TYPES */}
                  <div className="border-t border-[#F0ECE1] pt-5">
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#8C857B]">
                      CARD TYPES <span className="text-red-600 font-bold">*</span>
                    </label>
                    {(() => {
                      const activeCardTypes = (cardTypesList || []).filter((ct) => {
                        const status = ct.card_types_status || ct.status || 'Active';
                        const ctIdStr = String(ct.id);
                        const isSelected = (form.card_types_ids || '').split(',').map(s => s.trim()).includes(ctIdStr);
                        return String(status).toLowerCase() === 'active' || isSelected;
                      });
                      return activeCardTypes.length > 0 ? (
                        <div className="flex flex-wrap gap-2 text-xs">
                          {activeCardTypes.map((ct) => {
                            const ctIdStr = String(ct.id);
                            const isSelected = (form.card_types_ids || '').split(',').map(s => s.trim()).includes(ctIdStr);
                            const ctName = ct.card_types || ct.card_type_name || ct.name || `Card Type #${ct.id}`;
                            return (
                              <button
                                key={ct.id}
                                type="button"
                                onClick={() => {
                                  const next = toggleIdInString(form.card_types_ids, ct.id);
                                  onChange({ target: { name: 'card_types_ids', value: next } });
                                }}
                                className={`rounded-lg px-3 py-1.5 font-medium transition cursor-pointer border ${isSelected
                                    ? 'bg-[#1A1817] text-white border-[#1A1817] shadow-xs'
                                    : 'bg-[#FAF8F5] text-[#1A1817] border-[#E2DDD5] hover:border-[#1A1817]'
                                  }`}
                              >
                                {ctName} {isSelected && '✓'}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-[#8C857B]">No active card types available.</p>
                      );
                    })()}
                  </div>

                  {/* STATUS - Only shown in Edit Product mode */}
                  {editingId && (
                    <div className="border-t border-[#F0ECE1] pt-5">
                      <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-[#8C857B]">
                        STATUS
                      </label>
                      <select
                        name="product_status"
                        value={form.product_status || 'Active'}
                        onChange={onChange}
                        className="w-full rounded-md border border-[#E2DDD5] bg-[#FAF8F5] p-2 text-xs text-[#1A1817] outline-none focus:border-[#1A1817]"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Modal Footer Bar */}
              <div className="lg:col-span-3 mt-6 flex items-center justify-end gap-3 border-t border-[#E2DDD5] pt-6">
                <button
                  type="button"
                  onClick={onCloseModal}
                  className="rounded-full border border-[#E2DDD5] bg-white hover:bg-[#F7F5F0] px-4 py-1.5 font-serif text-xs font-normal tracking-wide text-[#1A1817] transition cursor-pointer shadow-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-full bg-[#1A1817] hover:bg-[#38332E] px-4 py-1.5 font-serif text-xs font-normal tracking-wide text-white transition shadow-xs cursor-pointer disabled:opacity-50 flex items-center gap-2"
                >
                  <svg className="h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {submitting ? 'Saving...' : editingId ? 'Update Product' : 'Publish Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fullscreen Image Preview Lightbox with Left Thumbnail Sidebar */}
      {previewModalData && previewModalData.images && previewModalData.images.length > 0 && (
        <div
          onClick={() => setPreviewModalData(null)}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 sm:p-8 animate-fade-in cursor-pointer select-none"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex h-[88vh] w-[92vw] max-w-6xl overflow-hidden rounded-2xl border border-white/20 bg-stone-900/90 shadow-2xl backdrop-blur-xl"
          >
            {/* Top Right Close Button */}
            <button
              type="button"
              onClick={() => setPreviewModalData(null)}
              className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-600 transition cursor-pointer shadow-lg border border-white/10"
              title="Close Preview"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* LEFT SIDEBAR: Remaining / All Images Thumbnails */}
            {previewModalData.images.length > 1 && (
              <div className="w-36 border-r border-white/10 bg-black/50 p-4 overflow-y-auto flex flex-col gap-3 shrink-0 z-10 custom-scrollbar">
                <div className="border-b border-white/10 pb-2 mb-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#C99C4B]">
                    Images ({previewModalData.images.length})
                  </p>
                </div>
                {previewModalData.images.map((imgUrl, i) => {
                  const isActive = i === previewModalData.activeIndex;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPreviewModalData((prev) => ({ ...prev, activeIndex: i }))}
                      className={`relative h-24 w-full rounded-lg overflow-hidden border transition-all cursor-pointer ${
                        isActive
                          ? 'border-[#C99C4B] ring-2 ring-[#C99C4B]/80 scale-105 shadow-lg'
                          : 'border-white/20 opacity-60 hover:opacity-100 hover:border-white/50'
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Thumbnail ${i + 1}`}
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover"
                      />
                      {isActive && (
                        <div className="absolute inset-0 bg-[#C99C4B]/10 border-2 border-[#C99C4B] rounded-lg pointer-events-none" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* MAIN VIEWPORT: Selected Active Image */}
            <div className="relative flex-1 flex items-center justify-center p-6 bg-black/30 overflow-hidden">
              {previewModalData.images.length > 1 && (
                <>
                  {/* Left Arrow Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewModalData((prev) => ({
                        ...prev,
                        activeIndex: (prev.activeIndex - 1 + prev.images.length) % prev.images.length,
                      }))
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-[#C99C4B] transition cursor-pointer border border-white/20 shadow-lg"
                    title="Previous Image"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Right Arrow Button */}
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewModalData((prev) => ({
                        ...prev,
                        activeIndex: (prev.activeIndex + 1) % prev.images.length,
                      }))
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white hover:bg-[#C99C4B] transition cursor-pointer border border-white/20 shadow-lg"
                    title="Next Image"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              <img
                src={previewModalData.images[previewModalData.activeIndex] || previewModalData.images[0]}
                alt="Product Full Preview"
                referrerPolicy="no-referrer"
                className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl transition-all duration-300"
              />
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleConfirmLogout}
        submitting={loggingOut}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={confirmDeleteModal.isOpen}
        onClose={() => setConfirmDeleteModal({ isOpen: false })}
        onConfirm={async () => {
          if (confirmDeleteModal.onConfirm) {
            await confirmDeleteModal.onConfirm();
          }
        }}
        title={confirmDeleteModal.title}
        message={confirmDeleteModal.message}
        submitting={submitting}
      />
    </div>
  );
}

export default ProductView;

