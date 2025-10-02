'use client'

import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import useRefetch from '@/hooks/use-refetch';
import { api } from '@/trpc/react';
import { Info } from 'lucide-react';
import React, { useState } from 'react';
import RecentTransactions from './recentTransactions';

function loadRazorpayScript() {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    document.body.appendChild(script);
  });
}

const BillingPage = () => {
  const { data: user } = api.project.getMyCredits.useQuery();
  const refetch = useRefetch();

  const createOrder = api.payment.createOrder.useMutation();
  const verifyOrder = api.payment.verifyPayment.useMutation({
    onSuccess:()=>{
      refetch();
    }
  });

  const [creditsToBuy, setCreditsToBuy] = useState<number[]>([100]);
  const creditsToBuyAmount = creditsToBuy[0]!;
  const price = (creditsToBuyAmount * 2).toFixed(2); 
  

  const handleBuy = async () => {
    console.log("handleBuy")
    await loadRazorpayScript();

    try {
     
      const res = await createOrder.mutateAsync({ credits: creditsToBuyAmount });
    console.log("response from payment is :" ,res);
      const options = {
        key: res?.key,
        amount: res?.amount,
        currency: res?.currency,
        name: 'RepoMind',
        description: `${creditsToBuyAmount} RM credits`,
        order_id: res?.orderId,
        handler: async function (response: any) {
          try {
            
            await verifyOrder.mutateAsync({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            alert('Payment Verified & credits Added!');
            refetch();
          } catch (error) {
            console.error(error);
            alert('Payment verification failed');
          }
        },
        theme: { color: '#3399cc' },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Internal server error', error);
      alert('Something went wrong');
    }
  };


  const isProcessing = createOrder.isPending || verifyOrder.isPending;

  return (
    <div>
      <h1 className="text-xl font-semibold dark:text-white">Billing</h1>
      <div className="h-2" />
      <p className="text-sm text-gray-500">You currently have {user?.credits} credits.</p>

      <div className="h-2" />
      <div className="bg-blue-50 px-4 py-2 rounded-md border border-blue-200 text-blue-700">
        <div className="flex items-center gap-2">
          <Info className="size-4" />
          <p className="text-sm">Each credit allows you to index 1 file in a repository.</p>
        </div>
        <p className="text-sm">
          E.g. If your project has 100 files, you will need 100 credits to index it.
        </p>
      </div>

      <div className="h-5" />
      <Slider
        defaultValue={[100]}
        max={1000}
        min={10}
        step={10}
        onValueChange={(value) => setCreditsToBuy(value)}
        value={creditsToBuy}
      />

      <div className="h-4" />
      <Button onClick={handleBuy} disabled={isProcessing}>
        {isProcessing ? 'Processing...' : `Buy ${creditsToBuyAmount} for ${price} INR`}
      </Button>
      <div className="h-10"></div>
      <div className="">
         <RecentTransactions/>
      </div>
    </div>
  );
};

export default BillingPage;
