'use client';

import React, { useState, useEffect } from 'react';
import { getUserFromLocalStorage } from '@/lib/localStorage';
import { LinkIcon, MagnifyingGlassIcon, PlusIcon, XMarkIcon, CursorArrowRaysIcon, BanknotesIcon, UserIcon, UsersIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { createLinkByAdmin, getAllLinks, updateLinkStatus, getAllUsers, getUserLinks, updateLink, deleteLink } from '@/lib/linksService';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X as XIcon } from "lucide-react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UserWithLinks } from '@/lib/linksService';

interface Link {
  id: string;
  name: string;
  url: string;
  userId: string;  // This is a string ID
  userName: string;
  userEmail?: string;
  status: 'pending' | 'approved' | 'rejected';
  impressions: number;
  clicks: number;
  ctr: number;
  cpm: number;
  revenue: number;
  createdAt: string;
}

interface FormData {
  userId: string;
  name: string;
  url: string;
  impressions: string;
  clicks: string;
  cpm: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface FormErrors {
  userId?: string;
  name?: string;
  url?: string;
  impressions?: string;
  clicks?: string;
  cpm?: string;
}

export default function ManageLinksPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<{id: string, name: string, role: string} | null>(null);
  const [users, setUsers] = useState<UserWithLinks[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editLinkId, setEditLinkId] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [linkToDelete, setLinkToDelete] = useState<Link | null>(null);
  const [formData, setFormData] = useState<FormData>({
    userId: '',
    name: '',
    url: '',
    impressions: '0',
    clicks: '0',
    cpm: '0',
    status: 'approved'
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [expandedUsers, setExpandedUsers] = useState<{[key: string]: boolean}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [userLinksLoading, setUserLinksLoading] = useState<{[key: string]: boolean}>({});

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setApiError(null);
      
      try {
        // Get current user from localStorage
        const user = getUserFromLocalStorage();
        if (!user || !user.id || user.role !== 'admin') {
          throw new Error('Unauthorized. Admin access required.');
        }
        
        setUserData(user);
        
        // Fetch all users with their link counts
        const allUsers = await getAllUsers(user.id);
        setUsers(allUsers);
      } catch (error) {
        console.error('Error fetching data:', error);
        setApiError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Extract unique users from links
  const extractUsersFromLinks = (links: Link[]): UserWithLinks[] => {
    const userMap = new Map<string, UserWithLinks>();
    
    links.forEach(link => {
      if (!userMap.has(link.userId)) {
        userMap.set(link.userId, {
          _id: link.userId,
          name: link.userName || 'Unknown User',
          email: link.userEmail || `user-${link.userId}@example.com`,
          username: '',  // Default value
          role: 'user',  // Default role
          createdAt: new Date().toISOString(), // Default date
          linksCount: 0,
          activeLinksCount: 0,
          totalImpressions: 0,
          totalClicks: 0,
          totalRevenue: 0,
        });
      }
    });
    
    // Count links per user
    links.forEach(link => {
      const user = userMap.get(link.userId);
      if (user) {
        user.linksCount = (user.linksCount || 0) + 1;
        user.activeLinksCount = (user.activeLinksCount || 0) + 1;
        user.totalImpressions = (user.totalImpressions || 0) + link.impressions;
        user.totalClicks = (user.totalClicks || 0) + link.clicks;
        user.totalRevenue = (user.totalRevenue || 0) + link.revenue;
      }
    });
    
    return Array.from(userMap.values());
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleStatusFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setStatusFilter(e.target.value);
  };

  // Open edit modal with prefilled data
  const openEditModal = (link: Link) => {
    setFormData({
      userId: link.userId,
      name: link.name,
      url: link.url,
      impressions: link.impressions.toString(),
      clicks: link.clicks.toString(),
      cpm: link.cpm.toString(),
      status: link.status
    });
    setFormErrors({});
    setIsEditMode(true);
    setEditLinkId(link.id);
    setIsModalOpen(true);
  };

  // Open create modal
  const openCreateModal = (prefilledUserId?: string) => {
    setFormData({
      userId: prefilledUserId || '',
      name: '',
      url: '',
      impressions: '0',
      clicks: '0',
      cpm: '0',
      status: 'approved'
    });
    setFormErrors({});
    setIsEditMode(false);
    setEditLinkId(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Open delete confirmation modal
  const openDeleteModal = (link: Link) => {
    setLinkToDelete(link);
    setIsDeleteModalOpen(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setLinkToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Handle delete link
  const handleDeleteLink = async () => {
    if (!userData?.id || !linkToDelete) return;
    
    try {
      setIsSubmitting(true);
      setApiError(null);
      
      const success = await deleteLink(linkToDelete.id, userData.id);
      
      if (success) {
        // Remove from local state immediately to update UI
        setLinks(prevLinks => prevLinks.filter(link => link.id !== linkToDelete.id));
        
        // Update user's link count in the state
        setUsers(prev => prev.map(user => {
          if (user._id === linkToDelete.userId) {
            const isActive = 
              linkToDelete.status === 'approved' || linkToDelete.status === 'pending';
            
            return {
              ...user,
              linksCount: Math.max(0, user.linksCount - 1),
              activeLinksCount: isActive ? Math.max(0, user.activeLinksCount - 1) : user.activeLinksCount,
              totalImpressions: Math.max(0, user.totalImpressions - linkToDelete.impressions),
              totalClicks: Math.max(0, user.totalClicks - linkToDelete.clicks),
              totalRevenue: Math.max(0, user.totalRevenue - linkToDelete.revenue)
            };
          }
          return user;
        }));
        
        // Close modal
        closeDeleteModal();
      }
    } catch (error) {
      console.error('Error deleting link:', error);
      setApiError(error instanceof Error ? error.message : 'Failed to delete link');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (formErrors[name as keyof FormErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    if (!formData.userId) {
      errors.userId = 'Please select a user';
    }
    
    if (!formData.name.trim()) {
      errors.name = 'Link name is required';
    }
    
    if (!formData.url.trim()) {
      errors.url = 'URL is required';
    } else if (!/^https?:\/\//.test(formData.url)) {
      errors.url = 'URL must start with http:// or https://';
    }
    
    const impressions = parseInt(formData.impressions);
    if (isNaN(impressions) || impressions < 0) {
      errors.impressions = 'Impressions must be a positive number';
    }
    
    const clicks = parseInt(formData.clicks);
    if (isNaN(clicks) || clicks < 0) {
      errors.clicks = 'Clicks must be a positive number';
    }
    
    const cpm = parseFloat(formData.cpm);
    if (isNaN(cpm) || cpm < 0) {
      errors.cpm = 'CPM must be a positive number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    if (isEditMode) {
      handleUpdateLink();
    } else {
      handleCreateLink();
    }
  };

  const handleUpdateLink = async () => {
    if (!userData?.id || !editLinkId) return;
    
    try {
      setIsSubmitting(true);
      setApiError(null);
      
      const updatedLinkData = await updateLink(editLinkId, userData.id, {
        userId: formData.userId,
        name: formData.name,
        url: formData.url,
        status: formData.status,
        impressions: parseInt(formData.impressions),
        clicks: parseInt(formData.clicks),
        cpm: parseFloat(formData.cpm),
      });
      console.log("link before => ",links)
      if (updatedLinkData) {
        // Create properly formatted updated link
        const updatedLink = {
          id: updatedLinkData.id || editLinkId,
          name: updatedLinkData.name,
          url: updatedLinkData.url,
          userId: updatedLinkData.userId,
          userName: updatedLinkData.userName,
          userEmail: updatedLinkData.userEmail,
          status: updatedLinkData.status,
          impressions: updatedLinkData.impressions,
          clicks: updatedLinkData.clicks,
          ctr: updatedLinkData.ctr,
          cpm: updatedLinkData.cpm,
          revenue: updatedLinkData.revenue,
          createdAt: updatedLinkData.createdAt
        };
        // Update in local state using proper structure
        setLinks(prevLinks => 
          prevLinks.map(link => link.id === editLinkId ? updatedLink : link)
        );
        console.log("link after => ",links)
        console.log("updatedLinkData.link  after => ",updatedLink )
        
        // Update user metrics in state if needed
        // This is more complex as we need to calculate the difference
        const oldLink = links.find(link => link.id === editLinkId);
        if (oldLink) {
          setUsers(prev => prev.map(user => {
            if (user._id === formData.userId) {
              // Calculate differences
              const impressionsDiff = parseInt(formData.impressions) - oldLink.impressions;
              const clicksDiff = parseInt(formData.clicks) - oldLink.clicks;
              const oldRevenue = oldLink.revenue;
              const newRevenue = (parseInt(formData.impressions) / 1000) * parseFloat(formData.cpm);
              const revenueDiff = newRevenue - oldRevenue;
              
              // Was active before, is active now - no change in activeLinksCount
              // Was active before, not active now - decrease activeLinksCount
              // Wasn't active before, is active now - increase activeLinksCount
              const wasActive = oldLink.status === 'approved' || oldLink.status === 'pending';
              const isActive = formData.status === 'approved' || formData.status === 'pending';
              let activeCountDiff = 0;
              
              if (wasActive && !isActive) {
                activeCountDiff = -1;
              } else if (!wasActive && isActive) {
                activeCountDiff = 1;
              }
              
              return {
                ...user,
                activeLinksCount: user.activeLinksCount + activeCountDiff,
                totalImpressions: user.totalImpressions + impressionsDiff,
                totalClicks: user.totalClicks + clicksDiff,
                totalRevenue: user.totalRevenue + revenueDiff
              };
            }
            return user;
          }));
        }
        
        // Close modal
        closeModal();
      }
    } catch (error) {
      console.error('Error updating link:', error);
      setApiError(error instanceof Error ? error.message : 'Failed to update link');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateLink = async () => {
    if (!validateForm()) {
      return;
    }

    // Check if user has reached the limit of 5 active links
    const selectedUser = users.find(user => user._id === formData.userId);
    if (selectedUser && selectedUser.activeLinksCount >= 5) {
      setFormErrors(prev => ({ 
        ...prev, 
        userId: 'This user has reached the maximum limit of 5 active links' 
      }));
      return;
    }
    
    // Create using the API
    if (userData?.id) {
      try {
        setIsSubmitting(true);
        setApiError(null);
        
        const createdLink = await createLinkByAdmin(userData.id, {
          userId: formData.userId,
          name: formData.name,
          url: formData.url,
          status: formData.status,
          impressions: parseInt(formData.impressions),
          clicks: parseInt(formData.clicks),
          cpm: parseFloat(formData.cpm),
        });
        
        if (createdLink) {
          // Add to local state
          setLinks(prev => [createdLink, ...prev]);
          
          // Update user's active links count in the state
          setUsers(prev => prev.map(user => {
            if (user._id === formData.userId) {
              const isActive = 
                formData.status === 'approved' || formData.status === 'pending';
              
              return {
                ...user,
                linksCount: user.linksCount + 1,
                activeLinksCount: isActive ? user.activeLinksCount + 1 : user.activeLinksCount,
                totalImpressions: user.totalImpressions + parseInt(formData.impressions),
                totalClicks: user.totalClicks + parseInt(formData.clicks),
                totalRevenue: user.totalRevenue + ((parseInt(formData.impressions) / 1000) * parseFloat(formData.cpm))
              };
            }
            return user;
          }));
          
          // Close modal
          closeModal();
        }
      } catch (error) {
        console.error('Error creating link:', error);
        setApiError(error instanceof Error ? error.message : 'Failed to create link');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Get links for specific user
  const getUserLinksFromState = (userId: string) => {
    return links.filter(link => link.userId === userId);
  };

  // Toggle user expansion and load user links if needed
  const toggleUserExpanded = async (userId: string) => {
    // If we're already expanded, just collapse
    if (expandedUsers[userId]) {
      setExpandedUsers(prev => ({
        ...prev,
        [userId]: false
      }));
      return;
    }
    
    // First, expand immediately to show loading state
    setExpandedUsers(prev => ({
      ...prev,
      [userId]: true
    }));
    
    // Then load the user's links
    await loadUserLinks(userId);
  };
  
  // Load links for a specific user
  const loadUserLinks = async (userId: string) => {
    if (!userData?.id) return;
    
    // Check if we already have links for this user
    const existingLinks = links.filter(link => link.userId === userId);
    if (existingLinks.length > 0) {
      console.log(`Using ${existingLinks.length} cached links for user ${userId}`);
      return; // Already have links for this user
    }
    
    // Set loading state for this user
    setUserLinksLoading(prev => ({
      ...prev,
      [userId]: true
    }));
    
    try {
      console.log(`Fetching links for user ${userId}`);
      const userLinks = await getUserLinks(userId);
      console.log(`Fetched ${userLinks.length} links for user ${userId}`);
      
      // Add the links to the state
      setLinks(prev => {
        // Remove any existing links for this user (shouldn't be any)
        const filteredLinks = prev.filter(link => link.userId !== userId);
        // Add new links
        return [...filteredLinks, ...userLinks];
      });
    } catch (error) {
      console.error(`Error loading links for user ${userId}:`, error);
      setApiError(`Failed to load links for user`);
    } finally {
      setUserLinksLoading(prev => ({
        ...prev,
        [userId]: false
      }));
    }
  };

  // Handle status update
  const handleStatusUpdate = async (linkId: string, status: 'approved' | 'rejected') => {
    if (!userData?.id) return;
    
    try {
      const success = await updateLinkStatus(linkId, status, userData.id);
      
      if (success) {
        setLinks(prev => prev.map(link => 
          link.id === linkId ? { ...link, status } : link
        ));
      }
    } catch (error) {
      console.error(`Error updating link status:`, error);
      setApiError(error instanceof Error ? error.message : 'Failed to update link status');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-1">Manage Ad Links</h1>
          <p className="text-gray-600">Review and manage all user ad links</p>
        </div>
        <button
          onClick={() => openCreateModal()}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white py-2.5 px-5 rounded-lg font-medium flex items-center transition-all shadow-md hover:shadow-lg"
          disabled={isLoading}
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Create New Link
        </button>
      </div>

      {/* Show API error if any */}
      {apiError && (
        <Alert className="mb-6 border-red-200 bg-red-50 text-red-800">
          <AlertCircle className="h-5 w-5 mr-2" />
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
        <Card className="border-0 shadow-md overflow-hidden bg-white hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-100 border-b border-purple-100">
              <div className="font-medium text-indigo-700">Total Users</div>
            </div>
            <div className="p-6 flex items-center">
              <div className="bg-indigo-100 rounded-full p-3 mr-4">
                <UsersIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="text-3xl font-bold text-gray-800">{users.length}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md overflow-hidden bg-white hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-100 border-b border-blue-100">
              <div className="font-medium text-blue-700">Total Links</div>
            </div>
            <div className="p-6 flex items-center">
              <div className="bg-blue-100 rounded-full p-3 mr-4">
                <LinkIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-800">{links.length}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md overflow-hidden bg-white hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-100 border-b border-yellow-100">
              <div className="font-medium text-amber-700">Pending Links</div>
            </div>
            <div className="p-6 flex items-center">
              <div className="bg-yellow-100 rounded-full p-3 mr-4">
                <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-800">{users.reduce((sum, user) => sum + user.activeLinksCount, 0)}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md overflow-hidden bg-white hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-100 border-b border-green-100">
              <div className="font-medium text-emerald-700">Approved Links</div>
            </div>
            <div className="p-6 flex items-center">
              <div className="bg-green-100 rounded-full p-3 mr-4">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div className="text-3xl font-bold text-gray-800">{users.reduce((sum, user) => sum + user.activeLinksCount, 0)}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md overflow-hidden bg-white hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="p-4 bg-gradient-to-r from-purple-50 to-violet-100 border-b border-purple-100">
              <div className="font-medium text-violet-700">Total Clicks</div>
            </div>
            <div className="p-6 flex items-center">
              <div className="bg-purple-100 rounded-full p-3 mr-4">
                <CursorArrowRaysIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-800">{links.reduce((sum, link) => sum + link.clicks, 0)}</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md overflow-hidden bg-white hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-100 border-b border-emerald-100">
              <div className="font-medium text-teal-700">Total Revenue</div>
            </div>
            <div className="p-6 flex items-center">
              <div className="bg-teal-100 rounded-full p-3 mr-4">
                <BanknotesIcon className="h-6 w-6 text-teal-600" />
              </div>
              <div className="text-3xl font-bold text-gray-800">{links.reduce((sum, link) => sum + link.revenue, 0)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card className="mb-8 border-0 shadow-md overflow-hidden bg-white">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by user name, email, or username"
                className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading, Empty State and Users Table */}
      {isLoading ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : users.length > 0 ? (
        <Card className="overflow-hidden border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
            <CardTitle className="text-xl">Manage Ad Links by User</CardTitle>
            <CardDescription className="text-blue-100">
              Click on a user to expand and view their links
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold text-center">Links</TableHead>
                    <TableHead className="font-semibold text-right">Impressions</TableHead>
                    <TableHead className="font-semibold text-right">Clicks</TableHead>
                    <TableHead className="font-semibold text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <React.Fragment key={user._id}>
                      {/* User Row */}
                      <TableRow 
                        className={`hover:bg-blue-50 cursor-pointer transition-colors ${
                          expandedUsers[user._id] ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => toggleUserExpanded(user._id)}
                      >
                        <TableCell className="p-4">
                          <div className="flex items-center justify-center">
                            {expandedUsers[user._id] ? (
                              <ChevronDown className="h-5 w-5 text-blue-600" />
                            ) : (
                              <ChevronRight className="h-5 w-5 text-gray-600" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center mr-3 text-white font-medium">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 font-medium">
                            {user.activeLinksCount}/5
                          </span>
                        </TableCell>
                        <TableCell className="text-right font-mono">{user.totalImpressions.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-mono">{user.totalClicks.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(user.totalRevenue)}</TableCell>
                      </TableRow>
                      
                      {/* Expanded Links Section */}
                      {expandedUsers[user._id] && (
                        <TableRow className="bg-gray-50">
                          <TableCell colSpan={6} className="p-0">
                            <div className="px-8 py-4">
                              <div className="flex justify-between items-center mb-3">
                                <h4 className="font-semibold text-gray-700">Links for {user.name}</h4>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openCreateModal(user._id);
                                  }}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md flex items-center"
                                  disabled={user.activeLinksCount >= 5}
                                >
                                  <PlusIcon className="h-4 w-4 mr-1.5" />
                                  Add New Link
                                </button>
                              </div>
                              
                              {/* Loading state for links */}
                              {userLinksLoading[user._id] ? (
                                <div className="flex justify-center py-12">
                                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                              ) : getUserLinksFromState(user._id).length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                  {getUserLinksFromState(user._id).map((link) => (
                                    <div key={link.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                      <div className="flex justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center mb-2">
                                            <h5 className="font-medium text-gray-800">{link.name}</h5>
                                            <Badge 
                                              variant={link.status === 'approved' ? 'success' : link.status === 'pending' ? 'warning' : 'destructive'} 
                                              className="ml-2 capitalize"
                                            >
                                              {link.status}
                                            </Badge>
                                          </div>
                                          
                                          <div className="flex items-center text-sm text-gray-500 mb-3">
                                            <LinkIcon className="h-4 w-4 mr-1.5" />
                                            <span className="truncate max-w-md">{link.url}</span>
                                          </div>
                                          
                                          <div className="grid grid-cols-4 gap-4">
                                            <div>
                                              <div className="text-xs text-gray-500">Impressions</div>
                                              <div className="font-medium">{link.impressions.toLocaleString()}</div>
                                            </div>
                                            <div>
                                              <div className="text-xs text-gray-500">Clicks</div>
                                              <div className="font-medium">{link.clicks.toLocaleString()}</div>
                                            </div>
                                            <div>
                                              <div className="text-xs text-gray-500">CTR</div>
                                              <div className="font-medium text-blue-600">{link.ctr.toFixed(2)}%</div>
                                            </div>
                                            <div>
                                              <div className="text-xs text-gray-500">Revenue</div>
                                              <div className="font-medium text-green-600">{formatCurrency(link.revenue)}</div>
                                            </div>
                                          </div>
                                        </div>
                                        
                                        <div className="flex space-x-2 ml-4">
                                          {/* Edit button */}
                                          <button 
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
                                            title="Edit Link"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openEditModal(link);
                                            }}
                                          >
                                            <PencilIcon className="h-5 w-5" />
                                          </button>
                                          
                                          {/* Delete button */}
                                          <button 
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                                            title="Delete Link"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              openDeleteModal(link);
                                            }}
                                          >
                                            <TrashIcon className="h-5 w-5" />
                                          </button>
                                          
                                          {/* Existing approval/reject buttons for pending links */}
                                          {link.status === 'pending' && (
                                            <>
                                              <button 
                                                className="p-2 text-green-600 hover:bg-green-50 rounded-md transition-colors" 
                                                title="Approve Link"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleStatusUpdate(link.id, 'approved');
                                                }}
                                              >
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                                                </svg>
                                              </button>
                                              <button 
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors" 
                                                title="Reject Link"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleStatusUpdate(link.id, 'rejected');
                                                }}
                                              >
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                              </button>
                                            </>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <LinkIcon className="h-8 w-8 text-gray-400" />
                                  </div>
                                  <h3 className="text-lg font-medium text-gray-900 mb-1">No links for this user</h3>
                                  <p className="text-gray-500 mb-4">This user doesn't have any links yet.</p>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openCreateModal(user._id);
                                    }}
                                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                                  >
                                    Create First Link
                                  </button>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-16 px-6 bg-white rounded-lg shadow-md">
          <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <UsersIcon className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">No users found</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            No users match your search criteria. Try adjusting your search term.
          </p>
        </div>
      )}

      {/* Create/Edit Link Modal */}
      {isModalOpen && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-xl">
            <DialogHeader className="p-6 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
              <div className="flex items-center justify-between">
                <DialogTitle className="text-xl font-semibold">
                  {isEditMode ? 'Edit Link' : 'Create New Link'}
                </DialogTitle>
                <button 
                  onClick={closeModal}
                  className="text-white/80 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/30 rounded-full"
                  disabled={isSubmitting}
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              <DialogDescription className="text-blue-100 mt-1">
                {isEditMode ? 'Update the existing ad link information' : 'Create a new ad link for a user account'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmitForm} className="p-6 max-h-[75vh] overflow-y-auto">
              {apiError && (
                <Alert className="mb-6 border-red-200 bg-red-50 text-red-800">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}
              
              <div className="space-y-6">
                {/* User Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select User <span className="text-red-500">*</span>
                  </label>
                  <div className={`relative rounded-md shadow-sm ${formErrors.userId ? 'ring-1 ring-red-500' : ''}`}>
                    <select
                      name="userId"
                      value={formData.userId}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500 pl-4 pr-10 py-3 text-gray-700 bg-white"
                    >
                      <option value="">Select a user</option>
                      {users.map(user => (
                        <option key={user._id} value={user._id} disabled={user.activeLinksCount >= 5}>
                          {user.name} ({user.email}) - {user.activeLinksCount}/5 links
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                        <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  {formErrors.userId && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {formErrors.userId}
                    </p>
                  )}
                </div>
                
                {/* Link Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Link Name <span className="text-red-500">*</span>
                  </label>
                  <div className={`relative rounded-md shadow-sm ${formErrors.name ? 'ring-1 ring-red-500' : ''}`}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Product Landing Page"
                      className="block w-full rounded-lg border-gray-300 pl-10 pr-3 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  {formErrors.name && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {formErrors.name}
                    </p>
                  )}
                </div>
                
                {/* Link URL */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    URL <span className="text-red-500">*</span>
                  </label>
                  <div className={`relative rounded-md shadow-sm ${formErrors.url ? 'ring-1 ring-red-500' : ''}`}>
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      placeholder="https://example.com/landingpage"
                      className="block w-full rounded-lg border-gray-300 pl-10 pr-3 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  {formErrors.url && (
                    <p className="mt-1.5 text-sm text-red-600 flex items-center">
                      <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      {formErrors.url}
                    </p>
                  )}
                </div>
                
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border-gray-300 pl-10 pr-10 py-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="approved">Approved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                        <path d="M7 7l3-3 3 3m0 6l-3 3-3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mt-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    Performance Metrics
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Impressions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Impressions</label>
                      <div className={`relative rounded-md shadow-sm ${formErrors.impressions ? 'ring-1 ring-red-500' : ''}`}>
                        <input
                          type="number"
                          name="impressions"
                          min="0"
                          value={formData.impressions}
                          onChange={handleInputChange}
                          className="block w-full rounded-lg border-gray-300 py-2.5 px-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      {formErrors.impressions && (
                        <p className="mt-1 text-xs text-red-600">{formErrors.impressions}</p>
                      )}
                    </div>
                    
                    {/* Clicks */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Clicks</label>
                      <div className={`relative rounded-md shadow-sm ${formErrors.clicks ? 'ring-1 ring-red-500' : ''}`}>
                        <input
                          type="number"
                          name="clicks"
                          min="0"
                          value={formData.clicks}
                          onChange={handleInputChange}
                          className="block w-full rounded-lg border-gray-300 py-2.5 px-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      {formErrors.clicks && (
                        <p className="mt-1 text-xs text-red-600">{formErrors.clicks}</p>
                      )}
                    </div>
                    
                    {/* CPM */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">CPM ($)</label>
                      <div className={`relative rounded-md shadow-sm ${formErrors.cpm ? 'ring-1 ring-red-500' : ''}`}>
                        <input
                          type="number"
                          name="cpm"
                          min="0"
                          step="0.01"
                          value={formData.cpm}
                          onChange={handleInputChange}
                          className="block w-full rounded-lg border-gray-300 py-2.5 px-3 text-gray-700 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      {formErrors.cpm && (
                        <p className="mt-1 text-xs text-red-600">{formErrors.cpm}</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Calculated Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 bg-white p-4 rounded-lg border border-gray-100">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">CTR (Calculated)</label>
                      <div className="text-lg font-semibold text-blue-600">
                        {formData.impressions && formData.clicks ? 
                          ((parseInt(formData.clicks) / parseInt(formData.impressions)) * 100).toFixed(2) : 
                          0}%
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Revenue (Calculated)</label>
                      <div className="text-lg font-semibold text-green-600">
                        {formData.impressions && formData.cpm ?
                          formatCurrency((parseInt(formData.impressions) / 1000) * parseFloat(formData.cpm)) :
                          formatCurrency(0)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <DialogFooter className="flex justify-end space-x-3 mt-8">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </span>
                  ) : isEditMode ? 'Update Link' : 'Create Link'}
                </button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && linkToDelete && (
        <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
          <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl">
            <DialogHeader className="p-6 bg-red-600 text-white">
              <DialogTitle className="text-xl font-semibold">Delete Link</DialogTitle>
              <DialogDescription className="text-red-100 mt-1">
                This action cannot be undone
              </DialogDescription>
            </DialogHeader>
            
            <div className="p-6">
              <p className="mb-4 text-gray-700">
                Are you sure you want to delete the link "{linkToDelete.name}"? This will permanently remove the link and all associated data.
              </p>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeDeleteModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteLink}
                  className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Deleting...
                    </span>
                  ) : 'Delete Link'}
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}