// src/app/admin/orders/page.tsx
import { prisma } from "@/lib/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderStatusSelect } from "./order-status-select";

const statusColors: Record<string, string> = {
  PENDING: "bg-stone-100 text-stone-700 border-stone-300",
  PAID: "bg-emerald-50 text-emerald-700 border-emerald-300",
  PROCESSING: "bg-blue-50 text-blue-700 border-blue-300",
  SHIPPED: "bg-purple-50 text-purple-700 border-purple-300",
  DELIVERED: "bg-green-50 text-green-700 border-green-300",
  CANCELLED: "bg-red-50 text-red-700 border-red-300",
  REFUNDED: "bg-orange-50 text-orange-700 border-orange-300",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: {
      items: { include: { variant: { include: { product: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-stone-900">???????</h1>
        <p className="text-stone-500 text-sm mt-1">{orders.length} ???</p>
      </div>

      {orders.length === 0 ? (
        <div className="border border-dashed border-stone-300 rounded-lg py-16 text-center">
          <p className="text-stone-500">?? ???? ????? ???.</p>
        </div>
      ) : (
        <div className="border border-stone-200 rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>??? ?????</TableHead>
                <TableHead>??????</TableHead>
                <TableHead>????????</TableHead>
                <TableHead>????????</TableHead>
                <TableHead>?????</TableHead>
                <TableHead>??????</TableHead>
                <TableHead>???????</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium" dir="ltr">
                    {order.orderNumber}
                  </TableCell>
                  <TableCell>
                    <div>{order.customerName}</div>
                    <div className="text-sm text-stone-500" dir="ltr">
                      {order.customerPhone}
                    </div>
                    <div className="text-xs text-stone-400 mt-1">
                      {order.addressLine} — {"????"} {order.building}, {"???"}{" "}
                      {order.floor}, {"???"} {order.apartment}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-stone-600 space-y-0.5">
                      {order.items.map((item) => (
                        <div key={item.id}>
                          {item.quantity}× {item.variant.product.nameAr}
                          {item.variant.weightGrams &&
                            ` (${item.variant.weightGrams}??)`}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {Number(order.total).toFixed(2)} ?.?
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-stone-500">
                      {order.paymentMethod === "CASH_ON_DELIVERY"
                        ? "????? ??? ????????"
                        : "????"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <OrderStatusSelect
                      orderId={order.id}
                      currentStatus={order.status}
                      colorClass={statusColors[order.status]}
                    />
                  </TableCell>
                  <TableCell className="text-sm text-stone-500">
                    {order.createdAt.toLocaleDateString("ar-EG")}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
