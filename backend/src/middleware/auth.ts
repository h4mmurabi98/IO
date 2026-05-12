import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export interface AuthRequest extends Request {
  userId?: string
}

interface JwtPayload {
  id: string
  iat: number
  exp: number
}

const auth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Nicht autorisiert' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
    req.userId = decoded.id
    next()
  } catch {
    res.status(401).json({ message: 'Token ungültig' })
  }
}

export default auth
