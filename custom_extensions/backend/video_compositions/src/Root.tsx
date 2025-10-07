import React from 'react';
import { Composition } from 'remotion';
import { AvatarServiceSlide } from './AvatarServiceSlide';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="AvatarServiceSlide"
        component={AvatarServiceSlide}
        durationInFrames={900} // 30 seconds at 30fps
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          title: 'Default Title',
          subtitle: 'Default Subtitle',
          content: 'Default Content',
          theme: 'dark-purple',
          elementPositions: {},
          slideId: 'default-slide',
          avatarVideoPath: '',
          duration: 30
        }}
      />
    </>
  );
};
