import { format, addDays, isWithinInterval, isBefore, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale/index.js';

export const dateUtils = {
  formatDate(date) {
    return format(new Date(date), 'dd/MM/yyyy', { locale: ptBR });
  },

  formatDateTime(date) {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: ptBR });
  },

  addDays(date, days) {
    return addDays(new Date(date), days);
  },

  isOverdue(date) {
    return isBefore(new Date(date), new Date());
  },

  isToday(date) {
    return isToday(new Date(date));
  },

  isWithinDays(date, days) {
    const start = new Date();
    const end = addDays(start, days);
    return isWithinInterval(new Date(date), { start, end });
  }
};

