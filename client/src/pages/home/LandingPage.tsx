import { useState } from 'react';
import type { LandingPageProps } from '../../types';
import type { CreateGroupForm } from '@peer-share/shared';
const LandingPage: React.FC<LandingPageProps> = ({ onCreateGroup, isLoading, group }) => {
  const [formData, setFormData] = useState<CreateGroupForm>({
    groupName: '',
    username: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.groupName.trim() && formData.username.trim()) {
      onCreateGroup(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Create a Group
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="groupName"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Group Name
            </label>
            <input
              type="text"
              id="groupName"
              name="groupName"
              value={formData.groupName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter group name"
              required
            />
          </div>

          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Your Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter your username"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !formData.groupName.trim() || !formData.username.trim()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating Group...' : 'Create Group'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Or join an existing group by clicking on an invite link
          </p>
        </div>
      </div>

      {group && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-green-800 mb-2">Group Created!</h3>
          <p className="text-sm text-green-700 mb-2">
            Share this URL to invite others:
          </p>
          <div className="bg-white border border-green-300 rounded p-2 text-xs font-mono text-gray-800 break-all">
            {window.location.origin}/group/{group.id}
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">Phase 1 Features:</h3>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Create and join groups</li>
          <li>• P2P video calling (2 users max)</li>
          <li>• Basic screen sharing</li>
          <li>• Simple call controls</li>
        </ul>
      </div>
    </div>
  );
};

export default LandingPage;
