import { EditMedicineForm } from "@/components/modules/seller/edit-medicine-form";

export default async function EditMedicinePage({
  params,
}: {
  params: Promise<{ medId: string }>;
}) {
  const { medId } = await params;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <EditMedicineForm medId={medId} />
    </div>
  );
}