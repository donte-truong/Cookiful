export type LoginIconProps = {
  className?: string;
};

export function GoogleIcon({ className }: LoginIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.6 12.2C21.6 11.5 21.5 10.8 21.4 10.2H12V14H17.4C17.2 15.2 16.5 16.3 15.4 17V19.5H18.6C20.5 17.7 21.6 15.2 21.6 12.2Z"
        fill="#4285F4"
      />
      <path
        d="M12 22C14.7 22 17 21.1 18.6 19.5L15.4 17C14.5 17.6 13.3 18 12 18C9.4 18 7.2 16.2 6.5 13.9H3.2V16.4C4.8 19.7 8.1 22 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.5 13.9C6.3 13.3 6.2 12.7 6.2 12C6.2 11.3 6.3 10.7 6.5 10.1V7.6H3.2C2.5 8.9 2.1 10.4 2.1 12C2.1 13.6 2.5 15.1 3.2 16.4L6.5 13.9Z"
        fill="#FBBC05"
      />
      <path
        d="M12 6C13.4 6 14.6 6.5 15.5 7.3L18.7 4.2C17 2.6 14.7 1.6 12 1.6C8.1 1.6 4.8 3.9 3.2 7.6L6.5 10.1C7.2 7.8 9.4 6 12 6Z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AppleIcon({ className }: LoginIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M15.1 3.4C15.1 4.5 14.7 5.5 13.9 6.2C13 7 12 7.4 11 7.3C10.9 6.2 11.3 5.1 12.1 4.3C12.8 3.6 13.9 3.1 15.1 3.4Z"
        fill="currentColor"
      />
      <path
        d="M17.7 12.3C17.7 15 19.9 15.9 20 15.9C20 16 19.6 17.3 18.6 18.6C17.7 19.7 16.7 20.8 15.2 20.8C13.8 20.8 13.3 20 11.7 20C10.1 20 9.6 20.8 8.2 20.8C6.7 20.9 5.6 19.5 4.7 18.4C2.8 16.1 1.3 11.9 3.2 8.9C4.2 7.4 5.9 6.5 7.8 6.5C9.2 6.5 10.5 7.4 11.3 7.4C12.1 7.4 13.7 6.3 15.5 6.5C16.3 6.5 18.6 6.8 19.9 8.8C19.8 8.8 17.7 10 17.7 12.3Z"
        fill="currentColor"
      />
    </svg>
  );
}
