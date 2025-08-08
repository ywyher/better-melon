import { UserBanner } from "@/app/user/[username]/components/banner";
import { UserPfp } from "@/app/user/[username]/components/pfp";
import { User } from "@/lib/db/schema";

type ProfileCardProps = { user: User }

export default function UserCard({ user }: ProfileCardProps) {
  return (
    <div className="w-full">
      <UserBanner user={user}  />
      <UserPfp user={user} />
    </div>
  );
}