import React, { useRef, useEffect, forwardRef } from 'react';

interface VideoFeedProps {
    stream: MediaStream | null;
    muted?: boolean;
}

const VideoFeed = forwardRef<HTMLVideoElement, VideoFeedProps>(({ stream, muted = true }, ref) => {
    const internalVideoRef = useRef<HTMLVideoElement>(null);
    const videoRef = ref || internalVideoRef;

    useEffect(() => {
        const currentVideoEl = (videoRef as React.RefObject<HTMLVideoElement>)?.current;
        if (currentVideoEl && stream) {
            if (currentVideoEl.srcObject !== stream) {
                currentVideoEl.srcObject = stream;
            }
        }
    }, [stream, videoRef]);

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={muted}
            className="object-cover w-full h-full"
        />
    );
});

export default VideoFeed;
