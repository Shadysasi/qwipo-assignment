import { addressesAPI } from '../services/api';

const AddressList = ({ addresses, onEdit, onDelete }) => {
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await addressesAPI.delete(id);
        onDelete();
      } catch (err) {
        console.error('Error deleting address:', err);
        alert('Failed to delete address');
      }
    }
  };

  if (addresses.length === 0) {
    return <p>No addresses found for this customer.</p>;
  }

  return (
    <div className="address-list">
      {addresses.map(address => (
        <div key={address.id} className="address-card">
          <div className="address-details">
            <p>{address.address_details}</p>
            <p>
              {address.city}, {address.state} {address.pin_code}
            </p>
          </div>
          <div className="address-actions">
            <button 
              onClick={() => onEdit(address)} 
              className="btn btn-warning"
            >
              Edit
            </button>
            <button 
              onClick={() => handleDelete(address.id)} 
              className="btn btn-danger"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AddressList;