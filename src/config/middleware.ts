import {verifyToken} from './../utils'

export const middleware = async (req: any, res: any, next: any) => {
  try {
    const [, token] = req.headers.authorization.split(' ')
    
    if (!token) return res.status(400).json({error: 'Token not provided.'})

    const {store, file} = verifyToken(token);
    req.store = store
    req.requestedFile = file
    
    next();
  } catch (err) {
    console.log(err)
    return res.status(400).json({error: 'Token Error.'})
  }
};
