import type { GroupPageProps } from '../../types';

const GroupPage: React.FC<GroupPageProps> = ({
  group,
  members,
  currentUser,
  onStartCall,
  onLeaveGroup,
  isLoading
}) => {
  const canStartCall = members.length === 2 && !isLoading;

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {group?.name || 'Loading...'}
          </h2>
          <button
            onClick={onLeaveGroup}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Leave Group
          </button>
        </div>

        {group && (
          <div className="mb-6 text-sm text-gray-600">
            <p>Group ID: {group.id}</p>
            <p>Created: {new Date(group.createdAt).toLocaleString()}</p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Members ({members.length})
          </h3>
          
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                    {member.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {member.username}
                      {member.id === currentUser?.id && ' (You)'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Online • {member.peerId ? 'Ready for calls' : 'Connecting...'}
                    </p>
                  </div>
                </div>
                
                {member.id !== currentUser?.id && canStartCall && (
                  <button
                    onClick={() => onStartCall(member.id)}
                    className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  >
                    Call
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {!canStartCall && members.length < 2 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Waiting for another member
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Share the group URL with someone to start a video call. Phase 1 supports 2 users maximum.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {members.length > 2 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Group is full
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Phase 1 supports a maximum of 2 users per group for P2P video calling.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Share this URL to invite others: {window.location.href}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GroupPage;
