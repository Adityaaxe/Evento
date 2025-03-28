import React from "react";

const PageSetup = ({ children }) => {
  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-900 to-black overflow-hidden z-0'>
      <div className='absolute top-30 left-10 animate-pulse z-0 '>
        <img
          src='/assets/bulb.png'
          className='glowing-icon'
          alt='Glowing Bulb'
        />
      </div>
      <div className='absolute bottom-40 right-40 animate-pulse z-0 '>
        <img
          src='/assets/bulb1.png'
          className='glowing-icon'
          alt='Glowing Icon'
        />
      </div>
      <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-bounce  z-0'>
        <img
          src='/assets/cube.png'
          className='glowing-icon'
          alt='Rotating Glowing Icon'
        />
      </div>
      <div className='absolute top-30 right-20 animate-bounce z-50 z-0'>
        <img
          src='/assets/trianglearrow.png'
          className='glowing-icon'
          alt='Bouncing Glowing Icon'
        />
      </div>
      <div className='absolute top-50 left-1/4 animate-bounce z-0'>
        <img
          src='/assets/trianglearrow.png'
          className='glowing-icon'
          alt='Slow Rotating Icon'
        />
      </div>
      <div className='absolute bottom-50 left-40 animate-bounce z-0'>
        <img
          src='/assets/pencil.png'
          className='glowing-icon'
          alt='Slow Rotating Icon'
        />
      </div>
      {children}
    </div>
  );
};

export default PageSetup;
