'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, Upload, Download, Search, Package, ArrowLeft, ArrowUpDown, ArrowUp, ArrowDown, FileSpreadsheet, Key } from 'lucide-react';
import GoogleDriveImage from '../../components/GoogleDriveImage';

export default function Management() {
  const router = useRouter();
  const [materials, setMaterials] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [dropdownData, setDropdownData] = useState({
    divisions: [],
    store_rooms: [],
    units_of_measure: [],
    system_locations: [],
    physical_locations: [],
    machine_placements: [],
    subsystem_placements: [],
    material_status: [],
    machine_numbers: { RTG: [], CC: [], ME: [], LAIN: [] }
  });
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
    deskripsi_penempatan: '',
    placement_description: '',
    machine_number: ''
  });

  useEffect(() => {
    fetchMaterials();
    fetchCategories();
    fetchDropdownData();
  }, [fetchMaterials]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [searchTerm, selectedCategory, selectedStatus, sortField, sortOrder]);

  const fetchMaterials = useCallback(async () => {
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
      console.log('📊 Management - API Response:', data);
      setMaterials(data.data || []);
      setPagination(data.pagination || {});
    } catch (error) {
      console.error('Error fetching materials:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, searchTerm, selectedCategory, selectedStatus, sortField, sortOrder]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      const data = await response.json();
      setCategories(data.divisionStats.map((d) => d.divisi));
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchDropdownData = async () => {
    try {
      const response = await fetch('/api/master/dropdowns');
      if (response.ok) {
        const data = await response.json();
        setDropdownData(data);
      } else {
        console.error('Failed to fetch dropdown data');
      }
    } catch (error) {
      console.error('Error fetching dropdown data:', error);
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
      deskripsi_penempatan: material.deskripsi_penempatan || '',
      placement_description: material.placement_description || '',
      machine_number: material.machine_number || ''
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
      deskripsi_penempatan: '',
      placement_description: '',
      machine_number: ''
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
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-gray-900 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900 font-medium focus:ring-blue-500 focus:border-blue-500"
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
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-900 font-medium focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <button
                onClick={resetFilters}
                className="px-3 py-1.5 text-sm text-gray-700 font-medium hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
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
              {materials.map((material) => (
                <div key={material.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-150">
                  {/* Mobile-First Layout */}
                  <div className="space-y-4">
                    {/* Header with Status */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-base sm:text-lg font-medium text-gray-900 truncate">
                          {material.nama_material || 'Unnamed Material'}
                        </h4>
                        <p className="text-sm text-gray-500 font-mono mt-1">
                          {material.kode_material || 'No Code'}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-3 flex-shrink-0 ${
                        material.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800' 
                          : material.status === 'No Status'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {material.status}
                      </span>
                    </div>

                    {/* Material Info Grid - Mobile Responsive */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-gray-500 block">Division:</span>
                        <p className="text-gray-900 truncate">{material.division || material.divisi || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500 block">Store Room:</span>
                        <p className="text-gray-900 truncate">{material.store_room || material.kategori || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500 block">Unit:</span>
                        <p className="text-gray-900 truncate">{material.unit_of_measure || material.satuan || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500 block">Machine:</span>
                        <p className="text-gray-900 truncate">{material.machine_number || 'N/A'}</p>
                      </div>
                    </div>

                    {/* Additional Info - Collapsible on mobile */}
                    {(material.system_location || material.physical_location || material.machine_placement || material.lokasi_sistem || material.lokasi_fisik || material.penempatan_pada_alat) && (
                      <div className="text-sm text-gray-600">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {(material.system_location || material.lokasi_sistem) && (
                            <div>
                              <span className="font-medium">System:</span>
                              <span className="ml-1 block sm:inline truncate">{material.system_location || material.lokasi_sistem}</span>
                            </div>
                          )}
                          {(material.physical_location || material.lokasi_fisik) && (
                            <div>
                              <span className="font-medium">Physical:</span>
                              <span className="ml-1 block sm:inline truncate">{material.physical_location || material.lokasi_fisik}</span>
                            </div>
                          )}
                          {(material.machine_placement || material.penempatan_pada_alat) && (
                            <div>
                              <span className="font-medium">Equipment:</span>
                              <span className="ml-1 block sm:inline truncate">{material.machine_placement || material.penempatan_pada_alat}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Image and Actions Row */}
                    <div className="flex items-center justify-between">
                      {/* Image */}
                      <div className="flex-shrink-0">
                        {material.image_url ? (
                          <GoogleDriveImage 
                            url={material.image_url}
                            alt={material.nama_material}
                            className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg object-cover border border-gray-200"
                            showErrorDetails={false}
                          />
                        ) : (
                          <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <Package className="h-4 w-4 sm:h-6 sm:w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons - Mobile Responsive */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(material)}
                          className="inline-flex items-center px-2 sm:px-3 py-1.5 border border-gray-300 shadow-sm text-xs sm:text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </button>
                        <button
                          onClick={() => handleDelete(material.id)}
                          className="inline-flex items-center px-2 sm:px-3 py-1.5 border border-red-300 shadow-sm text-xs sm:text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
                          <span className="hidden sm:inline">Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile-Friendly Results Info */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-6">
          <p className="text-sm sm:text-base text-gray-600">
            Showing {materials.length} of {pagination.total.toLocaleString()} materials
          </p>
          <div className="text-sm text-gray-500">
            Page {pagination.page} of {pagination.totalPages}
          </div>
        </div>

        {/* Mobile-Friendly Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 order-2 sm:order-1">
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              disabled={pagination.page <= 1}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              Previous
            </button>
            
            <span className="px-3 py-2 text-sm text-gray-700 hidden sm:inline">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            
            <button
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation"
            >
              Next
            </button>
          </div>
          
          <div className="text-sm text-gray-600 order-1 sm:order-2">
            Total: {pagination.total.toLocaleString()} items
          </div>
        </div>
      </div>

      {/* Mobile-Friendly Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-4 sm:top-20 mx-auto p-3 sm:p-5 border w-full sm:w-11/12 max-w-4xl shadow-lg rounded-md bg-white min-h-screen sm:min-h-0">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingMaterial ? 'Edit Material' : 'Add New Material'}
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="sm:hidden p-2 text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
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
                      onChange={(e) => setFormData({ ...formData, divisi: e.target.value, machine_number: '' })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Division</option>
                      {dropdownData.divisions.map((division, index) => (
                        <option key={index} value={division}>{division}</option>
                      ))}
                    </select>
                  </div>

                  {/* Machine Number - only show for RTG, CC, ME */}
                  {formData.divisi && ['RTG', 'CC', 'ME'].includes(formData.divisi) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Machine Number</label>
                      <select
                        value={formData.machine_number}
                        onChange={(e) => setFormData({ ...formData, machine_number: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Machine Number</option>
                        {(dropdownData.machine_numbers[formData.divisi] || []).map((machine, index) => (
                          <option key={index} value={machine}>{machine}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Store Room *</label>
                    <select
                      value={formData.kategori}
                      onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Store Room</option>
                      {dropdownData.store_rooms.map((room, index) => (
                        <option key={index} value={room}>{room}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Unit of Measure *</label>
                    <select
                      value={formData.satuan}
                      onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    >
                      <option value="">Select Unit of Measure</option>
                      {dropdownData.units_of_measure.map((unit, index) => (
                        <option key={index} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select Status</option>
                      {dropdownData.material_status.map((status, index) => (
                        <option key={index} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location Information */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Location Information</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">System Location</label>
                      <select
                        value={formData.lokasi_sistem}
                        onChange={(e) => setFormData({ ...formData, lokasi_sistem: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select System Location</option>
                        {dropdownData.system_locations.map((location, index) => (
                          <option key={index} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Physical Location</label>
                      <select
                        value={formData.lokasi_fisik}
                        onChange={(e) => setFormData({ ...formData, lokasi_fisik: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Physical Location</option>
                        {dropdownData.physical_locations.map((location, index) => (
                          <option key={index} value={location}>{location}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Equipment Placement */}
                <div className="border-t pt-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Equipment Placement</h4>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tempat Penempatan Pada Mesin</label>
                      <select
                        value={formData.penempatan_pada_alat}
                        onChange={(e) => setFormData({ ...formData, penempatan_pada_alat: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Machine Placement</option>
                        {dropdownData.machine_placements && dropdownData.machine_placements.map((placement, index) => (
                          <option key={index} value={placement}>{placement}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tempat Penempatan Sub System</label>
                      <select
                        value={formData.deskripsi_penempatan}
                        onChange={(e) => setFormData({ ...formData, deskripsi_penempatan: e.target.value })}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Subsystem Placement</option>
                        {dropdownData.subsystem_placements && dropdownData.subsystem_placements.map((placement, index) => (
                          <option key={index} value={placement}>{placement}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {/* Placement Description */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700">Placement Description</label>
                    <textarea
                      value={formData.placement_description}
                      onChange={(e) => setFormData({ ...formData, placement_description: e.target.value })}
                      rows="3"
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Describe the detailed placement of this material..."
                    />
                    <p className="mt-1 text-xs text-gray-500">Provide detailed description about where exactly this material is placed</p>
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
                      For Google Drive: Make sure the file is shared with &quot;Anyone with the link can view&quot;
                    </p>
                    {formData.image_url && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-2">Preview:</p>
                        <GoogleDriveImage 
                          url={formData.image_url}
                          alt="Preview"
                          className="h-20 w-20 object-cover rounded-md border border-gray-200"
                          showErrorDetails={false}
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
                  <p className="text-sm text-gray-500 mt-2">Choose which division&apos;s data you want to export. Select &quot;All Divisions&quot; to export complete inventory.</p>
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
