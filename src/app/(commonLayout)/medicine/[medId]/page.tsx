import { MedicineDetailsView } from "@/components/modules/shared/medicine-details-view";


export default async function MedicineDetailsPage({
  params,
}: {
  params: Promise<{ medId: string }>;
}) {
  const { medId } = await params;
  return <MedicineDetailsView medId={medId} />;
}