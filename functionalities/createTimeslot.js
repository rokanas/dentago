import Timeslot from "../models/timeslot.js";

const newSlot = new Timeslot({
  timeslotId: "12345",
  timeslotName: "Teeth Cleaning",
  timeslotDentist: "6565b5ec19071a95c1d03886",
  timeslotClinic: "6565b5e519071a95c1d03883",
  timeslotStartTime: new Date("2023-12-05T10:00:00"),
  timeslotEndTime: new Date("2023-12-05T11:00:00"),
});

async function doesSlotExist(timeslot_id) {
  const timeslot = await Timeslot.findOne({ 'timeslotId': timeslot_id });
  console.log(timeslot);
  return timeslot;
}

const createTimeslot = async () => {
  const slotExists = await doesSlotExist(12345);
  if (!slotExists) {
    await newSlot.save();
  }
};

export default createTimeslot;