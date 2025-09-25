'use client';

import { useState, useEffect } from 'react';
import { getUserFromLocalStorage } from '@/lib/localStorage';
import { 
  GlobeAltIcon, 
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  EyeIcon,
  ChevronDownIcon,
  BanknotesIcon,
  PlusIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// Mock user payment data
const mockUserPayments = [
  {
    id: 'user-1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    binanceUsername: 'johndoe_binance',
    accountUrl: 'https://www.binance.com/en/profile/johndoe_binance',
    walletAddress: '0x1234abcd...5678efgh',
    status: 'active',
    totalRevenue: 891.25,
    paidAmount: 746.00,
    dueAmount: 145.25,
    paymentHistory: [
      {
        id: 'payment-1',
        date: '2023-10-15',
        amount: 250.00,
        status: 'paid',
        reference: 'OCT2023-PAYOUT',
        notes: 'Regular monthly payment'
      },
      {
        id: 'payment-2',
        date: '2023-09-15',
        amount: 175.50,
        status: 'paid',
        reference: 'SEP2023-PAYOUT',
        notes: 'Regular monthly payment'
      },
      {
        id: 'payment-3',
        date: '2023-11-15',
        amount: 145.25,
        status: 'pending',
        reference: 'NOV2023-PAYOUT',
        notes: 'Pending verification'
      }
    ]
  },
  {
    id: 'user-2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    binanceUsername: 'janesmith22',
    accountUrl: 'https://www.binance.com/en/profile/janesmith22',
    walletAddress: '0x5678efgh...1234abcd',
    status: 'active',
    totalRevenue: 623.80,
    paidAmount: 532.00,
    dueAmount: 91.80,
    paymentHistory: [
      {
        id: 'payment-4',
        date: '2023-10-15',
        amount: 212.50,
        status: 'paid',
        reference: 'OCT2023-PAYOUT',
        notes: 'Regular monthly payment'
      },
      {
        id: 'payment-5',
        date: '2023-09-15',
        amount: 145.75,
        status: 'paid',
        reference: 'SEP2023-PAYOUT',
        notes: 'Regular monthly payment'
      },
      {
        id: 'payment-6',
        date: '2023-11-15',
        amount: 91.80,
        status: 'pending',
        reference: 'NOV2023-PAYOUT',
        notes: 'Pending verification'
      }
    ]
  },
  {
    id: 'user-3',
    name: 'Robert Johnson',
    email: 'robert.johnson@example.com',
    binanceUsername: 'robertj_crypto',
    accountUrl: 'https://www.binance.com/en/profile/robertj_crypto',
    walletAddress: '0xabcd1234...efgh5678',
    status: 'active',
    totalRevenue: 375.25,
    paidAmount: 375.25,
    dueAmount: 0,
    paymentHistory: [
      {
        id: 'payment-7',
        date: '2023-10-15',
        amount: 178.50,
        status: 'paid',
        reference: 'OCT2023-PAYOUT',
        notes: 'Regular monthly payment'
      },
      {
        id: 'payment-8',
        date: '2023-09-15',
        amount: 196.75,
        status: 'paid',
        reference: 'SEP2023-PAYOUT',
        notes: 'Regular monthly payment'
      }
    ]
  },
  {
    id: 'user-4',
    name: 'Emily Williams',
    email: 'emily.williams@example.com',
    binanceUsername: 'emilyw_binance',
    accountUrl: 'https://www.binance.com/en/profile/emilyw_binance',
    walletAddress: '',
    status: 'pending',
    totalRevenue: 120.30,
    paidAmount: 0,
    dueAmount: 120.30,
    paymentHistory: [
      {
        id: 'payment-9',
        date: '2023-11-15',
        amount: 120.30,
        status: 'pending',
        reference: 'NOV2023-PAYOUT',
        notes: 'Waiting for account setup completion'
      }
    ]
  },
  {
    id: 'user-5',
    name: 'Michael Brown',
    email: 'michael.brown@example.com',
    binanceUsername: '',
    accountUrl: '',
    walletAddress: '',
    status: 'incomplete',
    totalRevenue: 85.60,
    paidAmount: 0,
    dueAmount: 85.60,
    paymentHistory: [
      {
        id: 'payment-10',
        date: '2023-11-15',
        amount: 85.60,
        status: 'failed',
        reference: 'NOV2023-PAYOUT',
        notes: 'Cannot process payment - incomplete account information'
      }
    ]
  },
  {
    id: 'user-6',
    name: 'Sarah Miller',
    email: 'sarah.miller@example.com',
    binanceUsername: 'sarahm_crypto',
    accountUrl: 'https://www.binance.com/en/profile/sarahm_crypto',
    walletAddress: '0xefgh5678...abcd1234',
    status: 'active',
    totalRevenue: 468.90,
    paidAmount: 468.90,
    dueAmount: 0,
    paymentHistory: [
      {
        id: 'payment-11',
        date: '2023-10-15',
        amount: 258.40,
        status: 'paid',
        reference: 'OCT2023-PAYOUT',
        notes: 'Regular monthly payment'
      },
      {
        id: 'payment-12',
        date: '2023-09-15',
        amount: 210.50,
        status: 'paid',
        reference: 'SEP2023-PAYOUT',
        notes: 'Regular monthly payment'
      }
    ]
  },
  {
    id: 'user-7',
    name: 'David Garcia',
    email: 'david.garcia@example.com',
    binanceUsername: 'davidg_trader',
    accountUrl: 'https://www.binance.com/en/profile/davidg_trader',
    walletAddress: '0x9876zyxw...5432vutr',
    status: 'active',
    totalRevenue: 542.75,
    paidAmount: 320.20,
    dueAmount: 222.55,
    paymentHistory: [
      {
        id: 'payment-13',
        date: '2023-10-15',
        amount: 185.40,
        status: 'paid',
        reference: 'OCT2023-PAYOUT',
        notes: 'Regular monthly payment'
      },
      {
        id: 'payment-14',
        date: '2023-09-15',
        amount: 134.80,
        status: 'paid',
        reference: 'SEP2023-PAYOUT',
        notes: 'Regular monthly payment'
      },
      {
        id: 'payment-15',
        date: '2023-11-15',
        amount: 222.55,
        status: 'pending',
        reference: 'NOV2023-PAYOUT',
        notes: 'Pending verification'
      }
    ]
  }
];

export default function AdminPaymentPage() {
  const [admin, setAdmin] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [userPayments, setUserPayments] = useState(mockUserPayments);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPayment, setNewPayment] = useState({
    amount: '',
    reference: '',
    notes: '',
    status: 'pending'
  });
  
  // Load admin data
  useEffect(() => {
    const userData = getUserFromLocalStorage();
    if (userData && userData.role === 'admin') {
      setAdmin(userData);
    }
  }, []);
  
  // Filter users based on status and search query
  const filteredUsers = userPayments.filter(user => {
    const matchesFilter = filter === 'all' || user.status === filter;
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.binanceUsername && user.binanceUsername.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });
  
  // Handle toggling expanded row
  const toggleExpandUser = (userId: string) => {
    if (expandedUser === userId) {
      setExpandedUser(null);
    } else {
      setExpandedUser(userId);
    }
  };
  
  // Handle opening payment modal
  const openPaymentModal = (user: any) => {
    setSelectedUser(user);
    setNewPayment({
      amount: '',
      reference: `PAYMENT-${new Date().toISOString().slice(0, 10)}`,
      notes: '',
      status: 'pending'
    });
    setPaymentModalOpen(true);
  };
  
  // Handle adding new payment
  const handleAddPayment = () => {
    if (!newPayment.amount || parseFloat(newPayment.amount) <= 0) {
      setErrorMessage('Please enter a valid payment amount.');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const amount = parseFloat(newPayment.amount);
      
      // Create new payment
      const newPaymentEntry = {
        id: `payment-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        amount,
        status: newPayment.status,
        reference: newPayment.reference,
        notes: newPayment.notes
      };
      
      // Update user payments
      const updatedUsers = userPayments.map(user => {
        if (user.id === selectedUser.id) {
          // Update total amounts
          const paidAmount = newPayment.status === 'paid' 
            ? user.paidAmount + amount 
            : user.paidAmount;
            
          const dueAmount = newPayment.status === 'paid' 
            ? user.dueAmount 
            : user.dueAmount + amount;
            
          return {
            ...user,
            totalRevenue: user.totalRevenue + amount,
            paidAmount,
            dueAmount,
            paymentHistory: [newPaymentEntry, ...user.paymentHistory]
          };
        }
        return user;
      });
      
      setUserPayments(updatedUsers);
      setSuccessMessage(`Payment added successfully for ${selectedUser.name}.`);
      setPaymentModalOpen(false);
      setIsLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 1000);
  };
  
  if (!admin) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div>
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-2xl font-bold text-gray-800">User Account Information</h1>
          {/* <a
            href="/dashboard/admin/payment/history"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <BanknotesIcon className="h-4 w-4 mr-2" />
            Payment History
          </a> */}
        </div>
        <p className="mb-6 text-gray-600">View and manage user Binance account details and payment history</p>
        
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
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          {/* Actions Bar */}
          <div className="p-4 bg-gray-50 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              
              <div className="relative">
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Users</option>
                  <option value="active">Complete Setup</option>
                  <option value="pending">Pending Setup</option>
                  <option value="incomplete">Missing Info</option>
                </select>
                <ChevronDownIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
          
          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Binance Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Account URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Revenue
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      No users found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <>
                      <tr key={user.id} className={`hover:bg-gray-50 ${expandedUser === user.id ? 'bg-blue-50' : ''}`}>
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {user.binanceUsername ? (
                            <div className="text-gray-900">{user.binanceUsername}</div>
                          ) : (
                            <span className="text-red-500 text-sm">Not provided</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {user.accountUrl ? (
                            <div>
                              <a 
                                href={user.accountUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 hover:underline"
                              >
                                View Profile
                              </a>
                            </div>
                          ) : (
                            <span className="text-red-500 text-sm">Not provided</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <div className="text-md font-bold text-gray-900">${user.totalRevenue.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">
                              <span className="text-green-600">${user.paidAmount.toFixed(2)} paid</span>
                              {user.dueAmount > 0 && (
                                <span className="text-orange-600 ml-1">• ${user.dueAmount.toFixed(2)} due</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                            ${user.status === 'active' ? 'bg-green-100 text-green-800' : 
                            user.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}
                          >
                            {user.status === 'active' ? 'Complete' : 
                            user.status === 'pending' ? 'Pending' : 
                            'Incomplete'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => toggleExpandUser(user.id)}
                              className={`text-blue-600 hover:text-blue-800 flex items-center px-2 py-1 border border-blue-200 rounded-md text-sm ${expandedUser === user.id ? 'bg-blue-50' : ''}`}
                            >
                              <BanknotesIcon className="h-4 w-4 mr-1" />
                              Payment History
                              {/* {expandedUser === user.id ? 
                                <ChevronUpIcon className="h-4 w-4 ml-1" /> : 
                                <ChevronDownIcon className="h-4 w-4 ml-1" />
                              } */}
                            </button>
                            {/* <button 
                              onClick={() => openPaymentModal(user)}
                              className="text-green-600 hover:text-green-800 flex items-center"
                              title="Add Payment"
                              disabled={user.status === 'incomplete'}
                            >
                              <PlusIcon className="h-5 w-5" />
                            </button> */}
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Payment History Row */}
                      {expandedUser === user.id && (
                        <tr>
                          <td colSpan={6} className="bg-gray-50 px-6 py-3">
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                              <div className="bg-gray-100 px-4 py-2 flex justify-between items-center">
                                <h3 className="font-medium text-gray-700 flex items-center">
                                  <BanknotesIcon className="h-5 w-5 mr-2" />
                                  Payment History
                                </h3>
                                <button
                                  onClick={() => openPaymentModal(user)}
                                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                                  disabled={user.status === 'incomplete'}
                                >
                                  <PlusIcon className="h-4 w-4 mr-1" />
                                  Add Payment
                                </button>
                              </div>
                              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                                <table className="w-full">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {user.paymentHistory.length === 0 ? (
                                      <tr>
                                        <td colSpan={5} className="px-4 py-4 text-center text-gray-500">
                                          No payment history available
                                        </td>
                                      </tr>
                                    ) : (
                                      user.paymentHistory.map(payment => (
                                        <tr key={payment.id} className="hover:bg-gray-50">
                                          <td className="px-4 py-3 text-sm text-gray-900">
                                            {new Date(payment.date).toLocaleDateString('en-US', {
                                              year: 'numeric',
                                              month: 'short',
                                              day: 'numeric'
                                            })}
                                          </td>
                                          <td className="px-4 py-3 text-sm text-gray-900">{payment.reference}</td>
                                          <td className="px-4 py-3 text-sm font-medium text-gray-900">${payment.amount.toFixed(2)}</td>
                                          <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium 
                                              ${payment.status === 'paid' ? 'bg-green-100 text-green-800' : 
                                              payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                                              'bg-red-100 text-red-800'}`}
                                            >
                                              {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                            </span>
                                          </td>
                                          <td className="px-4 py-3 text-sm text-gray-500">{payment.notes || '-'}</td>
                                        </tr>
                                      ))
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-3 flex items-center justify-between border-t">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{filteredUsers.length}</span> of <span className="font-medium">{userPayments.length}</span> users
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50" disabled>
                Next
              </button>
            </div>
          </div>
        </div>
        
        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 text-sm text-blue-800">
          <h3 className="font-semibold text-lg mb-2 flex items-center">
            <GlobeAltIcon className="h-5 w-5 mr-2" />
            Account Information
          </h3>
          <ul className="mt-2 space-y-2 pl-7 list-disc">
            <li>Users must provide complete Binance account information to receive payments</li>
            <li>All account information is stored securely and access is restricted</li>
            <li>For urgent payment inquiries, contact the finance team at finance@fastyads.com</li>
          </ul>
        </div>
        
        {/* Add Payment Modal */}
        {paymentModalOpen && selectedUser && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2 text-blue-600" />
                Add Payment for {selectedUser.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newPayment.amount}
                    onChange={(e) => setNewPayment({...newPayment, amount: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter payment amount"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reference
                  </label>
                  <input
                    type="text"
                    value={newPayment.reference}
                    onChange={(e) => setNewPayment({...newPayment, reference: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Payment reference"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={newPayment.status}
                    onChange={(e) => setNewPayment({...newPayment, status: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={newPayment.notes}
                    onChange={(e) => setNewPayment({...newPayment, notes: e.target.value})}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Add payment notes"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setPaymentModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPayment}
                  disabled={isLoading || !newPayment.amount}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                >
                  {isLoading ? (
                    <>
                      <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Payment
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 