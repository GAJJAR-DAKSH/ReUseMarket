import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, X } from 'lucide-react';
import api from '../services/api';
import FormInput from '../components/FormInput';
import { CATEGORIES, LISTING_TYPES, CONDITIONS } from '../utils/formatters';

const EditListingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    listingType: 'For Sale',
    price: '',
    condition: 'Gently Used',
    pickupLocation: '',
    exchangePreferences: '',
    status: 'Available',
  });

  const [images, setImages] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchListing = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/listings/${id}`);
        if (res.data.success) {
          const l = res.data.listing;
          setFormData({
            title: l.title || '',
            description: l.description || '',
            category: l.category || CATEGORIES[0],
            listingType: l.listingType || 'For Sale',
            price: l.price || '',
            condition: l.condition || 'Gently Used',
            pickupLocation: l.pickupLocation || '',
            exchangePreferences: l.exchangePreferences || '',
            status: l.status || 'Available',
          });
          setImages(l.images || []);
        }
      } catch (err) {
        setError(err.message || 'Failed to load listing details');
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddImageUrl = () => {
    if (imageUrl.trim()) {
      setImages((prev) => [...prev, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const data = new FormData();
    for (let i = 0; i < files.length; i++) {
      data.append('images', files[i]);
    }

    try {
      setUploading(true);
      const res = await api.post('/listings/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) {
        setImages((prev) => [...prev, ...res.data.images]);
      }
    } catch (err) {
      setError(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        price: formData.listingType === 'Free Donation' ? 0 : Number(formData.price),
        images,
      };

      const res = await api.put(`/listings/${id}`, payload);
      if (res.data.success) {
        navigate(`/listings/${id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to update listing');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-xs text-charcoal-muted">Loading listing...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-charcoal">Edit Listing</h1>
        <p className="text-xs text-charcoal-muted mt-1">
          Update item details, condition, or change the status.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-charcoal-border rounded-card p-6 space-y-6">
        
        {/* Title */}
        <FormInput
          label="Item Title"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        {/* Status selector */}
        <div>
          <label className="block text-xs font-semibold text-charcoal mb-1.5">
            Listing Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3.5 py-2 text-sm rounded-card border border-charcoal-border bg-white text-charcoal focus:outline-none focus:border-primary"
          >
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
            <option value="Completed">Completed</option>
            <option value="Archived">Archived</option>
          </select>
        </div>

        {/* Category & Listing Type Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm rounded-card border border-charcoal-border bg-white text-charcoal focus:outline-none focus:border-primary"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Listing Type
            </label>
            <select
              name="listingType"
              value={formData.listingType}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm rounded-card border border-charcoal-border bg-white text-charcoal focus:outline-none focus:border-primary"
            >
              {LISTING_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Price & Condition */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {formData.listingType === 'For Sale' ? (
            <FormInput
              label="Price (₹)"
              id="price"
              name="price"
              type="number"
              min="0"
              value={formData.price}
              onChange={handleChange}
              required
            />
          ) : (
            <div className="p-3 bg-charcoal-light rounded-card flex flex-col justify-center text-xs">
              <span className="font-semibold text-charcoal">Price Setting</span>
              <span className="text-charcoal-muted">Non-monetary listing</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Item Condition
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm rounded-card border border-charcoal-border bg-white text-charcoal focus:outline-none focus:border-primary"
            >
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Description */}
        <FormInput
          label="Item Description"
          id="description"
          name="description"
          type="textarea"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          required
        />

        {/* Pickup Location */}
        <FormInput
          label="Campus Pickup Location"
          id="pickupLocation"
          name="pickupLocation"
          value={formData.pickupLocation}
          onChange={handleChange}
          required
        />

        {/* Photos */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-charcoal">Item Photos</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <label className="btn-secondary text-xs cursor-pointer inline-flex items-center gap-1.5 flex-shrink-0">
              <Upload className="w-4 h-4 text-primary" />
              <span>{uploading ? 'Uploading...' : 'Upload Photos'}</span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
            </label>
            <div className="flex flex-1 gap-2">
              <input
                type="text"
                placeholder="Or paste image URL..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-card border border-charcoal-border"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="btn-secondary text-xs px-3"
              >
                Add URL
              </button>
            </div>
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 pt-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative aspect-square rounded-card overflow-hidden border border-charcoal-border">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-card">
            {error}
          </div>
        )}

        <div className="pt-4 border-t border-charcoal-border flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="btn-secondary text-xs"
            disabled={submitting}
          >
            Cancel
          </button>
          <button type="submit" className="btn-primary text-xs" disabled={submitting}>
            {submitting ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditListingPage;

