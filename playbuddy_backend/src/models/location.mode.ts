import { Document, model, Schema } from "mongoose";

interface ILocationSchema extends Document {
  name: string;
  images: string[];
  description?: string;
  latitude: number;
  longitude: number;
  sportTypes: Schema.Types.ObjectId[];
}

const LocationSchema = new Schema<ILocationSchema>(
  {
    name: {
      type: String,
      required: true,
    },
    images: [
      {
        type: String,
        required: true,
      },
    ],
    description: {
      type: String,
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    sportTypes: [
      {
        type: Schema.Types.ObjectId,
        ref: "SportType",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

export const Location = model("Location", LocationSchema);
