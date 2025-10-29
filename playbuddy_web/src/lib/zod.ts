import { z } from "zod";

export const locationFormSchema = z.object({
  name: z
    .string()
    .regex(
      /^[A-Za-z0-9 -]+$/,
      "Only letters, numbers, spaces, and hyphens are allowed"
    )
    .min(1, "Name must be between 1-50 characters long")
    .max(50, "Name must be between 1-50 characters long"),
  description: z
    .string()
    .min(1, "Description must be between 1-300 characters long")
    .max(300, "Description must be between 1-300 characters long"),
  coordinates: z.object({
    latitude: z.coerce
      .number({ message: "Please enter a valid number" })
      .refine((val) => val !== 0, { message: "Latitude cannot be 0" })
      .refine((val) => val >= -90 && val <= 90, {
        message: "Latitude must be between -90 and 90",
      }),
    longitude: z.coerce
      .number({ message: "Please enter a valid number" })
      .refine((val) => val !== 0, { message: "Longitude cannot be 0" })
      .refine((val) => val >= -180 && val <= 180, {
        message: "Longitude must be between -180 and 180",
      }),
  }),
  sportTypes: z
    .array(
      z.object({
        _id: z.string(),
        name: z.string(),
      })
    )
    .min(1, "Select at least one sport type"),
});
