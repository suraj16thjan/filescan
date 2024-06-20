import { createClient } from "redis";

import { envConfig } from './../config'

const redisClient = await createClient({
    url: envConfig.REDIS_URL
  })
  .on('error', err => console.log('Redis Client Error', err))
  .connect();

export const getJwtSecrets = async ()  => JSON.parse(await redisClient.get('FILE_SCANNER') || '{}')