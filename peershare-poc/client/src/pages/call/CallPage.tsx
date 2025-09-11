import { useEffect, useRef } from 'react';
import type { CallPageProps } from '../../types';

const CallPage: React.FC<CallPageProps> = ({
  localStream,
  remoteStream,
  isConnecting,
  controls,
  onToggleMute,
  onToggleVideo,
  onToggleScreenShare,
  onEndCall
}) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  return (
    <div className="h-screen bg-black flex flex-col">
      {/* Video Container */}
      <div className="flex-1 relative">
        {/* Remote Video */}
        <div className="w-full h-full">
          {remoteStream ? (
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-800">
              <div className="text-center text-white">
                {isConnecting ? (
                  <>
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Connecting to peer...</p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <p>Waiting for peer to join...</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Local Video (Picture-in-Picture) */}
        <div className="absolute top-4 right-4 w-48 h-36 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
          {localStream ? (
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-12 h-12 bg-gray-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}
          <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
            You
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4">
        <div className="flex justify-center space-x-4">
          {/* Mute Button */}
          <button
            onClick={onToggleMute}
            className={`p-3 rounded-full ${
              controls.isMuted 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            } text-white transition-colors`}
            title={controls.isMuted ? 'Unmute' : 'Mute'}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              {controls.isMuted ? (
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.146 6.146a.5.5 0 01.708 0L14 7.293l1.146-1.147a.5.5 0 11.708.708L14.707 8l1.147 1.146a.5.5 0 01-.708.708L14 8.707l-1.146 1.147a.5.5 0 01-.708-.708L13.293 8l-1.147-1.146a.5.5 0 010-.708z" clipRule="evenodd" />
              )}
            </svg>
          </button>

          {/* Video Button */}
          <button
            onClick={onToggleVideo}
            className={`p-3 rounded-full ${
              !controls.isVideoEnabled 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            } text-white transition-colors`}
            title={controls.isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              {controls.isVideoEnabled ? (
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              ) : (
                <path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A1.001 1.001 0 0017 14v-4a1 1 0 00-.553-.894L14 7.382V6a2 2 0 00-2-2H4.382l-.675-.675a1 1 0 00-1.414 1.414L3.707 2.293zM12 10.382L2.618 1H12a2 2 0 012 2v7.382z" clipRule="evenodd" />
              )}
            </svg>
          </button>

          {/* Screen Share Button */}
          <button
            onClick={onToggleScreenShare}
            className={`p-3 rounded-full ${
              controls.isScreenSharing 
                ? 'bg-blue-600 hover:bg-blue-700' 
                : 'bg-gray-600 hover:bg-gray-700'
            } text-white transition-colors`}
            title={controls.isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v6h10V5H5z" clipRule="evenodd" />
              <path d="M8 15a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
            </svg>
          </button>

          {/* End Call Button */}
          <button
            onClick={onEndCall}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
            title="End call"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CallPage;
