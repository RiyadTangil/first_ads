'use client';

import { useState, useEffect } from 'react';
import { getUserFromLocalStorage } from '@/lib/localStorage';
import { 
  CreditCardIcon, 
  BanknotesIcon, 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  PencilIcon,
  GlobeAltIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Mock payment history data
const mockPaymentHistory = [
  {
    id: 'payment-1',
    date: '2023-10-15',
    amount: 250.00,
    status: 'paid',
    reference: 'OCT2023-PAYOUT',
    currency: 'USDT'
  },
  {
    id: 'payment-2',
    date: '2023-09-15',
    amount: 175.50,
    status: 'paid',
    reference: 'SEP2023-PAYOUT',
    currency: 'USDT'
  },
  {
    id: 'payment-3',
    date: '2023-11-15',
    amount: 320.25,
    status: 'pending',
    reference: 'NOV2023-PAYOUT',
    currency: 'USDT'
  },
  {
    id: 'payment-4',
    date: '2023-08-15',
    amount: 145.75,
    status: 'paid',
    reference: 'AUG2023-PAYOUT',
    currency: 'USDT'
  }
];

export default function PaymentPage() {
  const [user, setUser] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentHistory, setPaymentHistory] = useState(mockPaymentHistory);
  
  // Binance account information form state
  const [binanceInfo, setBinanceInfo] = useState({
    username: '',
    accountUrl: '',
    email: '',
    walletAddress: '',
    notes: ''
  });
  
  // Load user data
  useEffect(() => {
    const userData = getUserFromLocalStorage();
    if (userData) {
      setUser(userData);
      
      // In a real app, here you would fetch the binance info from backend
      // For now, simulate having some data already
      if (userData.id === 'user-1') {
        setBinanceInfo({
          username: 'johndoe_binance',
          accountUrl: 'https://www.binance.com/en/profile/johndoe_binance',
          email: 'john.doe@example.com',
          walletAddress: '0x1234abcd...5678efgh',
          notes: 'Preferred for USDT payments'
        });
      }
    }
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBinanceInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage('');
    setErrorMessage('');
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMessage('Your Binance account information has been updated successfully!');
      setIsEditing(false);
      // In a real app, here you would send the data to backend
    }, 1000);
  };
  
  // Calculate payment statistics
  const totalEarnings = paymentHistory.reduce((total, payment) => total + payment.amount, 0);
  const totalPaid = paymentHistory
    .filter(payment => payment.status === 'paid')
    .reduce((total, payment) => total + payment.amount, 0);
  const totalPending = paymentHistory
    .filter(payment => payment.status === 'pending')
    .reduce((total, payment) => total + payment.amount, 0);
  
  if (!user) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Account Information</h1>
        
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}
        
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
            <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
        
        {/* Payment Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
            <div className="p-4 bg-blue-50 border-b border-blue-100">
              <h3 className="font-medium text-blue-700 flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2" />
                Total Earnings
              </h3>
            </div>
            <div className="p-4">
              <p className="text-2xl font-bold text-gray-800">${totalEarnings.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">Lifetime earnings</p>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
            <div className="p-4 bg-green-50 border-b border-green-100">
              <h3 className="font-medium text-green-700 flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                Paid Amount
              </h3>
            </div>
            <div className="p-4">
              <p className="text-2xl font-bold text-gray-800">${totalPaid.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">Successfully paid</p>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
            <div className="p-4 bg-yellow-50 border-b border-yellow-100">
              <h3 className="font-medium text-yellow-700 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                Pending Amount
              </h3>
            </div>
            <div className="p-4">
              <p className="text-2xl font-bold text-gray-800">${totalPending.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">To be processed</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
            <div className="flex items-center">
              <GlobeAltIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h2 className="font-semibold text-lg text-gray-800">Binance Account Information</h2>
            </div>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)}
                className="flex items-center text-blue-600 hover:text-blue-800"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Edit
              </button>
            )}
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Binance Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={binanceInfo.username}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full p-3 border rounded-lg ${
                      !isEditing 
                        ? 'bg-gray-50 text-gray-500 border-gray-200' 
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    placeholder="Your Binance username"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Binance Account URL
                  </label>
                  <input
                    type="url"
                    name="accountUrl"
                    value={binanceInfo.accountUrl}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full p-3 border rounded-lg ${
                      !isEditing 
                        ? 'bg-gray-50 text-gray-500 border-gray-200' 
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    placeholder="https://www.binance.com/en/profile/your_username"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={binanceInfo.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full p-3 border rounded-lg ${
                      !isEditing 
                        ? 'bg-gray-50 text-gray-500 border-gray-200' 
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    placeholder="Email associated with your Binance account"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Wallet Address (Optional)
                  </label>
                  <input
                    type="text"
                    name="walletAddress"
                    value={binanceInfo.walletAddress}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`w-full p-3 border rounded-lg ${
                      !isEditing 
                        ? 'bg-gray-50 text-gray-500 border-gray-200' 
                        : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    placeholder="Your cryptocurrency wallet address"
                  />
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  name="notes"
                  value={binanceInfo.notes}
                  onChange={handleChange}
                  disabled={!isEditing}
                  rows={3}
                  className={`w-full p-3 border rounded-lg ${
                    !isEditing 
                      ? 'bg-gray-50 text-gray-500 border-gray-200' 
                      : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  }`}
                  placeholder="Any additional information or payment preferences"
                />
              </div>
              
              {isEditing && (
                <div className="mt-8 flex items-center justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 flex items-center"
                  >
                    {isLoading ? (
                      <>
                        <span className="animate-spin h-4 w-4 mr-2 border-t-2 border-b-2 border-white rounded-full"></span>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
        
        {/* Payment History Section */}
        <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50 flex justify-between items-center">
            <div className="flex items-center">
              <BanknotesIcon className="h-5 w-5 text-gray-500 mr-2" />
              <h2 className="font-semibold text-lg text-gray-800">Payment History</h2>
            </div>
            <div className="text-sm text-blue-600">
              Displaying {paymentHistory.length} most recent transactions
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-200">
                {paymentHistory.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                      No payment history found
                    </td>
                  </tr>
                ) : (
                  paymentHistory.map(payment => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(payment.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{payment.reference}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          ${payment.amount.toFixed(2)} {payment.currency}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                          ${payment.status === 'paid' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'}`}
                        >
                          {payment.status === 'paid' ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        <div className="mt-8 bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
          <h3 className="font-semibold flex items-center">
            <CreditCardIcon className="h-5 w-5 mr-2" />
            Payment Information
          </h3>
          <ul className="mt-2 space-y-2 pl-7 list-disc">
            <li>We process payments at the end of each month</li>
            <li>Ensure your Binance account information is correct to avoid payment delays</li>
            <li>Minimum payout threshold is $50</li>
            <li>We support payments in USDT, BTC, and other major cryptocurrencies</li>
            <li>Contact support@fastyads.com if you have any questions about payments</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 