import { useAppSelector } from '../../store/store';
import LandingPage from './LandingPage';

function index() {
    const loading = useAppSelector(state => state.utility.loading);
    const error = useAppSelector(state => state.utility.error);
    // const data = useAppSelector(state => state.utility.data);

    return (
        <LandingPage
            onCreateGroup={(data) => {
                console.log('Creating group:', data);
                // setAppState(prev => ({ ...prev, currentPage: 'call' }));
                // TODO: Implement group creation
            }}
            isLoading={loading}
            error={error}
        />
    )
}

export default index