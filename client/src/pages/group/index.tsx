import GroupPage from './GroupPage';

function index() {
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
            isLoading={false}
        />
    )
}

export default index