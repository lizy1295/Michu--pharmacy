import { apiFetch } from '../auth/apiClient';
import { getAccessToken } from '../auth/tokens';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001/api/v1';

export type PrescriptionStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface Prescription {
  id: number;
  prescriptionNumber: string;
  patientName: string;
  patientEmail: string;
  doctorName?: string;
  doctorLicense?: string;
  imageUrl: string;
  status: PrescriptionStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePrescriptionPayload {
  patientName: string;
  patientEmail: string;
  doctorName?: string;
  doctorLicense?: string;
  imageUrl: string;
  notes?: string;
}

export interface UpdatePrescriptionStatusPayload {
  status: PrescriptionStatus;
  notes?: string;
}

export async function getPrescriptions(): Promise<Prescription[]> {
  return apiFetch<Prescription[]>('/prescriptions');
}

export async function getPrescriptionById(id: number | string): Promise<Prescription> {
  return apiFetch<Prescription>(`/prescriptions/${id}`);
}

export async function createPrescription(payload: CreatePrescriptionPayload): Promise<Prescription> {
  return apiFetch<Prescription>('/prescriptions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updatePrescriptionStatus(
  id: number | string,
  payload: UpdatePrescriptionStatusPayload,
): Promise<Prescription> {
  return apiFetch<Prescription>(`/prescriptions/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function uploadPrescriptionFile(file: File): Promise<{
  message: string;
  filename: string;
  originalName: string;
  size: number;
  type: string;
  url: string;
}> {
  const token = getAccessToken();
  const formData = new FormData();
  formData.append('file', file);

  const headers: HeadersInit = {};
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}/prescriptions/upload`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = body.message ?? `Upload failed (${response.status})`;
    throw new Error(Array.isArray(message) ? message.join(', ') : message);
  }

  return response.json();
}
