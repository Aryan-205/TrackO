import { prisma } from '@/db/prisma';
import RoomDisplay from '@/components/RoomDisplay';

export default async function Room({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  const room = await prisma.room.findUnique({
    where: {
      slug,
    },
  });

  if (!room) {
    return <div>Something went wrong, Please try again later</div>;
  }

  return <RoomDisplay room={room} />;
}