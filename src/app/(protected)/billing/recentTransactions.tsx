import { api } from '@/trpc/react';
import React from 'react';

const RecentTransactions = () => {
  const { data: transactions, isLoading } = api.payment.getPayments.useQuery();

  return (
    <div className="flex flex-col gap-6 p-6">
      <h2 className="text-2xl font-bold text-gray-800">Recent Transactions</h2>

      {isLoading && <div className="text-gray-500">Loading transactions...</div>}

      {!isLoading && transactions?.length === 0 && (
        <div className="text-gray-500">No transactions found.</div>
      )}

      <div className="flex flex-col gap-4">
        {transactions
          ?.map((item) => {
            const isCaptured = item.status === "captured";
            const isFailed = item.status === "failed" || item.status==="created";

            return (
              <div
                key={item.paymentId}
                className={`min-w-full backdrop-blur-md border rounded-2xl p-4 flex justify-between items-center shadow-sm transition-shadow duration-200
                  ${isCaptured ? 'bg-green-100/20 border-green-200/30 hover:shadow-md' : ''}
                  ${isFailed ? 'bg-red-100/20 border-red-200/30 hover:shadow-md' : ''}
                `}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm text-gray-600">
                    Transaction ID:{" "}
                    <span className="font-medium text-gray-800">{item.paymentId}</span>
                  </span>
                  <span className="text-sm text-gray-700">
                    Amount:{" "}
                    <span className="font-medium">
                      {(item.amount / 100).toFixed(2)} {item.currency}
                    </span>
                  </span>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-sm text-gray-600">
                    {new Date(item.createdAt).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </span>
                  {isCaptured && (
                    <span className="text-green-600 font-semibold">
                      +{item.credits} credits
                    </span>
                  )}
                  {isFailed && (
                    <span className="text-red-600 font-semibold">Failed</span>
                  )}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default RecentTransactions;
