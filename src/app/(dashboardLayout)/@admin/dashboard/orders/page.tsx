import AdminOrdersView from "@/components/modules/admin/admin-orders-view";


export default function OrdersPage() {
  // role-based layout decides who sees this route.
  return <AdminOrdersView />;
}