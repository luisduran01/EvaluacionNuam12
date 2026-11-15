import express from 'express';
import {
  ROLE_DEFINITIONS,
  type AuthenticatedRequest,
  requireJwtAuth,
  requireRoles,
  signTokens,
  verifyRefreshToken,
} from './auth.ts';
import {
  appendAuditLog,
  authenticateUser,
  computeDashboardSummary,
  createQualification,
  createUser,
  deleteBatch,
  deleteQualification,
  deleteUser,
  getUserById,
  isDatabasePostgres,
  listAuditLogs,
  listBatches,
  listQualifications,
  listUsers,
  presentDj1948ByYear,
  processDj1948Csv,
  realtimeBus,
  updateQualification,
  updateUser,
} from './db.ts';

function clientIp(req: express.Request): string {
  const fwd = req.headers['x-forwarded-for'];
  if (typeof fwd === 'string' && fwd.length > 0) return fwd.split(',')[0].trim();
  return req.socket.remoteAddress || '127.0.0.1';
}

export function createNuamApp() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      backend: 'express-django-compatible + supabase-postgres',
      postgresConnected: isDatabasePostgres(),
      timestamp: new Date().toISOString(),
    });
  });

  // Auth JWT endpoints
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body || {};
      if (!email || !password) {
        res.status(400).json({ error: 'Debe ingresar correo institucional y contraseña.' });
        return;
      }
      const user = await authenticateUser(String(email), String(password));
      if (!user) {
        res.status(401).json({ error: 'Credenciales institucionales incorrectas.' });
        return;
      }
      if (!user.active) {
        res.status(403).json({ error: 'Cuenta corporativa desactivada.' });
        return;
      }

      const tokens = signTokens(user);
      await appendAuditLog({
        action: 'LOGIN',
        module: 'USUARIO',
        userName: user.fullName,
        userId: user.id,
        ipAddress: clientIp(req),
        detail: `Inicio de sesión JWT (${user.role.toUpperCase()} · ${user.market}).`,
      });

      res.json({
        ...tokens,
        user,
        permissions: ROLE_DEFINITIONS[user.role].permissions,
      });
    } catch (err) {
      res.status(500).json({ error: err instanceof Error ? err.message : 'Error de autenticación.' });
    }
  });

  app.post('/api/auth/refresh', async (req, res) => {
    try {
      const token = req.body?.refreshToken;
      if (!token) {
        res.status(400).json({ error: 'refreshToken requerido.' });
        return;
      }
      const claims = verifyRefreshToken(String(token));
      const user = await getUserById(claims.sub);
      if (!user || !user.active) {
        res.status(401).json({ error: 'Usuario inválido o inactivo.' });
        return;
      }
      const tokens = signTokens(user);
      res.json({
        ...tokens,
        user,
        permissions: ROLE_DEFINITIONS[user.role].permissions,
      });
    } catch {
      res.status(401).json({ error: 'Refresh token inválido o expirado.' });
    }
  });

  app.post('/api/auth/forgot-password', (req, res) => {
    const email = String(req.body?.email || '').trim();
    if (!email) {
      res.status(400).json({ error: 'Ingrese un correo institucional.' });
      return;
    }
    res.json({
      message: `Se enviaron instrucciones de restablecimiento corporativo a ${email}.`,
    });
  });

  app.post('/api/auth/logout', requireJwtAuth, async (req: AuthenticatedRequest, res) => {
    await appendAuditLog({
      action: 'LOGOUT',
      module: 'USUARIO',
      userName: req.auth!.fullName,
      userId: req.auth!.sub,
      ipAddress: clientIp(req),
      detail: 'Cierre de sesión JWT.',
    });
    res.json({ ok: true });
  });

  app.get('/api/auth/me', requireJwtAuth, async (req: AuthenticatedRequest, res) => {
    const user = await getUserById(req.auth!.sub);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado.' });
      return;
    }
    res.json({
      user,
      permissions: ROLE_DEFINITIONS[user.role].permissions,
    });
  });

  // Roles & Dashboard
  app.get('/api/roles', requireJwtAuth, (_req, res) => {
    res.json(Object.values(ROLE_DEFINITIONS));
  });

  app.get('/api/dashboard/summary', requireJwtAuth, async (_req, res) => {
    res.json(await computeDashboardSummary());
  });

  // Qualifications CRUD
  app.get('/api/qualifications', requireJwtAuth, async (_req, res) => {
    res.json(await listQualifications());
  });

  app.post(
    '/api/qualifications',
    requireJwtAuth,
    requireRoles('admin', 'operador'),
    async (req: AuthenticatedRequest, res) => {
      const created = await createQualification(req.body || {}, {
        id: req.auth!.sub,
        fullName: req.auth!.fullName,
      });
      await appendAuditLog({
        action: 'CREAR_CALIFICACION',
        module: 'CALIFICACIONES',
        userName: req.auth!.fullName,
        userId: req.auth!.sub,
        ipAddress: clientIp(req),
        detail: `${created.emisor} (${created.mercado} · ${created.ejercicio})`,
      });
      res.status(201).json(created);
    }
  );

  app.put(
    '/api/qualifications/:id',
    requireJwtAuth,
    requireRoles('admin', 'operador'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const updated = await updateQualification(String(req.params.id), req.body || {});
        await appendAuditLog({
          action: 'ACTUALIZAR_CALIFICACION',
          module: 'CALIFICACIONES',
          userName: req.auth!.fullName,
          userId: req.auth!.sub,
          ipAddress: clientIp(req),
          detail: `${updated.emisor} -> ${updated.estado}`,
        });
        res.json(updated);
      } catch (err) {
        res.status(404).json({ error: err instanceof Error ? err.message : 'No encontrada' });
      }
    }
  );

  app.delete(
    '/api/qualifications/:id',
    requireJwtAuth,
    requireRoles('admin'),
    async (req: AuthenticatedRequest, res) => {
      await deleteQualification(String(req.params.id));
      await appendAuditLog({
        action: 'ELIMINAR_CALIFICACION',
        module: 'CALIFICACIONES',
        userName: req.auth!.fullName,
        userId: req.auth!.sub,
        ipAddress: clientIp(req),
        detail: `Calificación eliminada (${String(req.params.id)})`,
      });
      res.json({ ok: true });
    }
  );

  // DJ1948 Mass Upload & Presentation
  app.get('/api/dj1948/template', (_req, res) => {
    const csv = [
      'EMISOR;RUT_EMISOR;MERCADO;EJERCICIO;TIPO_RENTA;MONTO_BRUTO;FACTOR_8;FACTOR_10;FACTOR_15;ESTADO',
      'Banco de Chile;97.004.000-5;CL;2024;Dividendos Ordinarios DJ1948;120000000;0.273972;0.145;0.05;VIGENTE',
    ].join('\n');
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="plantilla_dj1948_nuam.csv"');
    res.send(csv);
  });

  app.get('/api/dj1948/batches', requireJwtAuth, async (_req, res) => {
    res.json(await listBatches());
  });

  app.post(
    '/api/dj1948/upload',
    requireJwtAuth,
    requireRoles('admin', 'operador'),
    async (req: AuthenticatedRequest, res) => {
      const { fileName, ejercicio, processType, content } = req.body || {};
      if (!content || !fileName) {
        res.status(400).json({ error: 'Archivo DJ1948 requerido.' });
        return;
      }
      const batch = await processDj1948Csv(
        {
          fileName: String(fileName),
          ejercicio: Number(ejercicio || 2024),
          processType: String(processType || 'Declaración Jurada 1948'),
          content: String(content),
        },
        { id: req.auth!.sub, fullName: req.auth!.fullName }
      );
      await appendAuditLog({
        action: 'CARGA_MASIVA',
        module: 'CARGA_ARCHIVO',
        userName: req.auth!.fullName,
        userId: req.auth!.sub,
        ipAddress: clientIp(req),
        detail: `${batch.fileName} (${batch.successCount} exitosos / ${batch.errorCount} errores)`,
      });
      res.status(201).json(batch);
    }
  );

  app.post(
    '/api/dj1948/present',
    requireJwtAuth,
    requireRoles('admin', 'operador'),
    async (req: AuthenticatedRequest, res) => {
      const year = Number(req.body?.year || 2024);
      const result = await presentDj1948ByYear(year);
      await appendAuditLog({
        action: 'PRESENTACION_DJ1948',
        module: 'DJ1948',
        userName: req.auth!.fullName,
        userId: req.auth!.sub,
        ipAddress: clientIp(req),
        detail: `Folio ${result.folio} (${result.presentedCount} calificaciones presentadas)`,
      });
      res.json(result);
    }
  );

  app.delete(
    '/api/dj1948/batches/:id',
    requireJwtAuth,
    requireRoles('admin'),
    async (req: AuthenticatedRequest, res) => {
      await deleteBatch(String(req.params.id));
      await appendAuditLog({
        action: 'ELIMINAR_LOTE_DJ1948',
        module: 'CARGA_ARCHIVO',
        userName: req.auth!.fullName,
        userId: req.auth!.sub,
        ipAddress: clientIp(req),
        detail: `Lote eliminado (${String(req.params.id)})`,
      });
      res.json({ ok: true });
    }
  );

  // Users Admin (RBAC)
  app.get('/api/users', requireJwtAuth, async (_req, res) => {
    res.json(await listUsers());
  });

  app.post(
    '/api/users',
    requireJwtAuth,
    requireRoles('admin'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const { email, fullName, role, market, password } = req.body || {};
        if (!email || !fullName) {
          res.status(400).json({ error: 'Nombre y correo institucional obligatorios.' });
          return;
        }
        const created = await createUser({
          email: String(email),
          fullName: String(fullName),
          role: role || 'operador',
          market: market || 'CL',
          password: password ? String(password) : undefined,
        });
        await appendAuditLog({
          action: 'CREAR_USUARIO',
          module: 'ADMIN_USUARIOS',
          userName: req.auth!.fullName,
          userId: req.auth!.sub,
          ipAddress: clientIp(req),
          detail: `Usuario ${created.email} creado con rol ${created.role}.`,
        });
        res.status(201).json(created);
      } catch (err) {
        res.status(400).json({ error: err instanceof Error ? err.message : 'Error creando usuario.' });
      }
    }
  );

  app.put(
    '/api/users/:id',
    requireJwtAuth,
    requireRoles('admin'),
    async (req: AuthenticatedRequest, res) => {
      try {
        const updated = await updateUser(String(req.params.id), req.body || {});
        await appendAuditLog({
          action: 'ACTUALIZAR_USUARIO',
          module: 'ADMIN_USUARIOS',
          userName: req.auth!.fullName,
          userId: req.auth!.sub,
          ipAddress: clientIp(req),
          detail: `Usuario ${updated.email} actualizado (${updated.role} · ${updated.active ? 'ACTIVO' : 'INACTIVO'}).`,
        });
        res.json(updated);
      } catch (err) {
        res.status(404).json({ error: err instanceof Error ? err.message : 'Usuario no encontrado.' });
      }
    }
  );

  app.delete(
    '/api/users/:id',
    requireJwtAuth,
    requireRoles('admin'),
    async (req: AuthenticatedRequest, res) => {
      if (String(req.params.id) === req.auth!.sub) {
        res.status(400).json({ error: 'No puede eliminar su propia sesión activa.' });
        return;
      }
      await deleteUser(String(req.params.id));
      await appendAuditLog({
        action: 'ELIMINAR_USUARIO',
        module: 'ADMIN_USUARIOS',
        userName: req.auth!.fullName,
        userId: req.auth!.sub,
        ipAddress: clientIp(req),
        detail: `Usuario eliminado (${String(req.params.id)}).`,
      });
      res.json({ ok: true });
    }
  );

  // Audit & Real-Time Reports (REST + SSE)
  app.get('/api/audit', requireJwtAuth, async (_req, res) => {
    res.json(await listAuditLogs());
  });

  app.get('/api/reports/realtime', requireJwtAuth, async (_req, res) => {
    const [summary, batches, auditLogs, users] = await Promise.all([
      computeDashboardSummary(),
      listBatches(),
      listAuditLogs(),
      listUsers(),
    ]);
    res.json({
      summary,
      activeUsersCount: users.filter((u) => u.active).length,
      recentBatches: batches.slice(0, 5),
      recentAudit: auditLogs.slice(0, 10),
      generatedAt: new Date().toISOString(),
    });
  });

  app.get('/api/reports/stream', requireJwtAuth, async (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders?.();

    const sendSnapshot = async (eventType = 'snapshot') => {
      try {
        const [summary, auditLogs, users] = await Promise.all([
          computeDashboardSummary(),
          listAuditLogs(),
          listUsers(),
        ]);
        res.write(
          `event: ${eventType}\ndata: ${JSON.stringify({
            summary,
            activeUsersCount: users.filter((u) => u.active).length,
            latestAudit: auditLogs.slice(0, 8),
            timestamp: new Date().toISOString(),
          })}\n\n`
        );
      } catch {
        // Ignore stream write failure on closed sockets
      }
    };

    await sendSnapshot('snapshot');
    const onSync = () => {
      void sendSnapshot('update');
    };
    const heartbeat = setInterval(() => {
      void sendSnapshot('heartbeat');
    }, 15000);

    realtimeBus.on('sync', onSync);
    req.on('close', () => {
      clearInterval(heartbeat);
      realtimeBus.off('sync', onSync);
    });
  });

  return app;
}
