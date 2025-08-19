'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Upload, Download, Search, Package, AlertCircle, ArrowLeft, ArrowUpDown, ArrowUp, ArrowDown, FileSpreadsheet, Key } from 'lucide-react';

export default function Management() {
  const router = useRouter();
  const [materials, setMaterials] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });

  // Enhanced Google Drive URL converter with multiple fallbacks
  const convertGoogleDriveUrl = (url) => {
    if (!url) return url;
    
    console.log('🔗 Management - Processing URL:', url);
    
    // Already converted check
    if (url.includes('drive.google.com/uc?export=view') || 
        url.includes('drive.google.com/thumbnail?') ||
        url.includes('lh3.googleusercontent.com')) {
      console.log('✅ Management - Already a direct URL');
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
          console.log('📝 Management - File ID found:', match[1]);
          return match[1];
        }
      }
      return null;
    };

    const fileId = extractFileId(url);
    if (fileId) {
      const directUrl = `https://drive.google.com/uc?export=view&id=${fileId}`;
      console.log('🔄 Management - Converted to:', directUrl);
      return directUrl;
    }
    
    console.log('⚠️ Management - No file ID found, using original URL');
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
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortField, setSortField] = useState('nama_material');
  const [sortOrder, setSortOrder] = useState('asc');
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_material: '',
    kode_material: '',
    kategori: '',
    divisi: '',
    satuan: '',
    status: 'ACTIVE',
    image_url: '',
    lokasi_sistem: '',
    lokasi_fisik: '',
    penempatan_pada_alat: '',
    deskripsi_penempatan: ''
  });

  useEffect(() => {
    fetchMaterials();
    fetchCategories();
  }, [pagination.page, searchTerm, selectedCategory, selectedStatus, sortField, sortOrder]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchTerm, selectedCategory, selectedStatus, sortField, sortOrder]);

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

  // Export functions
  const handleExport = async () => {
    if (exportPassword !== 'TPS123') {
      alert('Password salah!');
      return;
    }

    try {
      const params = new URLSearchParams();
      if (selectedDivision && selectedDivision !== 'all') {
        params.append('division', selectedDivision);
      }

      const response = await fetch(`/api/materials/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `materials_${selectedDivision || 'all'}_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Gagal export data');
    }
    
    setShowExportModal(false);
    setExportPassword('');
    setSelectedDivision('');
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/materials/template');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'materials_template.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Template download error:', error);
      alert('Gagal download template');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.xlsx')) {
      alert('File harus berformat .xlsx');
      return;
    }

    setUploadFile(file);
    setUploadLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/materials/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Berhasil upload ${result.count} materials`);
        fetchMaterials();
      } else {
        const error = await response.json();
        alert(`Gagal upload: ${error.message}`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Gagal upload file');
    } finally {
      setUploadLoading(false);
      setUploadFile(null);
      e.target.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const method = editingMaterial ? 'PUT' : 'POST';
      const url = '/api/materials';

      const payload = editingMaterial ? { ...formData, id: editingMaterial.id } : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowAddModal(false);
        setEditingMaterial(null);
        resetForm();
        fetchMaterials();
      } else {
        alert('Error saving material');
      }
    } catch (error) {
      console.error('Error saving material:', error);
      alert('Error saving material');
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setFormData({
      nama_material: material.nama_material || '',
      kode_material: material.kode_material || '',
      kategori: material.kategori || '',
      divisi: material.divisi || '',
      satuan: material.satuan || '',
      status: material.status || 'ACTIVE',
      image_url: material.image_url || '',
      lokasi_sistem: material.lokasi_sistem || '',
      lokasi_fisik: material.lokasi_fisik || '',
      penempatan_pada_alat: material.penempatan_pada_alat || '',
      deskripsi_penempatan: material.deskripsi_penempatan || ''
    });
    setShowAddModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this material?')) {
      try {
        const response = await fetch(`/api/materials?id=${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchMaterials();
        } else {
          alert('Error deleting material');
        }
      } catch (error) {
        console.error('Error deleting material:', error);
        alert('Error deleting material');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      nama_material: '',
      kode_material: '',
      kategori: '',
      divisi: '',
      satuan: '',
      status: 'ACTIVE',
      image_url: '',
      lokasi_sistem: '',
      lokasi_fisik: '',
      penempatan_pada_alat: '',
      deskripsi_penempatan: ''
    });
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header - Acting as the main navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <button
              onClick={() => router.push('/catalog')}
              className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">Material Management</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search materials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <button
                onClick={handleSearch}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Search
              </button>
            </div>
            
            <div className="flex flex-wrap gap-3">
              {/* Export Button */}
              <button
                onClick={() => setShowExportModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </button>

              {/* Download Template Button */}
              <button
                onClick={handleDownloadTemplate}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download Template
              </button>

              {/* Upload Button */}
              <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                {uploadLoading ? 'Uploading...' : 'Upload Excel'}
                <input
                  type="file"
                  accept=".xlsx"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploadLoading}
                />
              </label>

              {/* Add Material Button */}
              <button
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Material
              </button>
            </div>
          </div>
        </div>

        {/* Sorting and Quick Filters */}
        <div className="bg-white shadow rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Sort Options */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Sort by:</span>
              
              <button
                onClick={() => handleSort('nama_material')}
                className={`inline-flex items-center px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  sortField === 'nama_material'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Name {getSortIcon('nama_material')}
              </button>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Quick Filter:</span>
              
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Divisions</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <button
                onClick={resetFilters}
                className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        {/* Materials Management Grid */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Materials Inventory</h3>
              <div className="text-sm text-gray-500">
                Showing {materials.length} of {pagination.total.toLocaleString()} items (Page {pagination.page} of {pagination.totalPages})
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading materials...</span>
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-12">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No materials found</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by adding a new material.</p>
              <div className="mt-6">
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </button>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {materials.map((material, index) => (
                <div key={material.id} className="p-6 hover:bg-gray-50 transition-colors duration-150">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      {/* Main Material Info */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <h4 className="text-lg font-medium text-gray-900 truncate">
                              {material.nama_material || 'Unnamed Material'}
                            </h4>
                            <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              material.status === 'ACTIVE' 
                                ? 'bg-green-100 text-green-800' 
                                : material.status === 'No Status'
                                ? 'bg-gray-100 text-gray-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {material.status}
                            </span>
                          </div>
                          
                          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-gray-500">Code:</span>
                              <p className="text-gray-900 font-mono">{material.kode_material || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500">Division:</span>
                              <p className="text-gray-900">{material.divisi || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500">Category:</span>
                              <p className="text-gray-900">{material.kategori || 'N/A'}</p>
                            </div>
                            <div>
                              <span className="font-medium text-gray-500">Unit:</span>
                              <p className="text-gray-900">{material.satuan || 'N/A'}</p>
                            </div>
                          </div>

                          {/* Additional Info */}
                          {(material.lokasi_sistem || material.lokasi_fisik || material.penempatan_pada_alat) && (
                            <div className="mt-3 text-sm text-gray-600">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                                {material.lokasi_sistem && (
                                  <div>
                                    <span className="font-medium">System Location:</span>
                                    <span className="ml-1">{material.lokasi_sistem}</span>
                                  </div>
                                )}
                                {material.lokasi_fisik && (
                                  <div>
                                    <span className="font-medium">Physical Location:</span>
                                    <span className="ml-1">{material.lokasi_fisik}</span>
                                  </div>
                                )}
                                {material.penempatan_pada_alat && (
                                  <div>
                                    <span className="font-medium">Equipment:</span>
                                    <span className="ml-1">{material.penempatan_pada_alat}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Image and Actions */}
                        <div className="flex items-start space-x-4 ml-6">
                          {material.image_url && (
                            <div className="flex-shrink-0">
                              <img
                                src={convertGoogleDriveUrl(material.image_url)}
                                alt={material.nama_material}
                                className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                                onError={(e) => {
                                  console.error('❌ Management - Image error:', e.target.src);
                                  
                                  // Get fallback URLs
                                  const fallbacks = getFallbackUrls(material.image_url);
                                  const currentIndex = fallbacks.indexOf(e.target.src);
                                  
                                  if (currentIndex < fallbacks.length - 1) {
                                    const nextUrl = fallbacks[currentIndex + 1];
                                    console.log('🔄 Management - Trying:', nextUrl);
                                    e.target.src = nextUrl;
                                  } else {
                                    console.log('❌ Management - All URLs failed');
                                    e.target.style.display = 'none';
                                  }
                                }}
                                onLoad={() => console.log('✅ Management - Image loaded:', e.target.src)}
                              />
                            </div>
                          )}
                          
                          <div className="flex flex-col space-y-2">
                            <button
                              onClick={() => handleEdit(material)}
                              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(material.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingMaterial ? 'Edit Material' : 'Add New Material'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Material Name *</label>
                    <input
                      type="text"
                      value={formData.nama_material}
                      onChange={(e) => setFormData({ ...formData, nama_material: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter material name"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Material Code (SAP) *</label>
                    <input
                      type="text"
                      value={formData.kode_material}
                      onChange={(e) => setFormData({ ...formData, kode_material: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter SAP code"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Division *</label>
                    <select
                      value={formData.divisi}
                      onChange={(e) => setFormData({ ...formData, divisi: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Division</option>
                      <option value="ME">ME (Mechanical Equipment)</option>
                      <option value="CC">CC (Container Crane)</option>
                      <option value="RTG">RTG (Rubber Tired Gantry)</option>
                      <option value="Lain">Lain (Others)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category (StoreRoom) *</label>
                    <input
                      type="text"
                      value={formData.kategori}
                      onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., TPS, INDOTRUCK, SAP"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit of Measure *</label>
                    <input
                      type="text"
                      value={formData.satuan}
                      onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Pcs, Kg, Meter"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="No Status">No Status</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Location Information */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Location Information</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">System Location</label>
                      <input
                        type="text"
                        value={formData.lokasi_sistem}
                        onChange={(e) => setFormData({ ...formData, lokasi_sistem: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="System location code"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Physical Location</label>
                      <input
                        type="text"
                        value={formData.lokasi_fisik}
                        onChange={(e) => setFormData({ ...formData, lokasi_fisik: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Physical storage location"
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Equipment Placement</label>
                      <input
                        type="text"
                        value={formData.penempatan_pada_alat}
                        onChange={(e) => setFormData({ ...formData, penempatan_pada_alat: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Equipment or machinery where this material is used"
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Placement Description</label>
                      <textarea
                        value={formData.deskripsi_penempatan}
                        onChange={(e) => setFormData({ ...formData, deskripsi_penempatan: e.target.value })}
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Additional details about material placement"
                      />
                    </div>
                  </div>
                </div>

                {/* Image URL */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Material Image</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Image URL</label>
                    <input
                      type="url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="Paste Google Drive sharing link or direct image URL"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      For Google Drive: Make sure the file is shared with "Anyone with the link can view"
                    </p>
                    {formData.image_url && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-2">Preview:</p>
                        <img 
                          src={convertGoogleDriveUrl(formData.image_url)} 
                          alt="Preview" 
                          className="h-20 w-20 object-cover rounded-md border border-gray-200"
                          onError={(e) => {
                            console.error('❌ Management - Preview error:', e.target.src);
                            
                            const fallbacks = getFallbackUrls(formData.image_url);
                            const currentIndex = fallbacks.indexOf(e.target.src);
                            
                            if (currentIndex < fallbacks.length - 1) {
                              const nextUrl = fallbacks[currentIndex + 1];
                              console.log('🔄 Management - Preview trying:', nextUrl);
                              e.target.src = nextUrl;
                            } else {
                              console.log('❌ Management - Preview failed');
                              e.target.style.display = 'none';
                            }
                          }}
                          onLoad={() => console.log('✅ Management - Preview loaded:', e.target.src)}
                        />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingMaterial(null);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    {editingMaterial ? 'Update' : 'Add'} Material
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          {/* Header */}
          <div className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between py-6">
                <div className="flex items-center">
                  <button
                    onClick={() => {
                      setShowExportModal(false);
                      setExportPassword('');
                      setSelectedDivision('');
                    }}
                    className="mr-4 p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <div className="flex items-center">
                    <Download className="h-8 w-8 text-blue-600 mr-3" />
                    <h1 className="text-3xl font-bold text-gray-900">Export Materials Data</h1>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-8">
              <div className="text-center mb-8">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 mb-4">
                  <FileSpreadsheet className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Export Material Inventory</h2>
                <p className="text-gray-600">Download your materials data as an Excel spreadsheet for offline analysis and reporting.</p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Division</label>
                  <select
                    value={selectedDivision}
                    onChange={(e) => setSelectedDivision(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-base"
                  >
                    <option value="all">All Divisions</option>
                    <option value="RTG">RTG (Rubber Tired Gantry)</option>
                    <option value="CC">CC (Container Crane)</option>
                    <option value="ME">ME (Mechanical Equipment)</option>
                    <option value="Lain">Lain (Others)</option>
                  </select>
                  <p className="text-sm text-gray-500 mt-2">Choose which division's data you want to export. Select "All Divisions" to export complete inventory.</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <Key className="h-4 w-4 inline mr-2" />
                    Authentication Password
                  </label>
                  <input
                    type="password"
                    value={exportPassword}
                    onChange={(e) => setExportPassword(e.target.value)}
                    placeholder="Enter password to authorize export"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-base"
                  />
                  <div className="mt-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                    <p className="text-sm text-amber-800">
                      <span className="font-medium">Security Notice:</span> Password verification is required to export sensitive inventory data.
                    </p>
                  </div>
                </div>

                {/* Export Info */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Export Information</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>• File Format: Microsoft Excel (.xlsx)</p>
                    <p>• Includes: Material details, stock levels, locations, and images URLs</p>
                    <p>• Data Currency: Real-time as of export</p>
                    <p>• File Name: materials_{selectedDivision || 'all'}_{new Date().toISOString().split('T')[0]}.xlsx</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowExportModal(false);
                    setExportPassword('');
                    setSelectedDivision('');
                  }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                >
                  Cancel Export
                </button>
                <button
                  onClick={handleExport}
                  disabled={!exportPassword}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {exportPassword ? 'Download Excel File' : 'Enter Password to Export'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
