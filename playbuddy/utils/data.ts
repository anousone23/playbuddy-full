export const locations = [
  {
    id: "1",
    name: "อาคาร 14",
    latitude: 17.28942875976249,
    longitude: 104.11302768334774,
    address: "ตำบล เชียงเครือ อำเภอเมืองสกลนคร สกลนคร 47000",
    image: "test",
    description: "สนามกีฬาแบดมินตันในร่ม มีทั้งหมด 4 คอร์ด และโรงยิม",
    sportTypes: ["2", "6"],
    groupChats: "1",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "สนามเทนนิส",
    latitude: 17.29231693121336,
    longitude: 104.11371167006845,
    address: "ตำบล เชียงเครือ อำเภอเมืองสกลนคร สกลนคร 47000",
    image: "test",
    description: "สนามเทนนิสกลางแจ้งมีทั้ง 3 คอร์ด",
    sportTypes: ["4"],
    groupChats: "1",
    createdAt: new Date(),
  },
  {
    id: "3",
    name: "สนามกีฬาในร่ม",
    latitude: 17.29100365020787,
    longitude: 104.11508989064168,
    address: "ตำบล เชียงเครือ อำเภอเมืองสกลนคร สกลนคร 47000",
    image: "test",
    description: "สนามกีฬาในร่มวอลเลยบอล",
    sportTypes: ["5"],
    groupChats: "1",
    createdAt: new Date(),
  },
];

export const groupChats = [
  {
    id: "1",
    name: "ตัวตึงวิทคอม",
    creator: "1",
    members: ["1", "2", "3", "4"],
    maxMembers: 10,
    description:
      "ตีแบดทุกวันช่วงเย็น ตีได้ตั้งแต่มือใหม่ถึงมือ S ใข้ลูกขนไก่ตี",
    image: "image",
    sportType: ["2"],
    startTime: new Date(),
    stopTime: new Date(),
    messages: [],
    lastMessageAt: new Date(),
    status: "active",
    createdAt: new Date(),
  },
  {
    id: "2",
    name: "Gym Bro",
    creator: "5",
    members: ["5", "6", "7", "8"],
    maxMembers: 20,
    description: "มาเล่นกล้ามกัน มีโค้ชสอนด้วยนะ",
    image: "image",
    sportType: ["6"],
    startTime: new Date(),
    stopTime: new Date(),
    messages: [],
    lastMessageAt: new Date(),
    status: "active",
    createdAt: new Date(),
  },
];

export const sportTypes = [
  {
    _id: "1",
    name: "All",
  },
  {
    _id: "2",
    name: "Badminton",
  },
  {
    _id: "3",
    name: "Football",
  },
  {
    _id: "4",
    name: "Tennis",
  },
  {
    _id: "5",
    name: "Volleyball",
  },
  {
    _id: "6",
    name: "Gym",
  },
];

export const skills = [
  {
    _id: "1",
    name: "all",
  },
  {
    _id: "2",
    name: "casual",
  },
  {
    _id: "3",
    name: "beginner",
  },
  {
    _id: "4",
    name: "intermediate",
  },
  {
    _id: "5",
    name: "advanced",
  },
];
