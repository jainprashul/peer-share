import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useAppSelector } from '../../store/store';
import { appService } from '../../services/AppService';
import GroupPage from './GroupPage';
import { peerJSService } from '../../services/PeerJSService';

function index() {
    const { groupId } = useParams<{ groupId?: string }>();
    const [username, setUsername] = useState<string>('');
    const [showUsernameForm, setShowUsernameForm] = useState(false);
    
    const loading = useAppSelector(state => state.utility.loading);
    const group = useAppSelector(state => state.user.currentGroup);
    const members = useAppSelector(state => state.user.members);
    const currentUser = useAppSelector(state => state.user.currentUser);

    useEffect(() => {
        // Initialize PeerJS first
        const initializePeer = async () => {
            await peerJSService.initializePeer(currentUser?.id!)
        }
        if (currentUser?.id) {
            initializePeer();
        }
        // If we have a group ID but no current group, show username form
        if (groupId && !group && !currentUser?.id) {
            setShowUsernameForm(true);
        }
    }, [groupId, group, currentUser?.id]);

    const handleJoinGroup = async (username: string) => {
        if (!groupId) return;
        
        try {
            await appService.joinGroup(groupId, username);
            setShowUsernameForm(false);
        } catch (error) {
            console.error('Failed to join group:', error);
        }
    };

    const handleStartCall = async (targetUserId: string) => {
        try {
            await appService.startCall(targetUserId);
        } catch (error) {
            console.error('Failed to start call:', error);
        }
    };

    const handleLeaveGroup = async () => {
        try {
            await appService.leaveGroup();
        } catch (error) {
            console.error('Failed to leave group:', error);
        }
    };

    // Show username form if needed
    if (showUsernameForm) {
        return (
            <div className="max-w-md mx-auto mt-8">
                <div className="bg-white shadow-md rounded-lg px-8 pt-6 pb-8 mb-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                        Join Group
                    </h2>
                    <form onSubmit={(e) => {
                        e.preventDefault();
                        if (username.trim()) {
                            handleJoinGroup(username.trim());
                        }
                    }} className="space-y-4">
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
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !username.trim()}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Joining...' : 'Join Group'}
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <GroupPage
            group={group}
            members={members}
            currentUser={currentUser}
            onStartCall={handleStartCall}
            onLeaveGroup={handleLeaveGroup}
            isLoading={loading}
        />
    )
}

export default index