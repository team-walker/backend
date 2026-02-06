export function parseStringToBoolean(val: string): boolean {
  if (!val) return false;
  const s = val.trim();
  if (s === '' || s === '0' || s === '없음' || s === '불가') return false;
  return true;
}
