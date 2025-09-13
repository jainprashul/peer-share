import CallPage from './CallPage';

function index() {
    return (
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
                // setAppState(prev => ({ ...prev, currentPage: 'group' }));
            }}
        />
    )
}

export default index