export function truncateString(value: string, maxLength: number) {
  return value?.length < maxLength
    ? value
    : `${value?.substring(0, maxLength)}...`;
}
