'use client';

import { useState, useEffect } from 'react';
import { getUserFromLocalStorage } from '@/lib/localStorage';
import { 
  BanknotesIcon, 
  ExclamationCircleIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Mock payment history data
const mockPaymentHistory = [
  {
    id: 'payment-1',
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    date: '2023-10-15',
    amount: 250.00,
    status: 'paid',
    reference: 'OCT2023-PAYOUT',
    currency: 'USDT',
    notes: 'Regular monthly payment'
  },
  {
    id: 'payment-2',
    userId: 'user-2',
    userName: 'Jane Smith',
    userEmail: 'jane.smith@example.com',
    date: '2023-09-15',
    amount: 175.50,
    status: 'paid',
    reference: 'SEP2023-PAYOUT',
    currency: 'USDT',
    notes: 'Regular monthly payment'
  },
  {
    id: 'payment-3',
    userId: 'user-3',
    userName: 'Robert Johnson',
    userEmail: 'robert.johnson@example.com',
    date: '2023-11-15',
    amount: 320.25,
    status: 'pending',
    reference: 'NOV2023-PAYOUT',
    currency: 'USDT',
    notes: 'Pending verification'
  },
  {
    id: 'payment-4',
    userId: 'user-4',
    userName: 'Emily Williams',
    userEmail: 'emily.williams@example.com',
    date: '2023-11-15',
    amount: 190.80,
    status: 'pending',
    reference: 'NOV2023-PAYOUT',
    currency: 'USDT',
    notes: 'Waiting for invoice'
  },
  {
    id: 'payment-5',
    userId: 'user-5',
    userName: 'Michael Brown',
    userEmail: 'michael.brown@example.com',
    date: '2023-11-15',
    amount: 75.20,
    status: 'failed',
    reference: 'NOV2023-PAYOUT',
    currency: 'USDT',
    notes: 'Insufficient account details'
  },
  {
    id: 'payment-6',
    userId: 'user-1',
    userName: 'John Doe',
    userEmail: 'john.doe@example.com',
    date: '2023-09-15',
    amount: 175.50,
    status: 'paid',
    reference: 'SEP2023-PAYOUT',
    currency: 'USDT',
    notes: 'Regular monthly payment'
  },
  {
    id: 'payment-7',
    userId: 'user-2',
    userName: 'Jane Smith',
    userEmail: 'jane.smith@example.com',
    date: '2023-08-15',
    amount: 145.75,
    status: 'paid',
    reference: 'AUG2023-PAYOUT',
    currency: 'USDT',
    notes: 'Regular monthly payment'
  }
];

export default function AdminPaymentHistoryPage() {
  const [admin, setAdmin] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filter, setFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentHistory, setPaymentHistory] = useState(mockPaymentHistory);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Load admin data
  useEffect(() => {
    const userData = getUserFromLocalStorage();
    if (userData && userData.role === 'admin') {
      setAdmin(userData);
    }
  }, []);
  
  // Process payments function
  const processPayment = (paymentId: string, newStatus: 'paid' | 'pending' | 'failed') => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setPaymentHistory(prev => 
        prev.map(payment => 
          payment.id === paymentId 
            ? { ...payment, status: newStatus } 
            : payment
        )
      );
      
      setSuccessMessage(`Payment ${paymentId} has been marked as ${newStatus}.`);
      setIsLoading(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 700);
  };
  
  // Handle update payment notes
  const handleUpdateNotes = (paymentId: string, notes: string) => {
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setPaymentHistory(prev => 
        prev.map(payment => 
          payment.id === paymentId 
            ? { ...payment, notes } 
            : payment
        )
      );
      
      setSuccessMessage(`Payment notes updated successfully.`);
      setIsLoading(false);
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 700);
  };
  
  // Filter payments based on status, date, and search query
  const filteredPayments = paymentHistory.filter(payment => {
    const matchesStatusFilter = filter === 'all' || payment.status === filter;
    
    // Handle date filtering
    let matchesDateFilter = true;
    const currentDate = new Date();
    const paymentDate = new Date(payment.date);
    
    if (dateFilter === 'current-month') {
      matchesDateFilter = 
        paymentDate.getMonth() === currentDate.getMonth() && 
        paymentDate.getFullYear() === currentDate.getFullYear();
    } else if (dateFilter === 'last-month') {
      const lastMonth = new Date(currentDate);
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      matchesDateFilter = 
        paymentDate.getMonth() === lastMonth.getMonth() && 
        paymentDate.getFullYear() === lastMonth.getFullYear();
    } else if (dateFilter === 'last-3-months') {
      const threeMonthsAgo = new Date(currentDate);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      matchesDateFilter = paymentDate >= threeMonthsAgo;
    }
    
    const matchesSearch = 
      payment.userName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      payment.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.reference.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesStatusFilter && matchesDateFilter && matchesSearch;
  });
  
  // Calculate totals
  const totalPaid = filteredPayments
    .filter(payment => payment.status === 'paid')
    .reduce((total, payment) => total + payment.amount, 0);
    
  const totalPending = filteredPayments
    .filter(payment => payment.status === 'pending')
    .reduce((total, payment) => total + payment.amount, 0);
    
  const totalFailed = filteredPayments
    .filter(payment => payment.status === 'failed')
    .reduce((total, payment) => total + payment.amount, 0);
  
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
        <h1 className="text-2xl font-bold mb-2 text-gray-800">Payment History Management</h1>
        <p className="mb-6 text-gray-600">View and manage user payment transactions</p>
        
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
            <CheckIcon className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
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
            <div className="p-4 bg-green-50 border-b border-green-100">
              <h3 className="font-medium text-green-700 flex items-center">
                <CheckIcon className="h-5 w-5 mr-2" />
                Total Paid
              </h3>
            </div>
            <div className="p-4">
              <p className="text-2xl font-bold text-gray-800">${totalPaid.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">{filteredPayments.filter(p => p.status === 'paid').length} transactions</p>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
            <div className="p-4 bg-yellow-50 border-b border-yellow-100">
              <h3 className="font-medium text-yellow-700 flex items-center">
                <ArrowPathIcon className="h-5 w-5 mr-2" />
                Pending Payments
              </h3>
            </div>
            <div className="p-4">
              <p className="text-2xl font-bold text-gray-800">${totalPending.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">{filteredPayments.filter(p => p.status === 'pending').length} transactions</p>
            </div>
          </div>
          
          <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-100">
            <div className="p-4 bg-red-50 border-b border-red-100">
              <h3 className="font-medium text-red-700 flex items-center">
                <XMarkIcon className="h-5 w-5 mr-2" />
                Failed Payments
              </h3>
            </div>
            <div className="p-4">
              <p className="text-2xl font-bold text-gray-800">${totalFailed.toFixed(2)}</p>
              <p className="text-sm text-gray-500 mt-1">{filteredPayments.filter(p => p.status === 'failed').length} transactions</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden mb-8">
          {/* Actions Bar */}
          <div className="p-4 bg-gray-50 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search users or references..."
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
                  <option value="all">All Status</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
                <ChevronDownIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
              
              <div className="relative">
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                >
                  <option value="all">All Time</option>
                  <option value="current-month">Current Month</option>
                  <option value="last-month">Last Month</option>
                  <option value="last-3-months">Last 3 Months</option>
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
                    Date / Reference
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              
              <tbody className="divide-y divide-gray-200">
                {filteredPayments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      No payments found matching your criteria
                    </td>
                  </tr>
                ) : (
                  filteredPayments.map(payment => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="font-medium text-gray-900">{payment.userName}</div>
                          <div className="text-sm text-gray-500">{payment.userEmail}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <div className="text-sm text-gray-900">
                            {new Date(payment.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-500">{payment.reference}</div>
                        </div>
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
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'}`}
                        >
                          {payment.status === 'paid' 
                            ? 'Paid' 
                            : payment.status === 'pending'
                            ? 'Pending'
                            : 'Failed'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-[200px] truncate" title={payment.notes}>
                          {payment.notes || 'No notes'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          {payment.status === 'pending' && (
                            <>
                              <button 
                                onClick={() => processPayment(payment.id, 'paid')}
                                className="text-green-600 hover:text-green-800"
                                title="Mark as Paid"
                                disabled={isLoading}
                              >
                                <CheckIcon className="h-5 w-5" />
                              </button>
                              <button 
                                onClick={() => processPayment(payment.id, 'failed')}
                                className="text-red-600 hover:text-red-800"
                                title="Mark as Failed"
                                disabled={isLoading}
                              >
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            </>
                          )}
                          {payment.status === 'failed' && (
                            <button 
                              onClick={() => processPayment(payment.id, 'pending')}
                              className="text-yellow-600 hover:text-yellow-800"
                              title="Retry Payment"
                              disabled={isLoading}
                            >
                              <ArrowPathIcon className="h-5 w-5" />
                            </button>
                          )}
                          <button 
                            onClick={() => {
                              setSelectedPayment(payment);
                              setIsEditing(true);
                            }}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit Notes"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-3 flex items-center justify-between border-t">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{filteredPayments.length}</span> of <span className="font-medium">{paymentHistory.length}</span> payments
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
        
        {/* Edit Notes Modal */}
        {isEditing && selectedPayment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Edit Payment Notes</h3>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">Payment Reference</p>
                <p className="font-medium">{selectedPayment.reference}</p>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-gray-500 mb-1">User</p>
                <p className="font-medium">{selectedPayment.userName}</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={selectedPayment.notes}
                  onChange={(e) => setSelectedPayment({...selectedPayment, notes: e.target.value})}
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  placeholder="Add notes about this payment"
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateNotes(selectedPayment.id, selectedPayment.notes)}
                  disabled={isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  {isLoading ? 'Saving...' : 'Save Notes'}
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Help Section */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 text-sm text-blue-800">
          <h3 className="font-semibold text-lg mb-2 flex items-center">
            <BanknotesIcon className="h-5 w-5 mr-2" />
            Payment Management
          </h3>
          <ul className="mt-2 space-y-2 pl-7 list-disc">
            <li>Payments are processed at the end of each month</li>
            <li>Mark payments as paid after confirming the transaction</li>
            <li>Add detailed notes to help track payment issues or special cases</li>
            <li>For bulk payments, use the export feature to generate a CSV file</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 