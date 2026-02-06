export function parseToSafeInteger(val: string | number | null | undefined): number | null {
  if (val === null || val === undefined || val === '') {
    return null;
  }

  const num = typeof val === 'number' ? val : parseInt(val, 10);

  if (isNaN(num)) {
    return null;
  }

  return num;
}

export function parseToSafeFloat(val: string | number | null | undefined): number | null {
  if (val === null || val === undefined || val === '') {
    return null;
  }

  const num = typeof val === 'number' ? val : parseFloat(val);

  if (isNaN(num)) {
    return null;
  }

  return num;
}
