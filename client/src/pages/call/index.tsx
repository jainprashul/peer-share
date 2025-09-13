import { useAppSelector } from '../../store/store';
import { appService } from '../../services/AppService';
import CallPage from './CallPage';

function index() {
    const localStream = useAppSelector(state => state.user.localStream);
    const remoteStream = useAppSelector(state => state.user.remoteStream);
    const isConnecting = useAppSelector(state => state.user.isConnecting);
    const isMuted = useAppSelector(state => state.user.isMuted);
    const isVideoEnabled = useAppSelector(state => state.user.isVideoEnabled);
    const isScreenSharing = useAppSelector(state => state.user.isScreenSharing);

    const handleToggleMute = () => {
        appService.toggleMute();
    };

    const handleToggleVideo = () => {
        appService.toggleVideo();
    };

    const handleToggleScreenShare = async () => {
        try {
            await appService.toggleScreenShare();
        } catch (error) {
            console.error('Failed to toggle screen share:', error);
        }
    };

    const handleEndCall = () => {
        appService.endCall();
    };

    return (
        <CallPage
            localStream={localStream}
            remoteStream={remoteStream}
            isConnecting={isConnecting}
            controls={{
                isMuted,
                isVideoEnabled,
                isScreenSharing
            }}
            onToggleMute={handleToggleMute}
            onToggleVideo={handleToggleVideo}
            onToggleScreenShare={handleToggleScreenShare}
            onEndCall={handleEndCall}
        />
    )
}

export default index