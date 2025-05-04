'use client';

import React, { useState, useEffect } from 'react';
import { getUserFromLocalStorage } from '@/lib/localStorage';
import { LinkIcon, ChartBarSquareIcon, CursorArrowRaysIcon, BanknotesIcon, ClipboardIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getUserLinks } from '@/lib/linksService';
import { Link } from '@/lib/linksService';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function LinksPage() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{id: string, name: string} | null>(null);
  const [links, setLinks] = useState<Link[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Get user data from local storage
        const user = getUserFromLocalStorage();
        if (!user || !user.id) {
          throw new Error('User not found. Please login again.');
        }

        setUserData(user);

        // Fetch user's links
        const userLinks = await getUserLinks(user.id);
        setLinks(userLinks);
      } catch (error) {
        console.error('Error fetching links:', error);
        setError(error instanceof Error ? error.message : 'Failed to load links');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Copy link to clipboard function
  const handleCopyLink = (id: string, url: string) => {
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  // Calculate total metrics
  const totalImpressions = links.reduce((sum, link) => sum + link.impressions, 0);
  const totalClicks = links.reduce((sum, link) => sum + link.clicks, 0);
  const totalCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const totalRevenue = links.reduce((sum, link) => sum + link.revenue, 0);

  return (
    <div className="container mx-auto p-4 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Ad Links</h1>
      </div>

      {/* Display error if any */}
      {error && (
        <Alert className="mb-6 border-red-200 bg-red-50 text-red-800">
          <AlertCircle className="h-5 w-5 mr-2" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Info card for users */}
      <Card className="mb-6 bg-blue-50 border-blue-100">
        <CardHeader>
          <CardTitle className="text-blue-800">Ad Links Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-blue-700 mb-2">
            Your account can have up to 5 active ad links at any time. Only administrators can create ad links for your account. If you need a new link, please contact your account manager.
          </p>
          <p className="text-blue-700">
            Track the performance of your links below. Revenue is updated at the end of each month.
          </p>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100">
            <CardTitle className="text-sm font-medium text-blue-700">Total Links</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full mr-4">
                <LinkIcon className="h-6 w-6 text-blue-600" />
              </div>
              {loading ? (
                <Skeleton className="h-10 w-16" />
              ) : (
                <div className="text-3xl font-bold text-gray-800">{links.length}</div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-green-100">
            <CardTitle className="text-sm font-medium text-green-700">Total Impressions</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full mr-4">
                <ChartBarSquareIcon className="h-6 w-6 text-green-600" />
              </div>
              {loading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="text-3xl font-bold text-gray-800">{totalImpressions.toLocaleString()}</div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2 bg-gradient-to-r from-purple-50 to-purple-100">
            <CardTitle className="text-sm font-medium text-purple-700">Total Clicks</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full mr-4">
                <CursorArrowRaysIcon className="h-6 w-6 text-purple-600" />
              </div>
              {loading ? (
                <Skeleton className="h-10 w-20" />
              ) : (
                <div className="text-3xl font-bold text-gray-800">{totalClicks.toLocaleString()}</div>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card className="overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300">
          <CardHeader className="pb-2 bg-gradient-to-r from-yellow-50 to-yellow-100">
            <CardTitle className="text-sm font-medium text-yellow-700">Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full mr-4">
                <BanknotesIcon className="h-6 w-6 text-yellow-600" />
              </div>
              {loading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="text-3xl font-bold text-gray-800">{formatCurrency(totalRevenue)}</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Links Table */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
          <CardTitle className="text-xl">Your Ad Links</CardTitle>
          <CardDescription className="text-blue-100">
            Track performance metrics for all your advertising links
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            // Loading skeleton for table
            <div className="p-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : links.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead className="font-semibold">Name</TableHead>
                    <TableHead className="font-semibold">Action</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold text-right">Impressions</TableHead>
                    <TableHead className="font-semibold text-right">Clicks</TableHead>
                    <TableHead className="font-semibold text-right">CTR</TableHead>
                    <TableHead className="font-semibold text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((link) => (
                    <TableRow key={link.id} className="hover:bg-blue-50 transition-colors">
                      <TableCell className="font-medium">{link.name}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleCopyLink(link.id, link.url)}
                          className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm transition-colors ${
                            copiedId === link.id 
                              ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                              : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                          }`}
                        >
                          {copiedId === link.id ? (
                            <>
                              <CheckIcon className="h-4 w-4 mr-1.5" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <ClipboardIcon className="h-4 w-4 mr-1.5" />
                              Copy Link
                            </>
                          )}
                        </button>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={link.status === 'approved' ? 'success' : link.status === 'pending' ? 'warning' : 'destructive'} 
                          className="font-semibold"
                        >
                          {link.status.charAt(0).toUpperCase() + link.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-mono">{link.impressions.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">{link.clicks.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-mono">
                        <span className="bg-blue-50 text-blue-800 px-2 py-1 rounded">
                          {link.ctr.toFixed(2)}%
                        </span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(link.revenue)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <LinkIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No links yet</h3>
              <p className="text-gray-500 mb-4 max-w-md mx-auto">
                You don't have any ad links yet. Contact your account manager to request new links for your account.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 