import { UserBanner } from "@/app/user/[username]/components/banner";
import { UserPfp } from "@/app/user/[username]/components/pfp";
import { User } from "@/lib/db/schema";

type ProfileCardProps = { 
  user: User
  editable: boolean
}

export default function UserCard({ user, editable }: ProfileCardProps) {
  return (
    <div className="
      absolute inset-0 top-0 left-1/2 transform -translate-x-1/2
      w-full h-[var(--banner-height-small)] md:h-[var(--banner-height)]
    ">
      <UserBanner userId={user.id} banner={user.banner} editable={editable} />
      <div className="
        h-full container mx-auto
        pb-10 z-20
        flex items-end gap-10
      ">
        <UserPfp userId={user.id} image={user.image} editable={editable} />
        <div 
          className="
            z-20
            text-2xl font-bold text-foreground
          "
        >
          {user.name}
        </div>
      </div>
    </div>
  );
}