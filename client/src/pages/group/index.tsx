import { useAppSelector } from '../../store/store';
import GroupPage from './GroupPage';

function index() {
    const loading = useAppSelector(state => state.utility.loading);
    return (
        <GroupPage
            group={null}
            members={[]}
            currentUser={null}
            onStartCall={(targetUserId) => {
                console.log('Starting call with:', targetUserId);
                // TODO: Implement call initiation
                //   setAppState(prev => ({ ...prev, currentPage: 'call' }));
            }}
            onLeaveGroup={() => {
                //   setAppState(prev => ({ ...prev, currentPage: 'landing' }));
            }}
            isLoading={loading}
        />
    )
}

export default index