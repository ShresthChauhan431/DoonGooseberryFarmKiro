import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AddressesClient } from '@/components/account/addresses-client';
import { AccountMobileNav } from '@/components/account/mobile-nav';
import { auth } from '@/lib/auth/config';
import { getUserAddresses } from '@/lib/queries/addresses';

export const dynamic = 'force-dynamic';

export default async function AddressesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/login');
  }

  const addresses = await getUserAddresses(session.user.id);

  return (
    <>
      <AccountMobileNav />
      <AddressesClient addresses={addresses} />
    </>
  );
}
