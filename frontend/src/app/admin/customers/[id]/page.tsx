import Placeholder from '../../_placeholder';

export default function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  return <Placeholder title="Customer Details" description={`Viewing details for customer ID: ${params.id}. Show order history, prescription history, and account controls.`} />;
}
