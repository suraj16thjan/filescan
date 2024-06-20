import jwt from "jsonwebtoken";

import { getJwtSecrets } from "./redis";

const jwtOptions = {  expiresIn: 24 * 60 * 60 }

const {currentKey, previousKey} =  await getJwtSecrets();

// const currentKey = "";
// const previousKey = "";

export const jwtSign = (data:any) => jwt.sign(data, currentKey, jwtOptions)

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(
          token as string,
          currentKey
        ) as any;
      } catch (err) {
        return jwt.verify(
          token as string,
          previousKey
        ) as any;
      }
}
