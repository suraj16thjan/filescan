import { createClient } from "redis";

import { envConfig } from './../config'

export const redisClient = await createClient({
    url: envConfig.REDIS_URL
  })
  .on('error', err => console.log('Redis Client Error', err))
  .connect();

const subscriber = redisClient.duplicate();
subscriber.on('error', err => console.error(err));
export const redisSubscriber = await subscriber.connect();

export const getJwtSecrets = async (key : string = "FILE_SCANNER")  => JSON.parse(await redisClient.get(key) || '{}')

export const publishMessage = async (subId:string,message: any) => await redisClient.publish(subId,JSON.stringify(message))