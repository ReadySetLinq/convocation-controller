import * as yup from "yup";

import { XpnSettingsData } from "../interfaces/xpression";

export const defaultXpnSettingsData: XpnSettingsData = {
  tmrDelay: 250,
  ExtraTakeID: -1,
  TakeID: 1,
  Name: "txtName",
  Extra: "txtOther",
  Multiplier: "txtMultiplier",
  Background: "bkg",
  BackgroundTakeID: -1,
};

export const xpnSettingsSchema: yup.ObjectSchema<XpnSettingsData> = yup
  .object({
    tmrDelay: yup
      .number()
      .integer("Timer Delay must be a number!")
      .min(0, "Timer Delay must be a 0 or above!")
      .max(2147483647, "Timer Delay must be a number less than 2147483648ms!")
      .required("Timer Delay Required (Set to 0 for no delay)"),
    ExtraTakeID: yup
      .number()
      .integer("ExtraTakeID must be a number!")
      .min(-1, "ExtraTakeID must be a -1 or above!")
      .max(9999, "ExtraTakeID must be a number less than 10000!")
      .required("ExtraTakeID Required (Set to -1 for no ExtraTake scene)!"),
    TakeID: yup
      .number()
      .integer("TakeID must be a number!")
      .min(-9999, "TakeID must be a -9999 or above!")
      .max(9999, "TakeID must be a number less than 10000!")
      .required("TakeID Required!"),
    Name: yup
      .string()
      .trim()
      .min(1, "Name to short!")
      .required("Name Required!"),
    Extra: yup.string().trim().default(defaultXpnSettingsData.Extra).defined(),
    Multiplier: yup
      .string()
      .trim()
      .default(defaultXpnSettingsData.Multiplier)
      .defined(),
    Background: yup
      .string()
      .trim()
      .default(defaultXpnSettingsData.Background)
      .defined(),
    BackgroundTakeID: yup
      .number()
      .integer("BackgroundTakeID must be a number!")
      .min(-1, "BackgroundTakeID must be a -1 or above!")
      .max(9999, "BackgroundTakeID must be a number less than 10000!")
      .required(
        "BackgroundTakeID Required (Set to -1 for no Background scene)!"
      ),
  })
  .defined();
