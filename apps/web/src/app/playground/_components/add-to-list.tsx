import AddToList from "@/components/add-to-list/add-to-list";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export default function AddToListPlayground() {

  const getAnilistToken = async () => {
    const { data: token } = await authClient.getAccessToken({
      providerId: 'anilist',
    })

    console.log(token)
  }

  return (
    <div className="flex flex-col gap-3">
      <Button
        className="w-fit"
        onClick={() => getAnilistToken()}
      >
        Get Access Token Anilist
      </Button>
      <AddToList
        animeId={20661}
      />
    </div>
  )
}