'use client';

import { useState, useEffect } from 'react';
import Navigation from '../components/Navigation';
import { 
  BarChart3, 
  Package, 
  TrendingUp, 
  AlertTriangle,
  AlertCircle
} from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [sopContent, setSopContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchSopContent();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log('🔄 Fetching dashboard stats...');
      const response = await fetch('/api/dashboard/stats');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('✅ Dashboard stats received:', data);
      
      // Map the API response to expected format
      const mappedStats = {
        totalMaterials: data.totalMaterials || 0,
        categories: data.categories || [],
        statusStats: data.statusDistribution || [],
        topMaterials: data.topMaterials || [],
        recentActivity: data.recentActivity || 0,
        divisionStats: data.divisionStats || []
      };
      
      setStats(mappedStats);
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      // Set default stats when API fails
      setStats({
        totalMaterials: 0,
        activeEquipment: 0,
        categoryStats: [],
        statusStats: [
          { name: 'Active', count: 0 },
          { name: 'Inactive', count: 0 }
        ],
        recentActivity: 0,
        divisionStats: []
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSopContent = async () => {
    try {
      console.log('🔄 Fetching SOP content...');
      const response = await fetch('/api/sop');
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ SOP content received:', data);
        setSopContent(data);
      }
    } catch (error) {
      console.error('❌ Error fetching SOP content:', error);
      // Set default SOP content
      setSopContent({
        title: 'SOP/Pemberitahuan',
        content: '<p>Belum ada SOP atau pemberitahuan yang ditambahkan.</p>',
        updatedAt: new Date().toISOString()
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load dashboard</h2>
            <p className="text-gray-600">Please check your connection and try again.</p>
            <button
              onClick={fetchStats}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Package className="h-6 w-6 text-gray-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Materials</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalMaterials.toLocaleString()}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Categories</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.categories.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Recent Activity</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.recentActivity}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Category Distribution */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Category Distribution</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {(stats?.divisionStats || []).map((division) => {
                const percentage = (parseInt(division.count) / stats.totalMaterials) * 100;
                // Map division colors
                const getColorByDivision = (divisionName) => {
                  switch(divisionName?.toLowerCase()) {
                    case 'rtg': return 'bg-blue-500';
                    case 'cc': return 'bg-green-500';
                    case 'me': return 'bg-yellow-500';
                    case 'lain': return 'bg-gray-500';
                    default: return 'bg-blue-500';
                  }
                };
                
                return (
                  <div key={division.divisi} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${getColorByDivision(division.divisi)} mr-3`}></div>
                      <span className="text-sm font-medium text-gray-900">
                        {division.divisi || 'Lain'}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-blue-700 mr-2">
                        {percentage.toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-500">
                        ({parseInt(division.count).toLocaleString()})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Status Distribution</h3>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {stats.statusStats.map((status) => {
                const percentage = (parseInt(status.count) / stats.totalMaterials) * 100;
                const isActive = status.name === 'Active';
                const bgColor = isActive ? 'bg-green-500' : 'bg-red-500';
                const textColor = isActive ? 'text-green-700' : 'text-red-700';
                
                return (
                  <div key={status.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full ${bgColor} mr-3`}></div>
                      <span className="text-sm font-medium text-gray-900">
                        {status.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className={`text-sm font-medium ${textColor} mr-2`}>
                        {percentage.toFixed(1)}%
                      </span>
                      <span className="text-sm text-gray-500">
                        ({parseInt(status.count).toLocaleString()})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* SOP & Pemberitahuan Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {sopContent?.title || 'SOP/Pemberitahuan'}
            </h3>
          </div>
          <div className="p-6">
            {!sopContent ? (
              <div className="text-center py-8">
                <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Loading SOP content...</h3>
              </div>
            ) : (
              <div 
                className="tinymce-content"
                dangerouslySetInnerHTML={{ __html: sopContent.content }}
              />
            )}
            {sopContent && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  Last updated: {new Date(sopContent.updatedAt).toLocaleDateString('id-ID', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
