import { verifyToken } from './../utils'
import crypto  from 'crypto'

const sha256 = (data: string) => {
  return crypto.createHash("sha256").update(data, "binary").digest("base64");
}

export const middleware = async (req: any, res: any, next: any) => {
  try {
    const isEventSource = req.headers.accept === "text/event-stream"
    const token  = isEventSource ? req.query.token : req.headers.authorization.split(' ')[1]
    
    if (!token) return res.status(400).json({error: 'Token not provided.'})

    const {store, file} = verifyToken(token);
    req.store = store
    req.requestedFile = file
    req.subId = sha256(token)
    next();
  } catch (err) {
    console.log(err)
    return res.status(400).json({error: 'Token Error.'})
  }
};
