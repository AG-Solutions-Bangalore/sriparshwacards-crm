import { useEffect, useRef, useState } from 'react';

import Sidebar from '../dashboard/Sidebar';

/* Toggleable Columns */
const TOGGLEABLE_COLUMNS = [
  { key: 'slno', label: 'Sl.no' },
  { key: 'name', label: 'Product Name' },
  { key: 'made_of', label: 'Made Of' },
  { key: 'occasions', label: 'Occasion IDs' },
  { key: 'categories', label: 'Category IDs' },
  { key: 'card_types', label: 'Card Type IDs' },
  { key: 'status', label: 'Status' },
];

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
  onAddImageRow,
  onRemoveImageRow,
  onImageChange,
  onAddPlacementRow,
  onRemovePlacementRow,
  onPlacementChange,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState({
    slno: true,
    name: true,
    made_of: true,
    occasions: true,
    categories: true,
    card_types: true,
    status: true,
  });
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setColumnsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleCol = (key) => {
    setVisibleCols((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredItems = items.filter((item) => {
    const name = item.product_name || item.name || '';
    const madeOf = item.product_made_of || '';
    return (
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      madeOf.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="flex min-h-screen bg-[#F7F5F0] text-[#1A1817] font-sans">
      <Sidebar />

      <main className="flex-1 p-8 overflow-y-auto">
        {/* ── PAGE HEADER ── */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="font-serif text-3xl font-normal tracking-tight text-[#1A1817]">
              Product Catalog
            </h1>
            <p className="mt-1 text-xs text-[#8C857B]">Manage luxury invitation suites & craftsmanship listings</p>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onProfile}
              className="flex items-center gap-3 rounded-full bg-white px-3 py-1.5 shadow-sm border border-[#E5E0D8] hover:border-[#C99C4B] transition cursor-pointer text-left"
              title="View Profile"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#EFECE6] text-xs font-serif font-bold text-[#1A1817] border border-[#D5CFC5]">
                EA
              </div>
              <div className="pr-1">
                <p className="text-xs font-bold text-[#1A1817] leading-tight">Admin User</p>
                <p className="text-[10px] text-[#8C857B] leading-tight">Manager</p>
              </div>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="rounded-none bg-[#1A1817] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white transition hover:bg-[#38332E] cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* ── MAIN CARD / TABLE CONTAINER ── */}
        <div className="rounded-xl border border-[#E8E3DA] bg-white shadow-xs">
          <div className="border-b border-[#F0ECE1] px-6 py-4 flex items-center justify-between">
            <h2 className="font-serif text-xl font-normal text-[#1A1817]">Product Catalog List</h2>
            <span className="text-xs font-medium text-[#8C857B]">{filteredItems.length} Products</span>
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
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-md border border-[#E2DDD5] bg-white py-2 pl-10 pr-4 text-xs text-[#1A1817] outline-none placeholder:text-[#A39C93] focus:border-[#1A1817] transition"
              />
            </div>

            <div className="flex items-center gap-3">
              {/* Columns Toggle Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => setColumnsOpen((o) => !o)}
                  className={`flex items-center gap-2 rounded-md border px-4 py-2 text-xs font-semibold uppercase tracking-wider transition shadow-xs cursor-pointer ${
                    columnsOpen
                      ? 'border-[#1A1817] bg-[#F5CE93] text-[#1A1817]'
                      : 'border-[#E2DDD5] bg-white text-[#59534C] hover:bg-[#F7F5F0]'
                  }`}
                >
                  <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                className="flex items-center gap-2 bg-[#1A1817] hover:bg-[#38332E] px-5 py-2 text-xs font-semibold uppercase tracking-widest text-white transition shadow-xs cursor-pointer"
              >
                <span className="text-sm font-bold leading-none">+</span>
                ADD NEW PRODUCT
              </button>
            </div>
          </div>

          {/* ── TABLE ── */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-[#E2DDD5] bg-[#EFECE6]">
                <tr className="text-[11px] font-semibold uppercase tracking-wider text-[#59534C]">
                  {visibleCols.slno && <th className="w-16 px-6 py-3.5">Sl.no</th>}
                  {visibleCols.name && <th className="px-6 py-3.5">Product Name</th>}
                  {visibleCols.made_of && <th className="px-6 py-3.5">Made Of</th>}
                  {visibleCols.occasions && <th className="px-6 py-3.5">Occasion IDs</th>}
                  {visibleCols.categories && <th className="px-6 py-3.5">Category IDs</th>}
                  {visibleCols.card_types && <th className="px-6 py-3.5">Card Type IDs</th>}
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
                ) : filteredItems.length > 0 ? (
                  filteredItems.map((item, index) => {
                    const status = item.product_status || item.status || 'Active';
                    return (
                      <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                        {visibleCols.slno && <td className="px-6 py-4 font-mono text-[#8C857B]">{index + 1}</td>}
                        {visibleCols.name && (
                          <td className="px-6 py-4 font-bold text-[#1A1817]">
                            {item.product_name}
                          </td>
                        )}
                        {visibleCols.made_of && <td className="px-6 py-4 text-[#59534C]">{item.product_made_of || 'N/A'}</td>}
                        {visibleCols.occasions && <td className="px-6 py-4 text-[#8C857B] font-mono">{item.occasions_ids || 'N/A'}</td>}
                        {visibleCols.categories && <td className="px-6 py-4 text-[#8C857B] font-mono">{item.categories_ids || 'N/A'}</td>}
                        {visibleCols.card_types && <td className="px-6 py-4 text-[#8C857B] font-mono">{item.card_types_ids || 'N/A'}</td>}
                        {visibleCols.status && (
                          <td className="px-6 py-4">
                            <button
                              type="button"
                              onClick={() => onToggleStatus && onToggleStatus(item.id, status)}
                              className={`inline-block border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider cursor-pointer transition ${
                                status === 'Active'
                                  ? 'border-[#1A1817] text-[#1A1817] bg-white hover:bg-[#F5CE93]'
                                  : 'border-[#C5C0B6] text-[#8C857B] bg-white hover:bg-[#EFECE6]'
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
                            {onDelete && (
                              <button
                                type="button"
                                onClick={() => onDelete(item.id)}
                                className="p-1.5 text-[#8C857B] hover:text-red-600 transition cursor-pointer"
                                title="Delete Product"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              </button>
                            )}
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
        </div>
      </main>

      {/* ─────────── LUXURY REDESIGNED MODAL (Image 2 Parity) ─────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative my-6 w-full max-w-5xl rounded-xl bg-[#F7F5F0] p-8 shadow-2xl border border-[#E2DDD5] max-h-[92vh] overflow-y-auto">
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
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={onCloseModal}
                  className="text-xs font-semibold uppercase tracking-widest text-[#59534C] hover:text-[#1A1817] transition cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={onCloseModal}
                  className="border border-[#2D2926] bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-[#1A1817] hover:bg-[#EFECE6] transition cursor-pointer"
                >
                  SAVE DRAFT
                </button>
                <button
                  type="button"
                  onClick={onSubmit}
                  disabled={submitting}
                  className="bg-[#1A1817] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#38332E] transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'SAVING...' : 'PUBLISH PRODUCT'}
                </button>
              </div>
            </div>

            <form onSubmit={onSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-3">
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
                      INVITATION NAME
                    </label>
                    <input
                      id="product_name"
                      name="product_name"
                      type="text"
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
                      MADE OF / CRAFTSMANSHIP DETAILS
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

                  {/* Description with WYSIWYG rich toolbar header (Image 2) */}
                  <div>
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#8C857B]">
                      DESCRIPTION
                    </label>
                    <div className="rounded-md border border-[#E2DDD5] bg-[#FAF8F5]">
                      {/* Rich Editor Bar */}
                      <div className="flex items-center gap-4 border-b border-[#E2DDD5] px-4 py-2 text-xs font-semibold text-[#59534C]">
                        <button type="button" className="font-bold hover:text-[#1A1817]">B</button>
                        <button type="button" className="italic hover:text-[#1A1817]">I</button>
                        <button type="button" className="hover:text-[#1A1817]">≡</button>
                        <button type="button" className="hover:text-[#1A1817]">1.</button>
                      </div>
                      <textarea
                        rows={5}
                        placeholder="Detail the craftsmanship, paper quality, and design inspiration..."
                        className="w-full bg-transparent p-4 text-xs text-[#1A1817] outline-none placeholder:text-[#A39C93] resize-y"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Media Gallery Card (Image 2 style) */}
                <div className="rounded-xl border border-[#E8E3DA] bg-white p-6 shadow-xs">
                  <div className="mb-6 flex items-baseline justify-between">
                    <h3 className="font-serif text-2xl font-normal text-[#1A1817]">Media Gallery</h3>
                    <span className="text-xs text-[#8C857B]">Upload high-res images (JPG, PNG)</span>
                  </div>

                  {/* Primary Image dropzone + Guidelines Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Dropzone (2 cols) */}
                    <div className="md:col-span-2 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-[#E2DDD5] bg-[#FAF8F5] p-8 text-center">
                      <div className="mb-3 text-[#A39C93]">
                        <svg className="mx-auto h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.2">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      </div>
                      <p className="text-xs font-semibold text-[#1A1817]">Drag & drop primary image</p>
                      <button
                        type="button"
                        onClick={onAddImageRow}
                        className="mt-4 border border-[#2D2926] bg-white px-5 py-1.5 text-xs font-semibold text-[#1A1817] hover:bg-[#EFECE6] transition cursor-pointer"
                      >
                        Browse
                      </button>
                    </div>

                    {/* Guidelines Box */}
                    <div className="rounded-lg bg-[#F7F5F0] p-4 text-xs text-[#59534C] space-y-3">
                      <p className="font-bold text-[#1A1817]">Image Guidelines</p>
                      <div className="flex items-start gap-2 text-[11px]">
                        <span className="text-[#1A1817] font-bold">✓</span>
                        <p>Use high quality, well-lit photos.</p>
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
                      <button
                        type="button"
                        onClick={onAddImageRow}
                        className="text-xs font-bold text-[#1A1817] hover:underline"
                      >
                        + ADD IMAGE
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {(form.images || []).map((img, idx) => (
                        <div key={idx} className="rounded-lg border border-[#E2DDD5] bg-[#FAF8F5] p-3 flex flex-col justify-between">
                          <input
                            type="text"
                            placeholder="Image URL / Base64"
                            value={img.product_images || ''}
                            onChange={(e) => onImageChange(idx, 'product_images', e.target.value)}
                            className="w-full rounded border border-[#E2DDD5] bg-white p-2 text-xs text-[#1A1817] mb-2"
                          />
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="text-[#8C857B]">Sort: {img.product_images_sort_order || idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => onRemoveImageRow(idx, img.id)}
                              className="text-red-600 font-bold hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── RIGHT COLUMN (1 Col): Placement & Categorization ── */}
              <div className="space-y-6">
                {/* 1. Placement Card (Image 2) */}
                <div className="rounded-xl border border-[#E8E3DA] bg-white p-6 shadow-xs">
                  <h3 className="font-serif text-2xl font-normal text-[#1A1817] mb-6">Placement</h3>
                  <div className="space-y-3.5 text-xs text-[#1A1817]">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-[#C5C0B6] accent-[#1A1817]" />
                      <span>Show on Homepage</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input type="checkbox" className="h-4 w-4 rounded border-[#C5C0B6] accent-[#1A1817]" />
                      <span>Mark as Bestseller</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input type="checkbox" className="h-4 w-4 rounded border-[#C5C0B6] accent-[#1A1817]" />
                      <span>Mark as New Arrival</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input type="checkbox" className="h-4 w-4 rounded border-[#C5C0B6] accent-[#1A1817]" />
                      <span>Featured Product</span>
                    </label>
                  </div>

                  {/* Backend Placement Row items binding */}
                  <div className="mt-6 border-t border-[#F0ECE1] pt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C857B]">PLACEMENT DATA IDS</span>
                      <button type="button" onClick={onAddPlacementRow} className="text-[10px] font-bold text-[#1A1817]">+ ADD ROW</button>
                    </div>
                    {(form.placements || []).map((plc, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Placement ID (e.g. 1)"
                          value={plc.placements_id || ''}
                          onChange={(e) => onPlacementChange(idx, 'placements_id', e.target.value)}
                          className="flex-1 rounded border border-[#E2DDD5] bg-[#FAF8F5] p-1.5 text-xs text-[#1A1817]"
                        />
                        <button type="button" onClick={() => onRemovePlacementRow(idx, plc.id)} className="text-xs text-red-600">✕</button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Categorization Card (Image 2) */}
                <div className="rounded-xl border border-[#E8E3DA] bg-white p-6 shadow-xs">
                  <h3 className="font-serif text-2xl font-normal text-[#1A1817] mb-6">Categorization</h3>

                  {/* BY TIER */}
                  <div className="mb-6">
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#8C857B]">
                      BY TIER
                    </label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {['Standard', 'Premium', 'Luxury', 'Exclusive'].map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          className="rounded-md border border-[#E2DDD5] bg-[#FAF8F5] py-2 text-center font-medium text-[#1A1817] hover:border-[#1A1817] transition cursor-pointer"
                        >
                          {tier}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* BY TRADITION */}
                  <div className="mb-6">
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#8C857B]">
                      BY TRADITION
                    </label>
                    <div className="space-y-2.5 text-xs text-[#1A1817]">
                      {['Hindu Wedding', 'Sikh Wedding', 'Islamic Wedding', 'Christian Wedding'].map((trad) => (
                        <label key={trad} className="flex items-center gap-3 cursor-pointer select-none">
                          <input type="checkbox" className="h-4 w-4 rounded border-[#C5C0B6] accent-[#1A1817]" />
                          <span>{trad}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* BY STYLE */}
                  <div className="mb-6">
                    <label className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#8C857B]">
                      BY STYLE
                    </label>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {['Floral', 'Minimalist', 'Traditional', 'Modern', 'Vintage'].map((style) => (
                        <span
                          key={style}
                          className="rounded-full border border-[#D5CFC5] px-3 py-1 font-medium text-[#1A1817] hover:bg-[#F5CE93] hover:border-[#1A1817] transition cursor-pointer"
                        >
                          {style}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Specific ID bindings */}
                  <div className="border-t border-[#F0ECE1] pt-4 space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#8C857B]">Occasions IDs</label>
                      <input
                        type="text"
                        name="occasions_ids"
                        value={form.occasions_ids || ''}
                        onChange={onChange}
                        placeholder="e.g. 1,2"
                        className="w-full rounded border border-[#E2DDD5] bg-[#FAF8F5] p-2 text-xs text-[#1A1817]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#8C857B]">Categories IDs</label>
                      <input
                        type="text"
                        name="categories_ids"
                        value={form.categories_ids || ''}
                        onChange={onChange}
                        placeholder="e.g. 1"
                        className="w-full rounded border border-[#E2DDD5] bg-[#FAF8F5] p-2 text-xs text-[#1A1817]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#8C857B]">Card Types IDs</label>
                      <input
                        type="text"
                        name="card_types_ids"
                        value={form.card_types_ids || ''}
                        onChange={onChange}
                        placeholder="e.g. 1"
                        className="w-full rounded border border-[#E2DDD5] bg-[#FAF8F5] p-2 text-xs text-[#1A1817]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#8C857B]">Status</label>
                      <select
                        name="product_status"
                        value={form.product_status || 'Active'}
                        onChange={onChange}
                        className="w-full rounded border border-[#E2DDD5] bg-[#FAF8F5] p-2 text-xs text-[#1A1817]"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductView;

