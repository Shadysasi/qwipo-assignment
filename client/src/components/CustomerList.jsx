import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { customersAPI } from '../services/api';

const CustomerList = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('last_name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });

  const fetchCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder,
        search: searchTerm || undefined
      };
      
      const response = await customersAPI.getAll(params);
      setCustomers(response.data.data);
      setPagination(prev => ({ ...prev, ...response.data.pagination }));
      setError('');
    } catch (err) {
      setError('Failed to fetch customers');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sortBy, sortOrder, searchTerm]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchCustomers();
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(column);
      setSortOrder('ASC');
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      try {
        await customersAPI.delete(id);
        fetchCustomers();
      } catch (err) {
        setError('Failed to delete customer');
        console.error('Error deleting customer:', err);
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="customer-list">
      <div className="header">
        <h1>Customer List</h1>
        <Link to="/customers/new" className="btn btn-primary">
          Add New Customer
        </Link>
      </div>

      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <table className="customers-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('first_name')}>
              First Name {sortBy === 'first_name' && (sortOrder === 'ASC' ? '↑' : '↓')}
            </th>
            <th onClick={() => handleSort('last_name')}>
              Last Name {sortBy === 'last_name' && (sortOrder === 'ASC' ? '↑' : '↓')}
            </th>
            <th>Phone Number</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer.id}>
              <td>{customer.first_name}</td>
              <td>{customer.last_name}</td>
              <td>{customer.phone_number}</td>
              <td>
                <Link to={`/customers/${customer.id}`} className="btn btn-info">
                  View
                </Link>
                <Link to={`/customers/${customer.id}/edit`} className="btn btn-warning">
                  Edit
                </Link>
                <button 
                  onClick={() => handleDelete(customer.id)} 
                  className="btn btn-danger"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {pagination.pages > 1 && (
        <div className="pagination">
          <button 
            disabled={pagination.page === 1}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
          >
            Previous
          </button>
          
          <span>Page {pagination.page} of {pagination.pages}</span>
          
          <button 
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerList;