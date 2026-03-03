'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { CheckCircle2, Loader2, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { checkPincodeServiceability } from '@/lib/actions/addresses';
import type { Address } from '@/lib/queries/addresses';

// Address validation schema
const addressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z
    .string()
    .regex(/^\d{6}$/, 'Pincode must be exactly 6 digits')
    .min(6, 'Pincode must be 6 digits')
    .max(6, 'Pincode must be 6 digits'),
  phone: z
    .string()
    .regex(/^\d{10}$/, 'Phone number must be exactly 10 digits')
    .min(10, 'Phone number must be 10 digits')
    .max(10, 'Phone number must be 10 digits'),
});

type AddressFormValues = z.infer<typeof addressSchema>;

interface AddressFormProps {
  savedAddresses?: Address[];
}

export function AddressForm({ savedAddresses = [] }: AddressFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [isCheckingPincode, setIsCheckingPincode] = useState(false);
  const [pincodeStatus, setPincodeStatus] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  // Initialize form with react-hook-form and zod validation
  const form = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
    },
  });

  const handleSelectAddress = (address: Address) => {
    setSelectedAddressId(address.id);
    form.reset({
      name: address.name,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      phone: address.phone,
    });
    // Auto-check serviceability when selecting a saved address
    handleCheckServiceability(address.pincode);
  };

  const handleClearSelection = () => {
    setSelectedAddressId(null);
    form.reset({
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
    });
    setPincodeStatus({ status: 'idle', message: '' });
  };

  const handleCheckServiceability = async (pincodeToCheck?: string) => {
    const pincode = pincodeToCheck || form.getValues('pincode');

    if (!pincode || pincode.length !== 6) {
      form.setError('pincode', { message: 'Please enter a valid 6-digit pincode' });
      return;
    }

    setIsCheckingPincode(true);
    setPincodeStatus({ status: 'idle', message: '' });

    try {
      const result = await checkPincodeServiceability(pincode);

      if (result.success && result.data?.isServiceable) {
        setPincodeStatus({
          status: 'success',
          message: `Delivery available! Expected in ${result.data.estimatedDays}`,
        });
        form.clearErrors('pincode');
      } else {
        setPincodeStatus({
          status: 'error',
          message: result.message || 'Delivery is not available to this pincode.',
        });
        form.setError('pincode', { message: 'Unserviceable pincode' });
      }
    } catch (_error) {
      setPincodeStatus({
        status: 'error',
        message: 'Failed to verify pincode. Please try again.',
      });
    } finally {
      setIsCheckingPincode(false);
    }
  };

  // Handle form submission
  async function onSubmit(data: AddressFormValues) {
    // Force a pincode check if none was done successfully
    if (pincodeStatus.status !== 'success') {
      await handleCheckServiceability(data.pincode);
      if (form.getFieldState('pincode').invalid) {
        return; // Stop submission if check failed
      }
    }

    setIsLoading(true);
    try {
      // Store address in sessionStorage for next step
      sessionStorage.setItem('checkoutAddress', JSON.stringify(data));

      // Navigate to step 2 (order review)
      router.push('/checkout?step=2');
    } catch (error) {
      console.error('Error saving address:', error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Saved Addresses Selection */}
      {savedAddresses.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Select a Delivery Address</h2>
            {selectedAddressId && (
              <Button variant="ghost" size="sm" onClick={handleClearSelection}>
                Clear Selection
              </Button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedAddresses.map((address) => (
              // biome-ignore lint/a11y/useKeyWithClickEvents: Selection card
              // biome-ignore lint/a11y/noStaticElementInteractions: Selection card
              <div
                key={address.id}
                className={`relative rounded-lg border p-4 cursor-pointer hover:border-primary transition-colors ${
                  selectedAddressId === address.id
                    ? 'border-primary ring-1 ring-primary bg-primary/5'
                    : ''
                }`}
                onClick={() => handleSelectAddress(address)}
              >
                {selectedAddressId === address.id && (
                  <CheckCircle2 className="absolute top-4 right-4 h-5 w-5 text-primary" />
                )}
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{address.name}</p>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {address.addressLine1}
                      {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                      <br />
                      {address.city}, {address.state} {address.pincode}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">Phone: {address.phone}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="relative pt-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or enter a new address
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Address Form */}
      <Card>
        <CardHeader>
          <CardTitle>{selectedAddressId ? 'Edit Selected Address' : 'Shipping Address'}</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address Line 1 */}
              <FormField
                control={form.control}
                name="addressLine1"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 1</FormLabel>
                    <FormControl>
                      <Input placeholder="House No., Street Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Address Line 2 */}
              <FormField
                control={form.control}
                name="addressLine2"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address Line 2 (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Apartment, Suite, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* City and State */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Mumbai" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="Maharashtra" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Pincode and Phone */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <FormField
                  control={form.control}
                  name="pincode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode</FormLabel>
                      <div className="flex gap-2">
                        <FormControl>
                          <Input
                            placeholder="400001"
                            maxLength={6}
                            {...field}
                            onChange={(e) => {
                              // Only allow digits
                              const value = e.target.value.replace(/\D/g, '');
                              field.onChange(value);
                              // Reset pincode status when user edits
                              if (pincodeStatus.status !== 'idle') {
                                setPincodeStatus({ status: 'idle', message: '' });
                              }
                            }}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => handleCheckServiceability()}
                          disabled={isCheckingPincode || field.value?.length !== 6}
                        >
                          {isCheckingPincode ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            'Check'
                          )}
                        </Button>
                      </div>

                      {/* Pincode Serviceability Feedback */}
                      {pincodeStatus.status === 'success' && (
                        <p className="text-sm font-medium text-green-600 mt-1">
                          {pincodeStatus.message}
                        </p>
                      )}
                      {pincodeStatus.status === 'error' && (
                        <p className="text-sm font-medium text-destructive mt-1">
                          {pincodeStatus.message}
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="9876543210"
                          maxLength={10}
                          {...field}
                          onChange={(e) => {
                            // Only allow digits
                            const value = e.target.value.replace(/\D/g, '');
                            field.onChange(value);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <Button
                  type="submit"
                  disabled={isLoading || pincodeStatus.status === 'error'}
                  size="lg"
                >
                  {isLoading ? 'Saving...' : 'Continue to Review'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
