// Types
export interface Link {
  id: string;
  name: string;
  url: string;
  userId: string;
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

export interface UserWithLinks {
  _id: string;
  name: string;
  email: string;
  username: string;
  role: string;
  createdAt: string;
  linksCount: number;
  activeLinksCount: number;
  totalImpressions: number;
  totalClicks: number;
  totalRevenue: number;
}

export interface LinkRequest {
  name: string;
  url: string;
}

export interface LinkResponse {
  _id: string;
  name: string;
  url: string;
  userId: string;
  status: 'pending' | 'approved' | 'rejected';
  impressions: number;
  clicks: number;
  ctr: number;
  cpm: number;
  revenue: number;
  createdAt: string;
  user?: {
    _id: string;
    name: string;
    email: string;
  };
}

// New type for admin link creation with more fields
export interface AdminLinkRequest {
  name: string;
  url: string;
  userId: string;
  status?: 'pending' | 'approved' | 'rejected';
  impressions?: number;
  clicks?: number;
  cpm?: number;
}

// API Functions
export const getUserLinks = async (userId: string): Promise<Link[]> => {
  try {
    const response = await fetch(`/api/links?userId=${userId}`, {
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user links');
    }

    const data = await response.json();
    
    // Transform the API response to match our Link interface
    return data.links.map((link: LinkResponse) => ({
      id: link._id,
      url: link.url,
      name: link.name,
      userId: link.userId,
      userName: link.user?.name || 'Unknown User',
      userEmail: link.user?.email || 'unknown@example.com',
      status: link.status,
      impressions: link.impressions,
      clicks: link.clicks,
      ctr: link.ctr,
      cpm: link.cpm,
      revenue: link.revenue,
      createdAt: link.createdAt
    }));
  } catch (error) {
    console.error('Error fetching user links:', error);
    return [];
  }
};

export const getAllLinks = async (adminId: string): Promise<Link[]> => {
  try {
    const response = await fetch(`/api/links/admin?adminId=${adminId}`, {
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch links');
    }

    const data = await response.json();
    
    // Transform the API response to match our Link interface
    return data.links.map((link: LinkResponse) => ({
      id: link._id,
      url: link.url,
      name: link.name,
      userId: link.userId,
      userName: link.user?.name || 'Unknown User',
      userEmail: link.user?.email || 'unknown@example.com',
      status: link.status,
      impressions: link.impressions,
      clicks: link.clicks,
      ctr: link.ctr,
      cpm: link.cpm,
      revenue: link.revenue,
      createdAt: link.createdAt
    }));
  } catch (error) {
    console.error('Error fetching all links:', error);
    return [];
  }
};

export const requestLink = async (userId: string, linkData: LinkRequest): Promise<Link | null> => {
  try {
    const response = await fetch('/api/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        userId,
        ...linkData
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create link request');
    }

    const data = await response.json();
    
    return {
      id: data.link._id,
      url: data.link.url,
      name: data.link.name,
      userId: data.link.userId,
      userName: data.link.user?.name || 'Unknown User',
      userEmail: data.link.user?.email || 'unknown@example.com',
      status: data.link.status,
      impressions: data.link.impressions || 0,
      clicks: data.link.clicks || 0,
      ctr: data.link.ctr || 0,
      cpm: data.link.cpm || 0,
      revenue: data.link.revenue || 0,
      createdAt: data.link.createdAt
    };
  } catch (error) {
    console.error('Error creating link request:', error);
    return null;
  }
};

export const updateLinkStatus = async (
  linkId: string, 
  status: 'approved' | 'rejected',
  adminId: string
): Promise<boolean> => {
  try {
    const response = await fetch(`/api/links/${linkId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        adminId,
        status
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update link status');
    }

    return true;
  } catch (error) {
    console.error(`Error ${status === 'approved' ? 'approving' : 'rejecting'} link:`, error);
    return false;
  }
};

// New function for admin to create links directly
export const createLinkByAdmin = async (
  adminId: string,
  linkData: AdminLinkRequest
): Promise<Link | null> => {
  try {
    const response = await fetch('/api/links/admin/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        adminId,
        ...linkData
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create link');
    }

    const data = await response.json();
    
    return {
      id: data.link._id,
      url: data.link.url,
      name: data.link.name,
      userId: data.link.userId,
      userName: data.link.user?.name || 'Unknown User',
      userEmail: data.link.user?.email || 'unknown@example.com',
      status: data.link.status,
      impressions: data.link.impressions || 0,
      clicks: data.link.clicks || 0,
      ctr: data.link.ctr || 0,
      cpm: data.link.cpm || 0,
      revenue: data.link.revenue || 0,
      createdAt: data.link.createdAt
    };
  } catch (error) {
    console.error('Error creating link by admin:', error);
    return null;
  }
};

// Get all users with link counts for admin
export const getAllUsers = async (adminId: string): Promise<UserWithLinks[]> => {
  try {
    const response = await fetch(`/api/links/users?adminId=${adminId}`, {
      headers: {
        'Content-Type': 'application/json'
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data = await response.json();
    return data.users;
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};

// New function for admin to update existing links
export const updateLink = async (
  linkId: string,
  adminId: string,
  linkData: AdminLinkRequest
): Promise<Link | null> => {
  try {
    const response = await fetch(`/api/links/${linkId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        adminId,
        ...linkData
      })
    });

    if (!response.ok) {
      throw new Error('Failed to update link');
    }

    const data = await response.json();
    
    return {
      id: data.link._id,
      url: data.link.url,
      name: data.link.name,
      userId: data.link.userId,
      userName: data.link.user?.name || 'Unknown User',
      userEmail: data.link.user?.email || 'unknown@example.com',
      status: data.link.status,
      impressions: data.link.impressions || 0,
      clicks: data.link.clicks || 0,
      ctr: data.link.ctr || 0,
      cpm: data.link.cpm || 0,
      revenue: data.link.revenue || 0,
      createdAt: data.link.createdAt
    };
  } catch (error) {
    console.error('Error updating link:', error);
    return null;
  }
};

// Function for admin to delete links
export const deleteLink = async (
  linkId: string,
  adminId: string
): Promise<boolean> => {
  try {
    const response = await fetch(`/api/links/${linkId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        adminId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to delete link');
    }

    return true;
  } catch (error) {
    console.error('Error deleting link:', error);
    return false;
  }
}; 