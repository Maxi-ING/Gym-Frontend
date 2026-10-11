import { useCallback, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from './adminService';
import { useResource } from '../../hooks/useResource';
import { validName } from '../../lib/validation';
import { errorMessage } from '../../lib/api';
import Input from '../../components/Input';
import Select from '../../components/Select';
import Button from '../../components/Button';
import Pagination from '../../components/Pagination';
import { EmptyState, ErrorState, LoadingState } from '../../components/Feedback';
export default function UsersPage() {
  const [filters, setFilters] = useState({ q: '', rol: '', estado: '', pagina: 1 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const resource = useResource(
    useCallback((signal: AbortSignal) => adminService.users(filters, signal), [filters]),
  );
  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const el = event.currentTarget;
    const form = new FormData(el);
    setBusy(true);
    setError('');
    setMessage('');
    const nombre = String(form.get('nombre')).trim();
    if (!validName(nombre)) {
      setError('Usa un nombre de 2 a 100 caracteres con letras, espacios o guiones.');
      setBusy(false);
      return;
    }
    try {
      await adminService.createUser({
        nombre,
        correo: String(form.get('correo')).trim(),
        clave: String(form.get('clave')),
        rol: form.get('rol') === 'admin' ? 'admin' : 'usuario',
      });
      el.reset();
      setMessage('Cuenta creada. Comunica la contraseña temporal al usuario por un canal privado.');
      setFilters({ ...filters, pagina: 1 });
      resource.reload();
    } catch (e) {
      setError(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="page-stack">
      <div className="page-heading">
        <div>
          <div className="eyebrow">ADMINISTRACIÓN</div>
          <h1>Usuarios</h1>
          <p>Gestiona cuentas, permisos y acceso al gimnasio.</p>
        </div>
        <span className="tag">Acceso de administrador</span>
      </div>
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>Directorio de usuarios</h2>
            <p>Abre una cuenta para consultar su perfil, sesiones y metas.</p>
          </div>
        </div>
        <form
          className="filter-bar"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            setFilters({ ...filters, q: String(form.get('q')).trim(), pagina: 1 });
          }}
        >
          <Input label="Buscar por nombre o correo" name="q" maxLength={100} type="search" />
          <Select
            label="Rol"
            value={filters.rol}
            onChange={(e) => setFilters({ ...filters, rol: e.target.value, pagina: 1 })}
          >
            <option value="">Todos</option>
            <option value="usuario">Usuario</option>
            <option value="admin">Administrador</option>
          </Select>
          <Select
            label="Estado"
            value={filters.estado}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value, pagina: 1 })}
          >
            <option value="">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </Select>
          <Button type="submit" variant="secondary">
            Buscar
          </Button>
        </form>
        {resource.loading ? (
          <LoadingState />
        ) : resource.error ? (
          <ErrorState message={resource.error} retry={resource.reload} />
        ) : (
          resource.data && (
            <>
              {resource.data.items.length ? (
                <div className="table-wrap">
                  <table>
                    <caption className="sr-only">Directorio de usuarios</caption>
                    <thead>
                      <tr>
                        <th>Usuario</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Perfil</th>
                        <th>Gestión</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resource.data.items.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <strong>{u.nombre}</strong>
                            <small className="table-subtext">{u.correo}</small>
                          </td>
                          <td>{u.rol === 'admin' ? 'Administrador' : 'Usuario'}</td>
                          <td>
                            <span className={`tag ${u.activo ? '' : 'tag-inactive'}`}>
                              {u.activo ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td>{u.perfil_completo ? 'Completo' : 'Pendiente'}</td>
                          <td>
                            <Link
                              className="button button-secondary"
                              to={`/usuarios/${u.id}`}
                              viewTransition
                            >
                              Gestionar {u.nombre.split(' ')[0]}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <EmptyState title="Sin coincidencias">
                  Prueba con otro nombre, correo o filtro.
                </EmptyState>
              )}
              <Pagination
                pagina={resource.data.pagina}
                total={resource.data.total}
                porPagina={resource.data.por_pagina}
                onChange={(pagina) => setFilters({ ...filters, pagina })}
              />
            </>
          )
        )}
      </section>
      <details className="panel disclosure">
        <summary>Crear una cuenta</summary>
        <p className="section-description">
          El registro público siempre crea usuarios. Solo un administrador puede asignar este rol
          desde aquí.
        </p>
        <form className="form-stack" onSubmit={create}>
          <fieldset disabled={busy} className="form-grid">
            <Input name="nombre" label="Nombre completo" minLength={2} maxLength={100} required />
            <Input
              name="correo"
              label="Correo de la nueva cuenta"
              type="email"
              maxLength={254}
              required
            />
            <Input
              name="clave"
              label="Contraseña temporal"
              type="password"
              minLength={8}
              maxLength={128}
              autoComplete="new-password"
              required
            />
            <Select name="rol" label="Rol de la nueva cuenta" defaultValue="usuario">
              <option value="usuario">Usuario</option>
              <option value="admin">Administrador</option>
            </Select>
          </fieldset>
          {error && <ErrorState message={error} />}{' '}
          {message && (
            <div className="feedback feedback-success" role="status">
              {message}
            </div>
          )}
          <div className="form-actions">
            <Button type="submit" loading={busy}>
              Crear cuenta
            </Button>
          </div>
        </form>
      </details>
    </div>
  );
}
