import React from 'react';

export default function LoginSignupButton({
  children = (
    <>
      <span className="text-blue-500 font-semibold">Login / Sign Up</span>
    </>
  ),
  className = '',
}) {
  const handleClick = () => {
    const callbackUrl = encodeURIComponent(window.location.href);
    window.location.href = `/auth/login?callbackUrl=${callbackUrl}`;
  };

  return (
    <button className={className} onClick={handleClick}>
      {children}
    </button>
  );
}
