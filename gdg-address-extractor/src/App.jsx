import { useState, useEffect } from 'react';
import { isAIAvailable, extractAddressInfo } from './lib/ai';

function App() {
  const [aiAvailable, setAiAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Sample Indian addresses with names
  const [customers, setCustomers] = useState([
    {
      id: 1,
      firstName: 'Rajesh',
      lastName: 'Kumar',
      address: 'Flat 302, Sunrise Apartments, Sector 5, Noida, Uttar Pradesh 201301',
      city: '',
      state: '',
      pinCode: ''
    },
    {
      id: 2,
      firstName: 'Priya',
      lastName: 'Sharma',
      address: 'House No. 45, MG Road, Koramangala, Bangalore, Karnataka 560095',
      city: '',
      state: '',
      pinCode: ''
    },
    {
      id: 3,
      firstName: 'Amit',
      lastName: 'Patel',
      address: 'Shop No. 12, Commercial Complex, Vastrapur, Ahmedabad, Gujarat 380015',
      city: '',
      state: '',
      pinCode: ''
    },
    {
      id: 4,
      firstName: 'Sneha',
      lastName: 'Desai',
      address: 'B-204, Green Valley Society, Andheri West, Mumbai, Maharashtra 400053',
      city: '',
      state: '',
      pinCode: ''
    },
    {
      id: 5,
      firstName: 'Vikram',
      lastName: 'Singh',
      address: 'Plot 78, Model Town, Ludhiana, Punjab 141002',
      city: '',
      state: '',
      pinCode: ''
    },
    {
      id: 6,
      firstName: 'Anjali',
      lastName: 'Reddy',
      address: 'Flat 5B, Tech Park Residency, Hitech City, Hyderabad, Telangana 500081',
      city: '',
      state: '',
      pinCode: ''
    },
    {
      id: 7,
      firstName: 'Rahul',
      lastName: 'Mehta',
      address: 'A-12, Shanti Nagar, Civil Lines, Jaipur, Rajasthan 302006',
      city: '',
      state: '',
      pinCode: ''
    }
  ]);

  useEffect(() => {
    setAiAvailable(isAIAvailable());
  }, []);

  async function handleExtractAddresses() {
    if (!aiAvailable) {
      setError('AI features not available. Enable Chrome AI flags in chrome://flags');
      return;
    }

    setLoading(true);
    setError('');

    // Process each customer address sequentially
    for (let i = 0; i < customers.length; i++) {
      const customer = customers[i];
      
      try {
        const extracted = await extractAddressInfo(customer.address);
        
        // Update the customer with extracted information
        setCustomers(prev => prev.map(c => 
          c.id === customer.id 
            ? { ...c, ...extracted }
            : c
        ));
        
        // Small delay to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (err) {
        console.error(`Error extracting address for ${customer.firstName} ${customer.lastName}:`, err);
        setError(`Failed to extract address for ${customer.firstName} ${customer.lastName}. ${err.message}`);
        // Continue with other addresses even if one fails
      }
    }

    setLoading(false);
  }

  function handleFieldChange(customerId, field, value) {
    setCustomers(prev => prev.map(c => 
      c.id === customerId 
        ? { ...c, [field]: value }
        : c
    ));
  }

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <h1>GDG Address Extractor</h1>
          <p>Extract structured address information using Chrome AI</p>
        </header>

        {!aiAvailable && (
          <div className="warning">
            <strong>⚠️ AI Features Not Available</strong>
            <p>To use this app, enable Chrome AI flags:</p>
            <ol>
              <li>Go to <code>chrome://flags</code></li>
              <li>Enable "Prompt API for Experimental AI Features"</li>
              <li>Restart Chrome</li>
            </ol>
          </div>
        )}

        <div className="actions">
          <button
            className="button button-primary"
            onClick={handleExtractAddresses}
            disabled={loading || !aiAvailable}
          >
            {loading ? 'Extracting Address Information...' : 'Extract Address Information'}
          </button>
        </div>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        <div className="table-container">
          <table className="customer-table">
            <thead>
              <tr>
                <th>First Name</th>
                <th>Last Name</th>
                <th>Address</th>
                <th>City</th>
                <th>State</th>
                <th>Pin Code</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.firstName}</td>
                  <td>{customer.lastName}</td>
                  <td className="address-cell">{customer.address}</td>
                  <td>
                    <input
                      type="text"
                      value={customer.city || ''}
                      onChange={(e) => handleFieldChange(customer.id, 'city', e.target.value)}
                      className={`editable-field ${customer.city ? 'extracted' : ''}`}
                      placeholder="City"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={customer.state || ''}
                      onChange={(e) => handleFieldChange(customer.id, 'state', e.target.value)}
                      className={`editable-field ${customer.state ? 'extracted' : ''}`}
                      placeholder="State"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      value={customer.pinCode || ''}
                      onChange={(e) => handleFieldChange(customer.id, 'pinCode', e.target.value)}
                      className={`editable-field ${customer.pinCode ? 'extracted' : ''}`}
                      placeholder="Pin Code"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default App;

