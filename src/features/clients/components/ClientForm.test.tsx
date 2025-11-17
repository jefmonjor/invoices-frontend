import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { ClientForm } from './ClientForm'
import type { Client } from '@/types/client.types'

describe('ClientForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    isSubmitting: false,
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Create mode', () => {
    it('renders all form fields', () => {
      render(<ClientForm {...defaultProps} />)

      expect(screen.getByLabelText(/nombre del cliente/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/cif\/nif/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/dirección/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/teléfono/i)).toBeInTheDocument()
    })

    it('shows validation errors for required fields', async () => {
      const user = userEvent.setup()
      render(<ClientForm {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: /crear/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('El nombre es requerido')).toBeInTheDocument()
        expect(screen.getByText('El CIF/NIF es requerido')).toBeInTheDocument()
        expect(screen.getByText('La dirección es requerida')).toBeInTheDocument()
        expect(screen.getByText('El email es requerido')).toBeInTheDocument()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('validates email format', async () => {
      const user = userEvent.setup()
      render(<ClientForm {...defaultProps} />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')

      const submitButton = screen.getByRole('button', { name: /crear/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email inválido')).toBeInTheDocument()
      })
    })

    it('validates maximum length constraints', async () => {
      const user = userEvent.setup()
      render(<ClientForm {...defaultProps} />)

      const nameInput = screen.getByLabelText(/nombre del cliente/i)
      await user.type(nameInput, 'a'.repeat(201))

      const submitButton = screen.getByRole('button', { name: /crear/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Máximo 200 caracteres')).toBeInTheDocument()
      })
    })

    it('submits form with valid data', async () => {
      const user = userEvent.setup()
      render(<ClientForm {...defaultProps} />)

      await user.type(screen.getByLabelText(/nombre del cliente/i), 'Acme Corp')
      await user.type(screen.getByLabelText(/cif\/nif/i), 'B12345678')
      await user.type(screen.getByLabelText(/dirección/i), '123 Main St')
      await user.type(screen.getByLabelText(/email/i), 'contact@acme.com')
      await user.type(screen.getByLabelText(/teléfono/i), '+34 123456789')

      const submitButton = screen.getByRole('button', { name: /crear/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          name: 'Acme Corp',
          taxId: 'B12345678',
          address: '123 Main St',
          email: 'contact@acme.com',
          phone: '+34 123456789',
        })
      })
    })

    it('allows empty phone field (optional)', async () => {
      const user = userEvent.setup()
      render(<ClientForm {...defaultProps} />)

      await user.type(screen.getByLabelText(/nombre del cliente/i), 'Acme Corp')
      await user.type(screen.getByLabelText(/cif\/nif/i), 'B12345678')
      await user.type(screen.getByLabelText(/dirección/i), '123 Main St')
      await user.type(screen.getByLabelText(/email/i), 'contact@acme.com')

      const submitButton = screen.getByRole('button', { name: /crear/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            phone: '',
          })
        )
      })
    })

    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<ClientForm {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('Edit mode', () => {
    const mockClient: Client = {
      id: 1,
      name: 'Acme Corp',
      taxId: 'B12345678',
      address: '123 Main St',
      email: 'contact@acme.com',
      phone: '+34 123456789',
    }

    it('pre-fills form with initial data', () => {
      render(<ClientForm {...defaultProps} initialData={mockClient} />)

      expect(screen.getByLabelText(/nombre del cliente/i)).toHaveValue(mockClient.name)
      expect(screen.getByLabelText(/cif\/nif/i)).toHaveValue(mockClient.taxId)
      expect(screen.getByLabelText(/dirección/i)).toHaveValue(mockClient.address)
      expect(screen.getByLabelText(/email/i)).toHaveValue(mockClient.email)
      expect(screen.getByLabelText(/teléfono/i)).toHaveValue(mockClient.phone)
    })

    it('shows update button instead of create', () => {
      render(<ClientForm {...defaultProps} initialData={mockClient} />)

      expect(screen.getByRole('button', { name: /actualizar/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /crear/i })).not.toBeInTheDocument()
    })

    it('submits updated data', async () => {
      const user = userEvent.setup()
      render(<ClientForm {...defaultProps} initialData={mockClient} />)

      const nameInput = screen.getByLabelText(/nombre del cliente/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Corp')

      const submitButton = screen.getByRole('button', { name: /actualizar/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Updated Corp',
          })
        )
      })
    })
  })

  describe('Submitting state', () => {
    it('disables all inputs when submitting', () => {
      render(<ClientForm {...defaultProps} isSubmitting={true} />)

      expect(screen.getByLabelText(/nombre del cliente/i)).toBeDisabled()
      expect(screen.getByLabelText(/cif\/nif/i)).toBeDisabled()
      expect(screen.getByLabelText(/dirección/i)).toBeDisabled()
      expect(screen.getByLabelText(/email/i)).toBeDisabled()
      expect(screen.getByLabelText(/teléfono/i)).toBeDisabled()
    })

    it('shows loading text on submit button', () => {
      render(<ClientForm {...defaultProps} isSubmitting={true} />)

      expect(screen.getByRole('button', { name: /guardando/i })).toBeInTheDocument()
    })

    it('disables buttons when submitting', () => {
      render(<ClientForm {...defaultProps} isSubmitting={true} />)

      expect(screen.getByRole('button', { name: /guardando/i })).toBeDisabled()
      expect(screen.getByRole('button', { name: /cancelar/i })).toBeDisabled()
    })
  })
})
