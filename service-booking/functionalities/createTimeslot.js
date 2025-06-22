import Timeslot from "../models/timeslot.js";

const newSlot = new Timeslot({
  name: "Teeth Cleaning",
  dentist: "6565b5ec19071a95c1d03886",
  clinic: "6565b5e519071a95c1d03883",
  startTime: new Date("2023-12-05T10:00:00"),
  endTime: new Date("2023-12-05T11:00:00"),
});

async function doesSlotExist(timeslot_id) {
  const timeslot = await Timeslot.findById(timeslot_id);
  console.log(timeslot);
  return timeslot;
}

const createTimeslot = async () => {
  const slotExists = await doesSlotExist("656635416f20bc4789918f38");
  if (!slotExists) {
    await newSlot.save();
  }
};

export default createTimeslot;