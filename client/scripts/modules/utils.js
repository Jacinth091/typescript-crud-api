export function getDataFromTarget(e) {
  const formData = new FormData(e.target);
  const data = Object.fromEntries(formData.entries());
  return data;
}

export function charactersOnly(str) {
  const nameRegex = /^[a-zA-Z\s]+$/;
  return nameRegex.test(str.trim());
}
