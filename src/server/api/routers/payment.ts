import z from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import razorPayInstance from "@/lib/razorpay";
import crypto from 'crypto';



export const PaymentRouter = createTRPCRouter({

createOrder: protectedProcedure
.input(z.object({ credits: z.number() }))
.mutation(async ({ ctx, input }) => {
    console.log("user :", ctx.user.userId, " credits:", input.credits);
    console.log("razorpay keys :", process.env.RAZORPAY_KEY_ID, "  ", process.env.RAZORPAY_KEY_SECRET);

    const amountINR = input.credits * 2;
    const amountPaise = Math.round(amountINR * 100);

    const receipt = `rcpt_${ctx.user.userId?.slice(0, 10)}_${Date.now()}`;

    console.log("recipt", receipt);

    try {
      const order = await razorPayInstance.orders.create({
        amount: amountPaise,
        currency: "INR",
        receipt,
        payment_capture: true,
        notes: { userId: ctx.user.userId, credits: String(input.credits) },
      });

      console.log("order created:", order);
      await ctx.db.payment.create({
        data: {
          userId: ctx.user.userId!,
          orderId: order.id,
          amount: order.amount as number,
          currency: order.currency,
          credits: input.credits,
          status: "created",
          reciept: receipt as string,
        },
      });

      return {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        key: process.env.RAZORPAY_KEY_ID!,
      };
    } catch (error) {
      console.error("error from createOrder Trpc", error);
      throw new Error(`Failed to create Razorpay order: ${(error as Error).message || 'Unknown Error'}`);
    }
}),

verifyPayment:protectedProcedure.input(z.object(
{    razorpay_payment_id:z.string(),
    razorpay_order_id:z.string(),
    razorpay_signature:z.string(),}
)).mutation(async({ctx,input})=>{
    const generatedSignature = crypto.createHmac("sha256",process.env.RAZORPAY_KEY_SECRET!)
    .update(`${input.razorpay_order_id}|${input.razorpay_payment_id}`)
    .digest('hex');

    if(generatedSignature!==input.razorpay_signature){
        throw new Error("Invalid signature");
    }

    const payment = await razorPayInstance.payments.fetch(input.razorpay_payment_id);
    if(payment.status!="captured"){
        throw new Error("payment not captured");
    }

    const dbPayment = await ctx.db.payment.findUnique({
        where:{
            orderId:input.razorpay_order_id
        }
    });
    if(!dbPayment) throw new Error("order not found");

    if(dbPayment.status==="captured") return {ok:true}

    await ctx.db.$transaction([
        ctx.db.payment.update({
            where:{orderId:input.razorpay_order_id},
            data:{paymentId:payment.id,status:"captured"}
        }),
        ctx.db.user.update({
            where:{id:ctx.user.userId!},
            data:{credits:{increment:dbPayment.credits}}
        })
    ]);
    return {ok:true}
}),
getPayments:protectedProcedure.query(async({ctx,input})=>{
return await ctx.db.payment.findMany({
    where:{
        userId:ctx.user.userId!
    },
    select:{
        paymentId:true,
        credits:true,
        createdAt:true,
        currency:true,
        amount:true,
        status:true
    },
    orderBy:{createdAt:'desc'}
})
})
})