import { useEffect } from 'react';
import { useAppSelector } from '../../store/store';
import { appService } from '../../services/AppService';
import LandingPage from './LandingPage';

function index() {
    const loading = useAppSelector(state => state.utility.loading);
    const error = useAppSelector(state => state.utility.error);
    const group = useAppSelector(state => state.user.currentGroup);

    useEffect(() => {
        // Initialize the app service when component mounts
        appService.initialize().catch(console.error);
    }, []);

    const handleCreateGroup = async (data: { groupName: string; username: string }) => {
        try {
            await appService.createGroup(data.groupName, data.username);
        } catch (error) {
            console.error('Failed to create group:', error);
        }
    };

    return (
        <LandingPage
            onCreateGroup={handleCreateGroup}
            isLoading={loading}
            error={error}
            group={group}
        />
    )
}

export default index