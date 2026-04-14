import { useAuth } from "@/features/auth/hooks/auth.hooks";

interface UserInfoProps {
  name?: string;
}

export default function UserInfo({ name }: UserInfoProps = {}) {
  const { user, isLoadingProfile } = useAuth();

  // Use props if provided, otherwise use data from API
  const displayName = name || user?.name || "-";
  const displayEmail = user?.email || "-";

  if (isLoadingProfile) {
    return (
      <div className="relative z-10">
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded mb-2 w-48"></div>
          <div className="h-6 bg-white/20 rounded w-32"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10">
      <h1 className="text-white text-2xl font-medium line-clamp-1">
        Hi, {displayName} 👋
      </h1>
      <p className="text-white text-base">
        {displayEmail}
      </p>
    </div>
  );
}
