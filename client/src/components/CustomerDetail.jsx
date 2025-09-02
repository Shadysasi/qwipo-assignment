import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { customersAPI, addressesAPI } from '../services/api';
import AddressList from './AddressList';
import AddressForm from './AddressForm';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCustomerAndAddresses = useCallback(async () => {
    try {
      setLoading(true);
      const [customerResponse, addressesResponse] = await Promise.all([
        customersAPI.getById(id),
        addressesAPI.getByCustomerId(id)
      ]);
      
      setCustomer(customerResponse.data.data);
      setAddresses(addressesResponse.data.data);
    } catch (err) {
      setError('Failed to fetch customer details');
      console.error('Error fetching customer details:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCustomerAndAddresses();
  }, [id, fetchCustomerAndAddresses]);

  const handleDeleteCustomer = async () => {
    if (window.confirm('Are you sure you want to delete this customer and all their addresses?')) {
      try {
        await customersAPI.delete(id);
        navigate('/customers');
      } catch (err) {
        setError('Failed to delete customer');
        console.error('Error deleting customer:', err);
      }
    }
  };

  const handleAddressCreated = () => {
    setShowAddressForm(false);
    fetchCustomerAndAddresses();
  };

  const handleAddressUpdated = () => {
    setEditingAddress(null);
    fetchCustomerAndAddresses();
  };

  const handleAddressDeleted = () => {
    fetchCustomerAndAddresses();
  };

  const handleEditAddress = (address) => {
    setEditingAddress(address);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!customer) return <div className="error">Customer not found</div>;

  return (
    <div className="customer-detail">
      <div className="header">
        <h1>
          {customer.first_name} {customer.last_name}
        </h1>
        <div className="actions">
          <Link to={`/customers/${id}/edit`} className="btn btn-warning">
            Edit Customer
          </Link>
          <button onClick={handleDeleteCustomer} className="btn btn-danger">
            Delete Customer
          </button>
          <Link to="/customers" className="btn btn-secondary">
            Back to List
          </Link>
        </div>
      </div>

      <div className="customer-info">
        <p><strong>Phone:</strong> {customer.phone_number}</p>
      </div>

      <div className="addresses-section">
        <h2>
          Addresses 
          <button 
            onClick={() => setShowAddressForm(true)} 
            className="btn btn-primary"
            style={{ marginLeft: '1rem' }}
          >
            Add Address
          </button>
        </h2>

        {showAddressForm && (
          <AddressForm
            customerId={parseInt(id)}
            onCancel={() => setShowAddressForm(false)}
            onSuccess={handleAddressCreated}
          />
        )}

        {editingAddress && (
          <AddressForm
            address={editingAddress}
            onCancel={() => setEditingAddress(null)}
            onSuccess={handleAddressUpdated}
          />
        )}

        <AddressList
          addresses={addresses}
          onEdit={handleEditAddress}
          onDelete={handleAddressDeleted}
        />
      </div>
    </div>
  );
};

export default CustomerDetail;