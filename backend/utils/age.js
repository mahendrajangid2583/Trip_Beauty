// backend/utils/age.js
const calage = (dob) => {
  if (!dob) return null;

  // 1. Ensure 'dob' is a proper Date object
  const birthDate = new Date(dob);
  
  // 2. FIXED: Use new Date(), NOT Date.now()
  const today = new Date(); 

  // 3. Now .getFullYear() will work
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};
export default calage;