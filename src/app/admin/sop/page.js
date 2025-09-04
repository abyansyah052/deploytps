'use client';

import { useState, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import Navigation from '@/components/Navigation';

export default function AdminSopPage() {
  const [sopContent, setSopContent] = useState({
    title: '',
    content: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch current SOP content
  useEffect(() => {
    fetchSopContent();
  }, []);

  const fetchSopContent = async () => {
    try {
      const response = await fetch('/api/sop');
      if (response.ok) {
        const data = await response.json();
        setSopContent({
          title: data.title || '',
          content: data.content || ''
        });
      }
    } catch (error) {
      console.error('Error fetching SOP content:', error);
      setMessage('Error loading SOP content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!sopContent.title.trim() || !sopContent.content.trim()) {
      setMessage('Title and content are required');
      return;
    }

    setIsSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/sop', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sopContent),
      });

      if (response.ok) {
        setMessage('SOP content saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error || 'Failed to save'}`);
      }
    } catch (error) {
      console.error('Error saving SOP content:', error);
      setMessage('Error saving SOP content');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditorChange = (content) => {
    setSopContent(prev => ({
      ...prev,
      content: content
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">
            Edit SOP/Pemberitahuan
          </h1>

          {message && (
            <div className={`mb-4 p-3 rounded ${
              message.includes('Error') 
                ? 'bg-red-100 text-red-700 border border-red-300' 
                : 'bg-green-100 text-green-700 border border-green-300'
            }`}>
              {message}
            </div>
          )}

          <div className="space-y-6">
            {/* Title Input */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={sopContent.title}
                onChange={(e) => setSopContent(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter SOP/Pemberitahuan title"
              />
            </div>

            {/* Rich Text Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <Editor
                apiKey="n5fcjs12rnm1w9w787no0st4d00ne5kjbsca8orqoxp9ygbj"
                value={sopContent.content}
                onEditorChange={handleEditorChange}
                init={{
                  height: 500,
                  menubar: false,
                  plugins: [
                    'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
                    'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
                    'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
                  ],
                  toolbar: 'undo redo | blocks | ' +
                    'bold italic forecolor | alignleft aligncenter ' +
                    'alignright alignjustify | bullist numlist outdent indent | ' +
                    'removeformat | help',
                  content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className={`px-6 py-2 text-white rounded-md transition-colors ${
                  isSaving 
                    ? 'bg-blue-400 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
