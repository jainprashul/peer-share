import LandingPage from './LandingPage';

function index() {
    return (
        <LandingPage
            onCreateGroup={(data) => {
                console.log('Creating group:', data);
                // setAppState(prev => ({ ...prev, currentPage: 'call' }));
                // TODO: Implement group creation
            }}
            isLoading={false}
            error={null}
        />
    )
}

export default index