import { Shield } from 'lucide-react';

export default function UserAvatar({ user, size = 'md', showVerified = true }) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };

  const verifiedSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6',
  };

  return (
    <div className="relative inline-block">
      <img
        src={user?.avatar_url}
        alt={user?.username}
        className={`${sizeClasses[size]} rounded-full object-cover border-2 border-gray-200`}
      />
      {showVerified && user?.is_verified && (
        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1 border-2 border-white">
          <Shield className={`${verifiedSizeClasses[size]} text-white`} />
        </div>
      )}
    </div>
  );
}