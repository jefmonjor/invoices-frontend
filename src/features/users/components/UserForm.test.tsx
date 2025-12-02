import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { UserForm } from './UserForm'
import type { User } from '@/types/user.types'

describe('UserForm', () => {
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
      render(<UserForm {...defaultProps} />)

      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/contraseña/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/apellido/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/rol/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/usuario activo/i)).toBeInTheDocument()
    })

    it('shows validation errors for required fields', async () => {
      const user = userEvent.setup()
      render(<UserForm {...defaultProps} />)

      const submitButton = screen.getByRole('button', { name: /crear/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('El email es requerido')).toBeInTheDocument()
        expect(screen.getByText('El nombre es requerido')).toBeInTheDocument()
        expect(screen.getByText('El apellido es requerido')).toBeInTheDocument()
      })

      expect(mockOnSubmit).not.toHaveBeenCalled()
    })

    it('validates email format', async () => {
      const user = userEvent.setup()
      render(<UserForm {...defaultProps} />)

      const emailInput = screen.getByLabelText(/email/i)
      await user.type(emailInput, 'invalid-email')

      const submitButton = screen.getByRole('button', { name: /crear/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('Email inválido')).toBeInTheDocument()
      })
    })

    it('validates password length', async () => {
      const user = userEvent.setup()
      render(<UserForm {...defaultProps} />)

      const passwordInput = screen.getByLabelText(/contraseña/i)
      await user.type(passwordInput, '12345')

      const submitButton = screen.getByRole('button', { name: /crear/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText('La contraseña debe tener al menos 6 caracteres')).toBeInTheDocument()
      })
    })

    it('submits form with valid data', async () => {
      const user = userEvent.setup()
      render(<UserForm {...defaultProps} />)

      await user.type(screen.getByLabelText(/email/i), 'test@example.com')
      await user.type(screen.getByLabelText(/contraseña/i), 'password123')
      await user.type(screen.getByLabelText(/nombre/i), 'John')
      await user.type(screen.getByLabelText(/apellido/i), 'Doe')

      const submitButton = screen.getByRole('button', { name: /crear/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe',
          roles: ['ROLE_USER'],
          enabled: true,
        })
      })
    })

    it('calls onCancel when cancel button is clicked', async () => {
      const user = userEvent.setup()
      render(<UserForm {...defaultProps} />)

      const cancelButton = screen.getByRole('button', { name: /cancelar/i })
      await user.click(cancelButton)

      expect(mockOnCancel).toHaveBeenCalled()
    })
  })

  describe('Edit mode', () => {
    const mockUser: User = {
      id: 1,
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      roles: ['ROLE_USER', 'ROLE_ADMIN'],
      enabled: true,
    }

    it('pre-fills form with initial data', () => {
      render(<UserForm {...defaultProps} initialData={mockUser} />)

      expect(screen.getByLabelText(/email/i)).toHaveValue(mockUser.email)
      expect(screen.getByLabelText(/nombre/i)).toHaveValue(mockUser.firstName)
      expect(screen.getByLabelText(/apellido/i)).toHaveValue(mockUser.lastName)
    })

    it('shows update button instead of create', () => {
      render(<UserForm {...defaultProps} initialData={mockUser} />)

      expect(screen.getByRole('button', { name: /actualizar/i })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: /crear/i })).not.toBeInTheDocument()
    })

    it('password is optional in edit mode', async () => {
      const user = userEvent.setup()
      render(<UserForm {...defaultProps} initialData={mockUser} />)

      const submitButton = screen.getByRole('button', { name: /actualizar/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled()
      })
    })
  })

  describe('Submitting state', () => {
    it('disables all inputs when submitting', () => {
      render(<UserForm {...defaultProps} isSubmitting={true} />)

      expect(screen.getByLabelText(/email/i)).toBeDisabled()
      expect(screen.getByLabelText(/contraseña/i)).toBeDisabled()
      expect(screen.getByLabelText(/nombre/i)).toBeDisabled()
      expect(screen.getByLabelText(/apellido/i)).toBeDisabled()
    })

    it('shows loading text on submit button', () => {
      render(<UserForm {...defaultProps} isSubmitting={true} />)

      expect(screen.getByRole('button', { name: /guardando/i })).toBeInTheDocument()
    })
  })
})
