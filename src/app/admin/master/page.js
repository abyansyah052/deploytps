'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Settings } from 'lucide-react';

export default function MasterAdminPage() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeDropdownType, setActiveDropdownType] = useState('store_rooms');
  const [dropdownData, setDropdownData] = useState({});
  const [newDropdownItem, setNewDropdownItem] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('RTG');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check authentication status
    const authStatus = sessionStorage.getItem('masterAdminAuth');
    const authTime = sessionStorage.getItem('masterAdminAuthTime');
    const currentTime = new Date().getTime();
    
    // Session expires after 1 hour (3600000 ms)
    if (authStatus === 'authenticated' && authTime && (currentTime - parseInt(authTime)) < 3600000) {
      setIsAuthenticated(true);
      fetchDropdownData();
    } else {
      // Clear expired session
      sessionStorage.removeItem('masterAdminAuth');
      sessionStorage.removeItem('masterAdminAuthTime');
      router.push('/admin');
    }
  }, [router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDropdownData();
    }
  }, [isAuthenticated]);

  const fetchDropdownData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/master/dropdowns');
      if (response.ok) {
        const data = await response.json();
        setDropdownData(data);
      } else {
        setError('Failed to fetch dropdown data');
      }
    } catch (error) {
      setError('Error fetching data');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddDropdownItem = async () => {
    if (!newDropdownItem.trim()) return;
    
    try {
      const payload = {
        type: activeDropdownType,
        value: newDropdownItem.trim(),
      };

      if (activeDropdownType === 'machine_numbers') {
        payload.division = selectedDivision;
      }

      const response = await fetch('/api/master/dropdowns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchDropdownData();
        setNewDropdownItem('');
        setError('');
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add dropdown item');
      }
    } catch (error) {
      console.error('Error adding dropdown item:', error);
      setError('Error adding dropdown item');
    }
  };

  const handleDeleteDropdownItem = async (value, division = null) => {
    try {
      const payload = {
        type: activeDropdownType,
        value: value,
      };

      if (activeDropdownType === 'machine_numbers' && division) {
        payload.division = division;
      }

      const response = await fetch('/api/master/dropdowns', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        await fetchDropdownData();
        setError('');
      } else {
        setError('Failed to delete dropdown item');
      }
    } catch (error) {
      console.error('Error deleting dropdown item:', error);
      setError('Error deleting dropdown item');
    }
  };

  const dropdownTypes = [
    { key: 'store_rooms', label: 'Store Rooms' },
    { key: 'units_of_measure', label: 'Units of Measure' },
    { key: 'machine_numbers', label: 'Machine Numbers' },
    { key: 'divisions', label: 'Divisions' }
  ];

  // Show loading or redirect if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  const renderDropdownItems = () => {
    if (loading) {
      return (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      );
    }

    if (activeDropdownType === 'machine_numbers') {
      const machineNumbers = dropdownData.machine_numbers || {};
      const divisions = ['RTG', 'CC', 'ME', 'LAIN'];
      
      return (
        <div className="space-y-4">
          {divisions.map(division => (
            <div key={division} className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-700 mb-3">{division}</h4>
              <div className="space-y-2">
                {(machineNumbers[division] || []).map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-3 rounded border hover:shadow-sm transition-shadow">
                    <span className="font-medium">{item}</span>
                    <button
                      onClick={() => handleDeleteDropdownItem(item, division)}
                      className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                      title="Delete item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {(machineNumbers[division] || []).length === 0 && (
                  <p className="text-gray-500 text-sm italic py-2">No items yet</p>
                )}
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      const items = dropdownData[activeDropdownType] || [];
      return (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors">
              <span className="font-medium">{item}</span>
              <button
                onClick={() => handleDeleteDropdownItem(item)}
                className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                title="Delete item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-gray-500 text-sm italic py-4 text-center">No items yet</p>
          )}
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Admin
              </button>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-purple-600" />
                <h1 className="text-xl font-semibold text-gray-900">Master Admin Dashboard</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            Error: {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-sm">
          {/* Tabs Header */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6 overflow-x-auto">
              {dropdownTypes.map((type) => (
                <button
                  key={type.key}
                  onClick={() => setActiveDropdownType(type.key)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 transition-colors ${
                    activeDropdownType === type.key
                      ? 'border-purple-500 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{type.icon}</span>
                  <span>{type.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Manage {dropdownTypes.find(t => t.key === activeDropdownType)?.label}
              </h2>
              
              {/* Add New Item Form */}
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <div className="flex space-x-4">
                  {activeDropdownType === 'machine_numbers' && (
                    <select
                      value={selectedDivision}
                      onChange={(e) => setSelectedDivision(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="RTG">RTG</option>
                      <option value="CC">CC</option>
                      <option value="ME">ME</option>
                      <option value="LAIN">LAIN</option>
                    </select>
                  )}
                  <input
                    type="text"
                    value={newDropdownItem}
                    onChange={(e) => setNewDropdownItem(e.target.value)}
                    placeholder={`Add new ${dropdownTypes.find(t => t.key === activeDropdownType)?.label.toLowerCase()}`}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddDropdownItem()}
                  />
                  <button
                    onClick={handleAddDropdownItem}
                    disabled={!newDropdownItem.trim()}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add</span>
                  </button>
                </div>
              </div>

              {/* Items List */}
              {renderDropdownItems()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
