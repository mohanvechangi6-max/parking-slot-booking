import { useEffect, useState } from 'react';
import slotService from '../services/slotService';

const emptyForm = { slotNumber: '', location: '', pricePerHour: '', isActive: true };
const getErrorMessage = (error, fallback) => error.response?.data?.message || fallback;

function AdminSlots() {
  const [slots, setSlots] = useState([]);
  const [stats, setStats] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const [slotData, statsData] = await Promise.all([
        slotService.getSlots({ page: 1, limit: 100 }),
        slotService.getSlotStats(),
      ]);
      setSlots(slotData.slots || []);
      setStats(statsData);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to load the admin dashboard.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleChange = (event) => {
    const { name, type, checked, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: type === 'checkbox' ? checked : value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    if (!form.slotNumber || !form.location || form.pricePerHour === '') {
      setError('Slot number, location, and price per hour are required.');
      return;
    }

    setSaving(true);
    try {
      const payload = { ...form, pricePerHour: Number(form.pricePerHour) };
      const data = editingId
        ? await slotService.updateSlot(editingId, payload)
        : await slotService.createSlot(payload);
      if (editingId) {
        setSlots((currentSlots) => currentSlots.map((slot) => (slot._id === editingId ? data.slot : slot)));
      } else {
        setSlots((currentSlots) => [...currentSlots, data.slot]);
      }
      resetForm();
      const statsData = await slotService.getSlotStats();
      setStats(statsData);
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to save this slot.'));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (slot) => {
    setEditingId(slot._id);
    setForm({
      slotNumber: slot.slotNumber,
      location: slot.location,
      pricePerHour: slot.pricePerHour,
      isActive: slot.isActive,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (slotId) => {
    if (!window.confirm('Delete this parking slot?')) return;
    setError('');
    try {
      await slotService.deleteSlot(slotId);
      setSlots((currentSlots) => currentSlots.filter((slot) => slot._id !== slotId));
      setStats(await slotService.getSlotStats());
    } catch (requestError) {
      setError(getErrorMessage(requestError, 'Unable to delete this slot.'));
    }
  };

  return (
    <main className="admin-page">
      <div className="admin-header">
        <div>
          <p className="eyebrow admin-eyebrow">Operations</p>
          <h1>Slot management</h1>
          <p className="admin-subtitle">Keep inventory, pricing, and availability current.</p>
        </div>
      </div>

      {error && <div role="alert" className="admin-error">{error}</div>}

      <section className="admin-stats">
        {[
          ['Total slots', stats?.totalSlots ?? '--'],
          ['Active slots', stats?.activeSlots ?? '--'],
          ['Currently occupied', stats?.currentlyOccupied ?? '--'],
          ['Occupancy rate', stats ? `${stats.occupancyRate}%` : '--'],
        ].map(([label, value]) => (
          <div className="stat-card" key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
          </div>
        ))}
      </section>

      <section className="admin-panel form-panel">
        <div className="panel-head">
          <h2>{editingId ? 'Edit slot' : 'Add a slot'}</h2>
          {editingId && (
            <button className="cancel-link" type="button" onClick={resetForm}>
              Cancel edit
            </button>
          )}
        </div>

        <form className="slot-form" onSubmit={handleSubmit}>
          <label>
            Slot number
            <input name="slotNumber" value={form.slotNumber} onChange={handleChange} placeholder="A-101" />
          </label>
          <label>
            Location
            <input name="location" value={form.location} onChange={handleChange} placeholder="North Garage" />
          </label>
          <label>
            Price / hour
            <input name="pricePerHour" type="number" min="0" step="0.01" value={form.pricePerHour} onChange={handleChange} placeholder="5.00" />
          </label>
          <div className="form-actions">
            <label className="checkbox-row">
              <input name="isActive" type="checkbox" checked={form.isActive} onChange={handleChange} />
              Active
            </label>
            <button className="button button-primary submit-btn" type="submit" disabled={saving}>
              {saving ? 'Saving...' : editingId ? 'Update' : 'Add slot'}
            </button>
          </div>
        </form>
      </section>

      <section className="admin-panel table-panel">
        <div className="panel-head">
          <h2>All slots</h2>
        </div>

        {loading ? (
          <p className="table-empty">Loading slots...</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Slot</th>
                  <th>Location</th>
                  <th>Price / hour</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {slots.map((slot) => (
                  <tr key={slot._id}>
                    <td>{slot.slotNumber}</td>
                    <td>{slot.location}</td>
                    <td>${Number(slot.pricePerHour).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge ${slot.isActive ? 'active' : 'inactive'}`}>
                        {slot.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button type="button" onClick={() => handleEdit(slot)}>Edit</button>
                        <button type="button" className="delete-link" onClick={() => handleDelete(slot._id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default AdminSlots;
