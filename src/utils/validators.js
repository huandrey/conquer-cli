export const validators = {
  isValidName(name) {
    return typeof name === 'string' && name.length >= 3;
  },

  isValidPriority(priority) {
    return Number.isInteger(priority) && priority >= 1 && priority <= 5;
  },

  isValidStatus(status) {
    const validStatuses = ['backlog', 'andamento', 'review', 'concluida', 'bloqueada'];
    return validStatuses.includes(status);
  },

  isValidStatusTransition(fromStatus, toStatus) {
    const validTransitions = {
      'backlog': ['andamento'],
      'andamento': ['review', 'bloqueada'],
      'review': ['concluida', 'andamento'],
      'bloqueada': ['andamento'],
      'concluida': []
    };

    return validTransitions[fromStatus]?.includes(toStatus) || false;
  },

  isValidDate(date) {
    const d = new Date(date);
    return d instanceof Date && !isNaN(d);
  }
};
