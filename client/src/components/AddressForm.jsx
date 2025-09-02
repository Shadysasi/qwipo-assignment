import { useState, useEffect } from 'react';
import { addressesAPI } from '../services/api';

const AddressForm = ({ customerId, address, onCancel, onSuccess }) => {
  const isEdit = Boolean(address);
  
  const [formData, setFormData] = useState({
    address_details: '',
    city: '',
    state: '',
    pin_code: ''
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      setFormData({
        address_details: address.address_details,
        city: address.city,
        state: address.state,
        pin_code: address.pin_code
      });
    }
  }, [address, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.address_details.trim()) {
      newErrors.address_details = 'Address details are required';
    }
    
    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.pin_code.trim()) {
      newErrors.pin_code = 'PIN code is required';
    } else if (!/^\d{6}$/.test(formData.pin_code)) {
      newErrors.pin_code = 'PIN code must be 6 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitting(true);
    try {
      if (isEdit) {
        await addressesAPI.update(address.id, formData);
      } else {
        await addressesAPI.create({ ...formData, customer_id: customerId });
      }
      onSuccess();
    } catch (err) {
      if (err.response?.data?.error) {
        setErrors({ submit: err.response.data.error });
      } else {
        setErrors({ submit: 'An error occurred. Please try again.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="address-form">
      <h3>{isEdit ? 'Edit Address' : 'Add New Address'}</h3>
      
      {errors.submit && <div className="error-message">{errors.submit}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="address_details">Address Details *</label>
          <textarea
            id="address_details"
            name="address_details"
            value={formData.address_details}
            onChange={handleChange}
            className={errors.address_details ? 'error' : ''}
            rows="3"
          />
          {errors.address_details && <span className="field-error">{errors.address_details}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="city">City *</label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            className={errors.city ? 'error' : ''}
          />
          {errors.city && <span className="field-error">{errors.city}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="state">State *</label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            className={errors.state ? 'error' : ''}
          />
          {errors.state && <span className="field-error">{errors.state}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="pin_code">PIN Code *</label>
          <input
            type="text"
            id="pin_code"
            name="pin_code"
            value={formData.pin_code}
            onChange={handleChange}
            className={errors.pin_code ? 'error' : ''}
            maxLength="6"
          />
          {errors.pin_code && <span className="field-error">{errors.pin_code}</span>}
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={submitting}
            className="btn btn-primary"
          >
            {submitting ? 'Saving...' : (isEdit ? 'Update' : 'Create')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddressForm;