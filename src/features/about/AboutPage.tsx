import { Link } from 'react-router-dom';
import { useAuth } from '../users/AuthProvider';
import Icon from '../../components/Icon';
import { useMotionReveal } from '../../hooks/useMotionReveal';

const journey = [
  {
    year: '2019',
    title: 'Un lugar para empezar',
    text: 'En nuestro relato, PowerGym abre en Lima como un espacio de entrenamiento de fuerza, cercano y sin complicaciones.',
  },
  {
    year: '2023',
    title: 'Un hábito que se comparte',
    text: 'El acompañamiento y el registro de las sesiones pasan a formar parte de la experiencia que queremos ofrecer.',
  },
  {
    year: '2026',
    title: 'El esfuerzo se hace visible',
    text: 'FitAnalytics reúne el historial, los gráficos y las metas para entender el progreso sesión a sesión.',
  },
];

export default function AboutPage() {
  const { user } = useAuth();
  const motion = useMotionReveal(!user);
  return (
    <div ref={motion} className={user ? 'about-page' : 'public-about'}>
      {!user && (
        <header className="public-header">
          <Link to="/" className="brand" aria-label="FitAnalytics AI inicio" viewTransition>
            <span className="brand-mark">
              <Icon name="training" size={22} />
            </span>
            fitanalytics<small>AI</small>
          </Link>
          <Link to="/" className="button button-secondary" viewTransition>
            Volver al acceso <Icon name="arrow" size={16} />
          </Link>
        </header>
      )}
      <div className="about-content">
        <section className="about-opening">
          <div>
            <h1>Fuerza con propósito.</h1>
            <p className="about-lead">
              Somos PowerGym Lima. Un espacio para construir constancia y comprender el esfuerzo que
              pones en cada sesión.
            </p>
            <p>
              Creemos en el entrenamiento que se adapta a las personas: metas claras, un historial
              ordenado y tiempo para aprender. Aquí, avanzar también significa entender de dónde
              vienes.
            </p>
            <a className="link about-story-link" href="#nuestra-historia">
              Conoce nuestra historia <Icon name="arrow" size={18} />
            </a>
          </div>
          <figure className="about-image">
            <img
              src="/images/weights.webp"
              alt="Mancuernas de hierro y acero ordenadas en un soporte"
              width="1400"
              height="1027"
            />
            <figcaption>
              Imagen de ambientación de Brett Jordan /{' '}
              <a
                href="https://unsplash.com/photos/black-and-silver-dumbbells-on-black-steel-rack-NAENofLAWjE"
                target="_blank"
                rel="noreferrer"
              >
                Unsplash
              </a>
              .
            </figcaption>
          </figure>
        </section>

        <section className="about-history" id="nuestra-historia">
          <div className="about-section-title">
            <h2>Nuestra historia</h2>
            <p>Del entrenamiento al seguimiento.</p>
          </div>
          <ol className="about-journey">
            {journey.map((item) => (
              <li key={item.year}>
                <span className="journey-year">{item.year}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </li>
            ))}
          </ol>
          <p className="about-fiction">
            PowerGym Lima es el caso ilustrativo de este proyecto. Su historia y los hitos de esta
            sección son ficticios.
          </p>
        </section>

        <section className="about-principles">
          <h2>Lo que nos mueve</h2>
          <dl>
            <div>
              <dt>Constancia</dt>
              <dd>Valorar el proceso completo, con sus avances, pausas y cambios.</dd>
            </div>
            <div>
              <dt>Claridad</dt>
              <dd>Convertir los registros en información que puedas entender y revisar.</dd>
            </div>
            <div>
              <dt>Criterio</dt>
              <dd>
                Usar las estimaciones como una referencia y acompañarlas con la orientación de tu
                entrenador.
              </dd>
            </div>
          </dl>
        </section>

        <section className="about-platform">
          <div>
            <h2>Tu esfuerzo tiene un historial.</h2>
            <p>
              FitAnalytics te permite registrar ejercicios, revisar tus mediciones y consultar la
              evolución de tus cargas. El análisis predictivo utiliza regresión lineal; sus mensajes
              se construyen con reglas, sin un agente de IA.
            </p>
          </div>
          <Link
            to={user?.rol === 'usuario' ? '/entrenamiento' : '/'}
            className="button button-primary"
            viewTransition
          >
            {user ? 'Volver a mi espacio' : 'Entrar a FitAnalytics'} <Icon name="arrow" size={18} />
          </Link>
        </section>
      </div>
      {!user && (
        <footer className="public-footer">
          <span>FitAnalytics AI · PowerGym Lima</span>
          <span>Entrena. Registra. Comprende.</span>
        </footer>
      )}
    </div>
  );
}
