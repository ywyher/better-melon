import AnimeData from "@/app/info/[id]/_components/data";

type Params = Promise<{ id: string }>

export default async function Info({ params }: { params: Params }) {
  const { id } = await params
  
  return (
    <div>
      <AnimeData id={id} />
    </div>
  );
}