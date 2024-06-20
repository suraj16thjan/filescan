import * as dotenv from 'dotenv';
import { cleanEnv, str} from 'envalid';

dotenv.config();

export const envConfig = cleanEnv(process.env, {
  REDIS_URL: str(),
  AWS_DEFAULT_REGION : str({default:"ap-southeast-1"})
});
