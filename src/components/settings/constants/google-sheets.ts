import * as yup from "yup";

import { GoogleSheetsSettingsData } from "../interfaces/google-sheets";

export const defaultGoogleSheetsSettingsData: GoogleSheetsSettingsData = {
  GoogleSheetsID: "",
  StudentID: "ID",
  Name_Column: "Name for Recording",
  Extra_Column: "Dipl Program Descr",
  Multiplier_Column: "",
  Division_Column: "Division",
  OrderBy: "",
};

export const googleSheetsSettingsSchema: yup.ObjectSchema<GoogleSheetsSettingsData> =
  yup
    .object({
      GoogleSheetsID: yup
        .string()
        .trim()
        .min(10, "GoogleSheetsID to short!")
        .required("GoogleSheetsID Column Required!"),
      StudentID: yup
        .string()
        .trim()
        .min(1, "StudentID to short!")
        .required("StudentID Column Required!"),
      Name_Column: yup
        .string()
        .trim()
        .min(1, "Name Column to short!")
        .required("Name Column Required!"),
      Extra_Column: yup
        .string()
        .trim()
        .default(defaultGoogleSheetsSettingsData.Extra_Column)
        .defined(),
      Multiplier_Column: yup
        .string()
        .trim()
        .default(defaultGoogleSheetsSettingsData.Multiplier_Column)
        .defined(),
      Division_Column: yup
        .string()
        .trim()
        .default(defaultGoogleSheetsSettingsData.Division_Column)
        .defined(),
      OrderBy: yup
        .string()
        .default(defaultGoogleSheetsSettingsData.OrderBy)
        .defined(),
    })
    .defined();
