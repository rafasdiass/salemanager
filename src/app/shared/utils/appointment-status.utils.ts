import { AppointmentStatus } from '../models/appointments.model';

/**
 * Retorna o ícone correspondente ao status do agendamento.
 */
export function getStatusIcon(status: AppointmentStatus): string {
  const icons: Record<AppointmentStatus, string> = {
    scheduled: 'time-outline',
    confirmed: 'checkmark',
    completed: 'checkmark-circle',
    canceled: 'close-circle',
    'no-show': 'alert-circle',
    rescheduled: 'refresh-circle',
  };
  return icons[status] ?? 'help';
}

/**
 * Retorna a cor correspondente ao status do agendamento.
 */
export function getStatusColor(status: AppointmentStatus): string {
  const colors: Record<AppointmentStatus, string> = {
    scheduled: 'medium',
    confirmed: 'success',
    completed: 'success',
    canceled: 'danger',
    'no-show': 'warning',
    rescheduled: 'tertiary',
  };
  return colors[status] ?? 'dark';
}
