import Patient from "../models/patient.js";

const newPatient = new Patient({
  id: "P001",
  name: "John Doe",
  contactInfo: "john.doe@email.com",
});

async function doesPatientExist(patient_id) {
  const patient = await Patient.findOne({ 'id': patient_id });
  console.log(patient);
  return patient;
}

 const createPatient = async () => {
  const patientExists = await doesPatientExist("P001");

   if (!patientExists) {
     await newPatient.save();
   }
 };

export default createPatient;