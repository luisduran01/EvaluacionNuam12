import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { RoleDefinition, UserRole } from '../types/nuam.ts';

const ACCESS_SECRET =
  process.env.JWT_SECRET || process.env.DJANGO_SECRET_KEY || 'nuam-dev-access-jwt-secret-2026';
const REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || 'nuam-dev-refresh-jwt-secret-2026';
const ACCESS_EXPIRES_IN = 3600;

export const ROLE_DEFINITIONS: Record<UserRole, RoleDefinition> = {
  admin: {
    role: 'admin',
    label: 'Administrador',
    description:
      'Control total de usuarios, roles RBAC, calificaciones tributarias, DJ1948 y bitácora regional.',
    permissions: {
      viewDashboard: true,
      createQualification: true,
      editQualification: true,
      deleteQualification: true,
      uploadDj1948: true,
      presentDj1948: true,
      exportReports: true,
      manageUsers: true,
    },
  },
  operador: {
    role: 'operador',
    label: 'Operador',
    description:
      'Gestión operativa de calificaciones tributarias, carga masiva DJ1948 y emisión de reportes.',
    permissions: {
      viewDashboard: true,
      createQualification: true,
      editQualification: true,
      deleteQualification: false,
      uploadDj1948: true,
      presentDj1948: true,
      exportReports: true,
      manageUsers: false,
    },
  },
  consultor: {
    role: 'consultor',
    label: 'Consultor',
    description:
      'Acceso de solo lectura a métricas consolidadas, trazabilidad en tiempo real y exportación CSV.',
    permissions: {
      viewDashboard: true,
      createQualification: false,
      editQualification: false,
      deleteQualification: false,
      uploadDj1948: false,
      presentDj1948: false,
      exportReports: true,
      manageUsers: false,
    },
  },
};

export interface JwtClaims {
  sub: string;
  email: string;
  role: UserRole;
  fullName: string;
  type: 'access' | 'refresh';
}

export interface AuthenticatedRequest extends Request {
  auth?: JwtClaims;
}

export function signTokens(user: {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
}) {
  const basePayload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    fullName: user.fullName,
  };

  const accessToken = jwt.sign({ ...basePayload, type: 'access' }, ACCESS_SECRET, {
    algorithm: 'HS256',
    expiresIn: ACCESS_EXPIRES_IN,
  });

  const refreshToken = jwt.sign({ ...basePayload, type: 'refresh' }, REFRESH_SECRET, {
    algorithm: 'HS256',
    expiresIn: '7d',
  });

  return { accessToken, refreshToken, expiresIn: ACCESS_EXPIRES_IN };
}

export function verifyAccessToken(token: string): JwtClaims {
  const decoded = jwt.verify(token, ACCESS_SECRET, { algorithms: ['HS256'] }) as JwtClaims;
  if (decoded.type !== 'access') {
    throw new Error('Tipo de token inválido');
  }
  return decoded;
}

export function verifyRefreshToken(token: string): JwtClaims {
  const decoded = jwt.verify(token, REFRESH_SECRET, { algorithms: ['HS256'] }) as JwtClaims;
  if (decoded.type !== 'refresh') {
    throw new Error('Refresh token inválido');
  }
  return decoded;
}

export function requireJwtAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization || '';
  const queryToken = typeof req.query.token === 'string' ? req.query.token : '';
  const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : queryToken;

  if (!bearer) {
    res.status(401).json({ error: 'Token JWT de autorización requerido.' });
    return;
  }

  try {
    req.auth = verifyAccessToken(bearer);
    next();
  } catch {
    res.status(401).json({ error: 'Sesión JWT expirada o inválida.' });
  }
}

export function requireRoles(...allowed: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.auth) {
      res.status(401).json({ error: 'Usuario no autenticado.' });
      return;
    }
    if (!allowed.includes(req.auth.role)) {
      res.status(403).json({
        error: `Permiso denegado: requiere rol ${allowed.join(' o ')}.`,
      });
      return;
    }
    next();
  };
}
