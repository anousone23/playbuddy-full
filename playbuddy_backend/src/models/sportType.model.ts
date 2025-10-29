import { Document, model, ObjectId, Schema } from "mongoose";

interface ISportTypeSchema extends Document {
  name: string;
}

const SportTypeSchema = new Schema<ISportTypeSchema>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export const SportType = model("SportType", SportTypeSchema);
