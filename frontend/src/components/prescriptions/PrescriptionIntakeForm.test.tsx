import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PrescriptionIntakeForm from './PrescriptionIntakeForm';

describe('PrescriptionIntakeForm - Strict Front-End Validation', () => {
  it('renders the form with all required clinical intake fields', () => {
    render(<PrescriptionIntakeForm />);

    expect(screen.getByLabelText(/Patient Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Date of Birth \(18\+ Only\)/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Rx Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prescribing Doctor \/ Hospital/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Known Drug Allergies/i)).toBeInTheDocument();
  });

  describe('Rx Number Validation (Strict ^[A-Z]{2}\\d{7}$ regex)', () => {
    it('shows validation error for invalid Rx number formats on blur or submit', async () => {
      render(<PrescriptionIntakeForm />);
      const rxInput = screen.getByLabelText(/Rx Number/i);

      // Invalid format: only 3 digits
      fireEvent.change(rxInput, { target: { value: 'RX123' } });
      fireEvent.blur(rxInput);

      expect(
        await screen.findByText(/Rx Number must strictly match the format of 2 uppercase letters followed by 7 digits/i),
      ).toBeInTheDocument();

      // Invalid format: all digits
      fireEvent.change(rxInput, { target: { value: '123456789' } });
      fireEvent.blur(rxInput);

      expect(
        await screen.findByText(/Rx Number must strictly match the format of 2 uppercase letters followed by 7 digits/i),
      ).toBeInTheDocument();
    });

    it('accepts valid Rx number strictly matching 2 uppercase letters followed by 7 digits', async () => {
      render(<PrescriptionIntakeForm />);
      const rxInput = screen.getByLabelText(/Rx Number/i);

      // Valid format: RX1234567
      fireEvent.change(rxInput, { target: { value: 'rx1234567' } }); // Auto uppercased to RX1234567
      fireEvent.blur(rxInput);

      expect(
        screen.queryByText(/Rx Number must strictly match the format of 2 uppercase letters followed by 7 digits/i),
      ).not.toBeInTheDocument();
    });
  });

  describe('Date of Birth Validation (Blocks future dates & enforces 18+)', () => {
    it('has max attribute set to today to block future dates at input level', () => {
      render(<PrescriptionIntakeForm />);
      const dobInput = screen.getByLabelText(/Date of Birth \(18\+ Only\)/i);
      const todayStr = new Date().toISOString().split('T')[0];

      expect(dobInput).toHaveAttribute('max', todayStr);
    });

    it('rejects future dates if manually entered', async () => {
      render(<PrescriptionIntakeForm />);
      const dobInput = screen.getByLabelText(/Date of Birth \(18\+ Only\)/i);

      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 2);
      const futureDateStr = futureDate.toISOString().split('T')[0];

      fireEvent.change(dobInput, { target: { value: futureDateStr } });
      fireEvent.blur(dobInput);

      expect(
        await screen.findByText(/Future dates are not allowed/i),
      ).toBeInTheDocument();
    });

    it('rejects patient under 18 years of age', async () => {
      render(<PrescriptionIntakeForm />);
      const dobInput = screen.getByLabelText(/Date of Birth \(18\+ Only\)/i);

      // 10 years old
      const under18Date = new Date();
      under18Date.setFullYear(under18Date.getFullYear() - 10);
      const under18Str = under18Date.toISOString().split('T')[0];

      fireEvent.change(dobInput, { target: { value: under18Str } });
      fireEvent.blur(dobInput);

      expect(
        await screen.findByText(/Patient must be at least 18 years old/i),
      ).toBeInTheDocument();
    });

    it('accepts patient who is 18 years or older', async () => {
      render(<PrescriptionIntakeForm />);
      const dobInput = screen.getByLabelText(/Date of Birth \(18\+ Only\)/i);

      // 25 years old
      const adultDate = new Date();
      adultDate.setFullYear(adultDate.getFullYear() - 25);
      const adultStr = adultDate.toISOString().split('T')[0];

      fireEvent.change(dobInput, { target: { value: adultStr } });
      fireEvent.blur(dobInput);

      expect(
        screen.queryByText(/Patient must be at least 18 years old/i),
      ).not.toBeInTheDocument();
    });
  });

  describe('Known Drug Allergies Validation (Mandatory Field)', () => {
    it('shows mandatory field error when allergies textarea is empty upon submission', async () => {
      render(<PrescriptionIntakeForm />);
      const submitBtn = screen.getByRole('button', { name: /Submit Prescription Intake/i });

      fireEvent.click(submitBtn);

      expect(
        await screen.findByText(/Known Drug Allergies is a mandatory field/i),
      ).toBeInTheDocument();
    });

    it('clears error when user enters allergy details or NKA', async () => {
      render(<PrescriptionIntakeForm />);
      const allergiesInput = screen.getByLabelText(/Known Drug Allergies/i);

      fireEvent.change(allergiesInput, { target: { value: 'Penicillin, Sulfa drugs' } });
      fireEvent.blur(allergiesInput);

      expect(
        screen.queryByText(/Known Drug Allergies is a mandatory field/i),
      ).not.toBeInTheDocument();
    });
  });

  describe('Full Valid Submission Flow', () => {
    it('submits successfully when all strict validations pass', async () => {
      const onSuccessMock = jest.fn();
      render(<PrescriptionIntakeForm onSuccess={onSuccessMock} />);

      // Fill in valid fields
      fireEvent.change(screen.getByLabelText(/Patient Full Name/i), {
        target: { value: 'Abebe Kebede' },
      });

      const adultDate = new Date();
      adultDate.setFullYear(adultDate.getFullYear() - 28);
      fireEvent.change(screen.getByLabelText(/Date of Birth \(18\+ Only\)/i), {
        target: { value: adultDate.toISOString().split('T')[0] },
      });

      fireEvent.change(screen.getByLabelText(/Contact Phone/i), {
        target: { value: '+251911234567' },
      });

      fireEvent.change(screen.getByLabelText(/Rx Number/i), {
        target: { value: 'RX7654321' },
      });

      fireEvent.change(screen.getByLabelText(/Prescribing Doctor \/ Hospital/i), {
        target: { value: 'Dr. Sarah Hailu' },
      });

      fireEvent.change(screen.getByLabelText(/Known Drug Allergies/i), {
        target: { value: 'No known drug allergies (NKA)' },
      });

      const ackCheckbox = screen.getByRole('checkbox');
      fireEvent.click(ackCheckbox);

      const submitBtn = screen.getByRole('button', { name: /Submit Prescription Intake/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Prescription Intake Received!/i)).toBeInTheDocument();
      });

      expect(onSuccessMock).toHaveBeenCalledTimes(1);
      expect(onSuccessMock).toHaveBeenCalledWith(
        expect.objectContaining({
          patientName: 'Abebe Kebede',
          rxNumber: 'RX7654321',
          knownAllergies: 'No known drug allergies (NKA)',
          acknowledgment: true,
        }),
      );
    });
  });
});
