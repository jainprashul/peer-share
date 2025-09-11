import { useState } from 'react';
import type { AppState } from './types';
import LandingPage from './pages/home/LandingPage';
import GroupPage from './pages/group/GroupPage';
import CallPage from './pages/call/CallPage';

function App() {
  const [appState, setAppState] = useState<AppState>({
    currentPage: 'landing',
    isLoading: false,
    error: null
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">PeerShare</h1>
            <div className="text-sm text-gray-500">Phase 1 POC</div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {appState.error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {appState.error}
          </div>
        )}

        {appState.currentPage === 'landing' && (
          <LandingPage
            onCreateGroup={(data) => {
              console.log('Creating group:', data);
              setAppState(prev => ({ ...prev, currentPage: 'call' }));
              // TODO: Implement group creation
            }}
            isLoading={appState.isLoading}
            error={appState.error}
          />
        )}

        {appState.currentPage === 'group' && (
          <GroupPage
            group={null}
            members={[]}
            currentUser={null}
            onStartCall={(targetUserId) => {
              console.log('Starting call with:', targetUserId);
              // TODO: Implement call initiation
              setAppState(prev => ({ ...prev, currentPage: 'call' }));
            }}
            onLeaveGroup={() => {
              setAppState(prev => ({ ...prev, currentPage: 'landing' }));
            }}
            isLoading={appState.isLoading}
          />
        )}

        {appState.currentPage === 'call' && (
          <CallPage
            localStream={null}
            remoteStream={null}
            isConnecting={false}
            controls={{
              isMuted: false,
              isVideoEnabled: true,
              isScreenSharing: false
            }}
            onToggleMute={() => console.log('Toggle mute')}
            onToggleVideo={() => console.log('Toggle video')}
            onToggleScreenShare={() => console.log('Toggle screen share')}
            onEndCall={() => {
              setAppState(prev => ({ ...prev, currentPage: 'group' }));
            }}
          />
        )}
      </main>
    </div>
  );
}

export default App;
