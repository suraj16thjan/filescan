import jwt from "jsonwebtoken";

import { getJwtSecrets } from "./redis";

const jwtOptions = {  expiresIn: 24 * 60 * 60 }

const {currentKey, previousKey} =  await getJwtSecrets();

// const currentKey = "846791aa0dea1279f201ae2eb9d0e4c20caef63d15720b3466d1216ee827a90e";
// const previousKey = "846791aa0dea1279f201ae2eb9d0e4c20caef63d15720b3466d1216ee827a90e";

export const jwtSign = (data:any) => jwt.sign(data, currentKey, jwtOptions)

export const verifyToken = (token: string) => {
    console.log({currentKey,previousKey});
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
