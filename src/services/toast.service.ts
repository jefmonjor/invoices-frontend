import { toast, type ToastOptions } from 'react-toastify';

const defaultOptions: ToastOptions = {
    position: 'top-right',
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
};

/**
 * Toast notification service for displaying user feedback
 */
export const toastService = {
    /**
     * Show success toast
     */
    success: (message: string, options?: ToastOptions) => {
        toast.success(message, { ...defaultOptions, ...options });
    },

    /**
     * Show error toast
     */
    error: (message: string, options?: ToastOptions) => {
        toast.error(message, { ...defaultOptions, ...options });
    },

    /**
     * Show info toast
     */
    info: (message: string, options?: ToastOptions) => {
        toast.info(message, { ...defaultOptions, ...options });
    },

    /**
     * Show warning toast
     */
    warning: (message: string, options?: ToastOptions) => {
        toast.warning(message, { ...defaultOptions, ...options });
    },

    /**
     * VeriFactu specific notifications
     */
    verifactu: {
        processing: () => {
            toast.info('🟡 Verificando factura con VeriFactu...', {
                ...defaultOptions,
                autoClose: 3000,
            });
        },

        accepted: (txId?: string) => {
            toast.success(
                txId
                    ? `✅ Factura verificada correctamente - TxID: ${txId}`
                    : '✅ Factura verificada correctamente con VeriFactu',
                {
                    ...defaultOptions,
                    autoClose: 7000,
                }
            );
        },

        rejected: (reason?: string) => {
            toast.error(
                reason
                    ? `❌ Verificación rechazada: ${reason}`
                    : '❌ Verificación rechazada por VeriFactu',
                {
                    ...defaultOptions,
                    autoClose: 10000,
                }
            );
        },

        failed: (error?: string) => {
            toast.error(
                error
                    ? `❌ Error en verificación: ${error}`
                    : '❌ Error en el proceso de verificación',
                {
                    ...defaultOptions,
                    autoClose: 10000,
                }
            );
        },
    },
};
