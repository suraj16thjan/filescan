import * as dotenv from 'dotenv';
import { cleanEnv, str, port} from 'envalid';

dotenv.config();

export const envConfig = cleanEnv(process.env, {
  REDIS_URL: str(),
  AWS_DEFAULT_REGION : str({default:"ap-southeast-1"}),
  PORT: port({default: 8080})
});
