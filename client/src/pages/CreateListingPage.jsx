import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Plus, X, Image as ImageIcon } from 'lucide-react';
import api from '../services/api';
import FormInput from '../components/FormInput';
import { CATEGORIES, LISTING_TYPES, CONDITIONS } from '../utils/formatters';

const CreateListingPage = () => {
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
  });

  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

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

    if (!formData.title.trim()) {
      setError('Listing title is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (formData.listingType === 'For Sale' && (!formData.price || Number(formData.price) < 0)) {
      setError('Please provide a valid price in INR');
      return;
    }
    if (!formData.pickupLocation.trim()) {
      setError('Campus pickup location is required');
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...formData,
        price: formData.listingType === 'Free Donation' ? 0 : Number(formData.price),
        images: images.length > 0 ? images : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=700&q=80'],
      };

      const res = await api.post('/listings', payload);
      if (res.data.success) {
        navigate(`/listings/${res.data.listing._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to create listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-charcoal">List an Item on Campus</h1>
        <p className="text-xs text-charcoal-muted mt-1">
          Give your books, lab tools, furniture, or stationery a new home. Verified students only.
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
          placeholder="e.g. Casio fx-991EX Scientific Calculator or Engineering Mechanics 4th Ed"
          required
        />

        {/* Category & Listing Type Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Category <span className="text-rose-600">*</span>
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
              Listing Type <span className="text-rose-600">*</span>
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

        {/* Price & Condition Grid */}
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
              placeholder="e.g. 450"
              required
              helperText="Set a fair price for peers in INR"
            />
          ) : (
            <div className="p-3 bg-charcoal-light rounded-card flex flex-col justify-center">
              <span className="text-xs font-semibold text-charcoal">Price Setting</span>
              <span className="text-xs text-charcoal-muted">
                {formData.listingType === 'Free Donation'
                  ? 'Price is set to ₹0 (Free donation for peers)'
                  : 'Open to item swap/exchange'}
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-charcoal mb-1.5">
              Item Condition <span className="text-rose-600">*</span>
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
          placeholder="Mention key details: edition, course code, how long you used it, accessories included, and functionality..."
          required
        />

        {/* Exchange preferences (if type is Exchange) */}
        {formData.listingType === 'Exchange' && (
          <FormInput
            label="What items are you looking to exchange this for?"
            id="exchangePreferences"
            name="exchangePreferences"
            type="textarea"
            rows={2}
            value={formData.exchangePreferences}
            onChange={handleChange}
            placeholder="e.g. Looking for a study lamp, scientific calculator, or badminton racquet..."
            required
          />
        )}

        {/* Campus Pickup Location */}
        <FormInput
          label="Campus Pickup Location"
          id="pickupLocation"
          name="pickupLocation"
          value={formData.pickupLocation}
          onChange={handleChange}
          placeholder="e.g. Library Front Gate / Hostel 14 Common Room / Student Center"
          required
          helperText="All exchanges occur physically on university grounds."
        />

        {/* Image Upload / URL Section */}
        <div className="space-y-3">
          <label className="block text-xs font-semibold text-charcoal">
            Item Photos
          </label>
          
          <div className="flex flex-col sm:flex-row gap-3">
            {/* File upload input */}
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

            {/* URL input */}
            <div className="flex flex-1 gap-2">
              <input
                type="text"
                placeholder="Or paste image URL (e.g. Unsplash or web link)..."
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

          {/* Preview grid */}
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

        {/* Submit button */}
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
            {submitting ? 'Publishing...' : 'Publish Campus Listing'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default CreateListingPage;

