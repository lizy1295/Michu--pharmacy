import Placeholder from '../../_placeholder';

export default function AdminPrescriptionDetailPage({ params }: { params: { id: string } }) {
  return <Placeholder title="Prescription Details" description={`Viewing details for prescription ID: ${params.id}. Show prescription image, patient info, doctor info, and approval actions.`} />;
}
