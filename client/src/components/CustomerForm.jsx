import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { customersAPI } from '../services/api';

const CustomerForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone_number: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isEdit) {
      fetchCustomer();
    }
  }, [id, isEdit]);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const response = await customersAPI.getById(id);
      setFormData(response.data.data);
    } catch (err) {
      console.error('Error fetching customer:', err);
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.phone_number.trim()) {
      newErrors.phone_number = 'Phone number is required';
    } else {
      // phone number validation
      const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{8,}$/;
      if (!phoneRegex.test(formData.phone_number)) {
        newErrors.phone_number = 'Please enter a valid phone number';
      }
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
        await customersAPI.update(id, formData);
      } else {
        await customersAPI.create(formData);
      }
      navigate('/customers');
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

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="customer-form">
      <h1>{isEdit ? 'Edit Customer' : 'Add New Customer'}</h1>
      
      {errors.submit && <div className="error-message">{errors.submit}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="first_name">First Name *</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className={errors.first_name ? 'error' : ''}
          />
          {errors.first_name && <span className="field-error">{errors.first_name}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="last_name">Last Name *</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className={errors.last_name ? 'error' : ''}
          />
          {errors.last_name && <span className="field-error">{errors.last_name}</span>}
        </div>
        
        <div className="form-group">
          <label htmlFor="phone_number">Phone Number *</label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleChange}
            className={errors.phone_number ? 'error' : ''}
            placeholder="e.g., +1 (555) 123-4567"
          />
          {errors.phone_number && <span className="field-error">{errors.phone_number}</span>}
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate('/customers')}
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

export default CustomerForm;