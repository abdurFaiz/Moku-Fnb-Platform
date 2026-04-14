import { User } from "lucide-react";
import { useState } from "react";
import UserInfo from "./UserInfo";
import { useAuth } from "@/features/auth/hooks/auth.hooks";

export default function UserInfoCard() {
  const { user } = useAuth();
  const [imageError, setImageError] = useState(false);
  const rawAvatarUrl = user?.avatar_url || user?.customer_profile?.avatar;

  // Fix the avatar URL if it's using localhost without port
  const avatarUrl = rawAvatarUrl
    ? rawAvatarUrl.replace('http://localhost/', 'http://localhost:8000/')
    : null;

  // Show icon if no URL, image failed to load, or user is not available
  const showIcon = !avatarUrl || imageError || !user;

  return (
    <header className="relative bg-linear-to-r from-dark-yellow to-primary-orange px-4 pt-8 pb-12 rounded-b-3xl overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0             size-full opacity-55">
        <img loading="lazy" src="/icons/beans-bg-2.svg" alt="" />
      </div>
      <div className="absolute left-[330px] bottom-0 size-full opacity-55">
        <img loading="lazy" src="/icons/beans-bg-1.svg" alt="" />
      </div>
      <div className="flex flex-row gap-3 items-center">
        {/* Profile Photo */}
        <div className="relative z-10 shrink-0">
          <div className="size-24 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/40 flex items-center justify-center overflow-hidden">
            {showIcon ? (
              <User strokeWidth={1} className="size-10 text-white" />
            ) : (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={() => {
                  console.error('Failed to load avatar:', avatarUrl);
                  setImageError(true);
                }}
                onLoad={() => setImageError(false)}
              />
            )}
          </div>
        </div>
        {/* Header content */}
        <UserInfo />
      </div>
    </header>
  );
}