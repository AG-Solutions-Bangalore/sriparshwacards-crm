import { useEffect, useState } from 'react';

function EditOccasion({
  item,
  onSave,
  onDelete,
  onCancel,
  loading,
}) {
  const [form, setForm] = useState({
    occasions: '',
    occasions_status: 'Active',
  });

  useEffect(() => {
    if (item) {
      setForm({
        occasions: item.occasions || '',
        occasions_status: item.occasions_status || 'Active',
      });
    }
  }, [item]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(item.id, form);
  };

  if (!item) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5">
      <h3 className="mb-4 text-xl font-semibold text-stone-900">Edit Occasion</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="edit-occasion-name" className="mb-2 block text-sm font-medium text-stone-700">
            Occasion Name
          </label>
          <input
            id="edit-occasion-name"
            name="occasions"
            type="text"
            value={form.occasions}
            onChange={handleChange}
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-800 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
            required
          />
        </div>

        <div>
          <label htmlFor="edit-occasion-status" className="mb-2 block text-sm font-medium text-stone-700">
            Status
          </label>
          <select
            id="edit-occasion-status"
            name="occasions_status"
            value={form.occasions_status}
            onChange={handleChange}
            className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-800 shadow-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:bg-stone-400 cursor-pointer"
          >
            {loading ? 'Saving...' : 'Save'}
          </button>

          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 cursor-pointer"
          >
            Delete
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-100 cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditOccasion;
