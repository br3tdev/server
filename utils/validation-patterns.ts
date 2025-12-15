export const VALIDATION_PATTERNS = {
  dob: "*\\d{2}/\\d{2}/\\d{4}",
  name: "*[A-Za-z][A-Za-z\\s\\-'\\\\.]+",
  idNumber: "*\\d{8}",
  email: "*[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}",
  digit: "*\\d",
  relationship: "*\\d{1}"
} as const;