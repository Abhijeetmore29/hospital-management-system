export function formatDisplayName(user) {
  if (!user?.name) {
    return '';
  }

  if (user.role === 'doctor' && !/^dr\.?\s/i.test(user.name)) {
    return `Dr. ${user.name}`;
  }

  return user.name;
}

