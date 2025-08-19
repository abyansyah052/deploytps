'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../../components/Navigation';
import { Search, Filter, Package, MapPin, Building, Settings, ArrowUpDown, ArrowUp, ArrowDown, AlertCircle, X } from 'lucide-react';

export default function Catalog() {
  const router = useRouter();

  // Enhanced Google Drive URL converter with multiple fallbacks
  const convertGoogleDriveUrl = (url) => {
    if (!url) return url;
    
    console.log('🔗 Catalog - Processing URL:', url);
    
    // Already converted check
    if (url.includes('drive.google.com/uc?export=view') || 
        url.includes('drive.google.com/thumbnail?') ||
        url.includes('lh3.googleusercontent.com')) {
      console.log('✅ Catalog - Already a direct URL');
      return url;
    }
    
    // Extract file ID
    const extractFileId = (url) => {
      const patterns = [
        /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
        /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
        /\/d\/([a-zA-Z0-9_-]+)\//,
        /[?&]id=([a-zA-Z0-9_-]+)/
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          console.log('📝 Catalog - File ID found:', match[1]);
          return match[1];
        }
      }
      return null;
    };

    const fileId = extractFileId(url);
    if (fileId) {
      const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
      console.log('🔄 Catalog - Converted to:', directUrl);
      return directUrl;
    }
    
    console.log('⚠️ Catalog - No file ID found, using original URL');
    return url;
  };

  // Get fallback URLs for error handling
  const getFallbackUrls = (originalUrl) => {
    const extractFileId = (url) => {
      const patterns = [
        /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
        /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
        /\/d\/([a-zA-Z0-9_-]+)\//,
        /[?&]id=([a-zA-Z0-9_-]+)/
      ];
      
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) return match[1];
      }
      return null;
    };

    const fileId = extractFileId(originalUrl);
    if (!fileId) return [originalUrl];
    
    return [
      `https://drive.google.com/uc?export=view&id=${fileId}`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w400`,
      `https://drive.google.com/thumbnail?id=${fileId}&sz=w300`,
      `https://lh3.googleusercontent.com/d/${fileId}`,
      `https://drive.google.com/uc?id=${fileId}`,
      originalUrl
    ];
  };

  const [materials, setMaterials] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortField, setSortField] = useState('nama_material');
  const [sortOrder, setSortOrder] = useState('asc');
  const [categories, setCategories] = useState([]);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchMaterials();
    fetchCategories();
  }, [pagination.page, searchTerm, selectedCategory, selectedStatus, sortField, sortOrder]);

  const fetchMaterials = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) params.append('search', searchTerm);
      if (selectedCategory) params.append('division', selectedCategory);
      if (selectedStatus) params.append('status', selectedStatus);
      if (sortField) params.append('sortBy', sortField);
      if (sortOrder) params.append('sortOrder', sortOrder);

      const response = await fetch(`/api/materials?${params}`);
      const data = await response.json();
      
      setMaterials(data.materials || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setCategories(data.divisionStats.map((d) => d.divisi));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchMaterials();
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setSelectedStatus('');
    setSortField('nama_material');
    setSortOrder('asc');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-4 w-4" />;
    }
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const handleShowDetail = (material) => {
    setSelectedMaterial(material);
    setShowDetailModal(true);
  };

  const handleCloseDetail = () => {
    setSelectedMaterial(null);
    setShowDetailModal(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    placeholder="Search materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Division Filter */}
              <div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Divisions</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={resetFilters}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Reset Filters
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
              >
                Search
              </button>
            </div>
          </form>
        </div>

        {/* Material Management Button */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={() => router.push('/management')}
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm"
          >
            <Settings className="h-5 w-5 mr-2" />
            Material Management
          </button>
        </div>

        {/* Results Info */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {materials.length} of {pagination.total.toLocaleString()} materials
          </p>
          <div className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </div>
        </div>

        {/* Materials Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow animate-pulse">
                <div className="h-48 bg-gray-300 rounded-t-lg"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {materials.map((material) => (
              <div 
                key={material.id} 
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleShowDetail(material)}
              >
                <div className="h-48 bg-gray-100 rounded-t-lg flex items-center justify-center">
                  {material.image_url ? (
                    <img
                      src={convertGoogleDriveUrl(material.image_url)}
                      alt={material.nama_material || 'CC/ME'}
                      className="h-full w-full object-cover rounded-t-lg"
                      onError={(e) => {
                        console.error('❌ Catalog - Image error:', e.target.src);
                        
                        const fallbacks = getFallbackUrls(material.image_url);
                        const currentIndex = fallbacks.indexOf(e.target.src);
                        
                        if (currentIndex < fallbacks.length - 1) {
                          const nextUrl = fallbacks[currentIndex + 1];
                          console.log('🔄 Catalog - Trying:', nextUrl);
                          e.target.src = nextUrl;
                        } else {
                          console.log('❌ Catalog - All URLs failed');
                          e.target.style.display = 'none';
                        }
                      }}
                      onLoad={() => console.log('✅ Catalog - Image loaded:', e.target.src)}
                    />
                  ) : (
                    <Package className="h-16 w-16 text-gray-400" />
                  )}
                </div>                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {material.divisi || 'General'}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      material.status === 'active' 
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {material.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                    {material.nama_material || 'CC/ME'}
                  </h3>
                  
                  <p className="text-xs text-gray-500 mb-2">Code: {material.kode_material || '-'}</p>
                  
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex items-center">
                      <Package className="h-3 w-3 mr-1" />
                      <span>Unit: {material.satuan || 'pcs'}</span>
                    </div>
                    <div className="flex items-center">
                      <Building className="h-3 w-3 mr-1" />
                      <span className="truncate">{material.lokasi}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      <span className="truncate">{material.penempatan_alat}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page <= 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            
            <span className="px-3 py-2 text-sm text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            Total: {pagination.total.toLocaleString()} items
          </div>
        </div>
      </div>

      {/* Material Detail Modal */}
      {showDetailModal && selectedMaterial && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Modal Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">
                  {selectedMaterial.nama_material || 'Unnamed Material'}
                </h3>
                <button
                  onClick={handleCloseDetail}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Image Section */}
                <div className="lg:col-span-1">
                  <div className="bg-gray-100 rounded-lg p-4 h-64 flex items-center justify-center">
                    {selectedMaterial.image_url ? (
                      <img
                        src={convertGoogleDriveUrl(selectedMaterial.image_url)}
                        alt={selectedMaterial.nama_material}
                        className="max-h-full max-w-full object-contain rounded-lg"
                        onError={(e) => {
                          console.error('❌ Detail Modal - Image error:', e.target.src);
                          
                          const fallbacks = getFallbackUrls(selectedMaterial.image_url);
                          const currentIndex = fallbacks.indexOf(e.target.src);
                          
                          if (currentIndex < fallbacks.length - 1) {
                            const nextUrl = fallbacks[currentIndex + 1];
                            console.log('🔄 Detail Modal - Trying:', nextUrl);
                            e.target.src = nextUrl;
                          } else {
                            console.log('❌ Detail Modal - All URLs failed');
                            e.target.style.display = 'none';
                          }
                        }}
                        onLoad={() => console.log('✅ Detail Modal - Image loaded:', e.target.src)}
                      />
                    ) : (
                      <div className="text-gray-500 text-center">
                        <Package className="h-16 w-16 mx-auto text-gray-400" />
                        <p className="mt-2">No Image Available</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Information Section */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Material Code (SAP):</span>
                        <p className="text-gray-900 font-mono mt-1">{selectedMaterial.kode_material || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Division:</span>
                        <p className="text-gray-900 mt-1">{selectedMaterial.divisi || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Category (StoreRoom):</span>
                        <p className="text-gray-900 mt-1">{selectedMaterial.kategori || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Unit of Measure:</span>
                        <p className="text-gray-900 mt-1">{selectedMaterial.satuan || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Status:</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1 ${
                          selectedMaterial.status === 'ACTIVE' 
                            ? 'bg-green-100 text-green-800' 
                            : selectedMaterial.status === 'No Status'
                            ? 'bg-gray-100 text-gray-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedMaterial.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location Information */}
                  {(selectedMaterial.lokasi_sistem || selectedMaterial.lokasi_fisik || selectedMaterial.penempatan_pada_alat || selectedMaterial.deskripsi_penempatan) && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Location Information</h4>
                      <div className="grid grid-cols-1 gap-4">
                        {selectedMaterial.lokasi_sistem && (
                          <div>
                            <span className="font-medium text-gray-700">System Location:</span>
                            <p className="text-gray-900 mt-1">{selectedMaterial.lokasi_sistem}</p>
                          </div>
                        )}
                        {selectedMaterial.lokasi_fisik && (
                          <div>
                            <span className="font-medium text-gray-700">Physical Location:</span>
                            <p className="text-gray-900 mt-1">{selectedMaterial.lokasi_fisik}</p>
                          </div>
                        )}
                        {selectedMaterial.penempatan_pada_alat && (
                          <div>
                            <span className="font-medium text-gray-700">Equipment Placement:</span>
                            <p className="text-gray-900 mt-1">{selectedMaterial.penempatan_pada_alat}</p>
                          </div>
                        )}
                        {selectedMaterial.deskripsi_penempatan && (
                          <div>
                            <span className="font-medium text-gray-700">Placement Description:</span>
                            <p className="text-gray-900 mt-1">{selectedMaterial.deskripsi_penempatan}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Image URL Information */}
                  {selectedMaterial.image_url && (
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-3">Image Information</h4>
                      <div>
                        <span className="font-medium text-gray-700">Image URL:</span>
                        <div className="mt-1 p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm text-gray-600 break-all">{selectedMaterial.image_url}</p>
                          <div className="mt-2">
                            <a 
                              href={selectedMaterial.image_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              View Original Link →
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-end mt-6 pt-6 border-t">
                <button
                  onClick={handleCloseDetail}
                  className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
