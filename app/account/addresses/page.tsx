import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AddressesClient } from '@/components/account/addresses-client';
import { auth } from '@/lib/auth/config';
import { getUserAddresses } from '@/lib/queries/addresses';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AddressesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const addresses = await getUserAddresses(session.user.id);

  return <AddressesClient addresses={addresses} />;
}
