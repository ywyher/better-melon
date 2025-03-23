import Subs from "@/app/subs/[id]/[ep]/_components/subs";

type Params = Promise<{ id: string, ep: string }>

export default async function Watch({ params }: { params: Params }) {
    const { id, ep } = await params;

    return (
      <div className="container mx-auto px-4 py-6">
        <Subs id={id} ep={ep} />
      </div>
    );
}