export type TemplateVariables = {
  "--layout-card-radius": string;
  "--layout-card-shadow": string;
  "--layout-card-border": string;
  "--layout-card-surface": string;
  "--layout-button-radius": string;
  "--layout-button-shadow": string;
  "--layout-font-heading": string;
  "--layout-font-body": string;
  "--layout-font-ui": string;
  "--layout-surface-gradient": string;
  "--layout-surface-overlay": string;
  "--layout-panel-blur": string;
  "--layout-hero-gradient": string;
  "--layout-hero-glow": string;
  "--layout-container-max": string;
  "--layout-section-gap": string;
  "--layout-navbar-background": string;
  "--layout-navbar-shadow": string;
  "--layout-divider-glow": string;
  "--layout-list-stripe": string;
  "--layout-focus-ring": string;
  "--layout-badge-glow": string;
};

export type TemplateSelection = {
  type: 'preset' | 'custom';
  id: string;
};

export type TemplateLike = {
  id: string;
  name: string;
  variables: TemplateVariables;
  isCustom?: boolean;
};

export interface TemplateDefinition extends TemplateLike {
  tagline: string;
  description: string;
  category: string;
  price: string;
  features: string[];
  fonts: {
    heading: string;
    body: string;
    ui: string;
  };
  iconography: string[];
  buttonStyles: string[];
  palette: {
    primary: string;
    secondary: string;
    accent: string;
    neutral: string;
    background: string;
  };
  preview: {
    gradient: string;
    spotlight: string;
    accentShape: string;
  };
}

export const TEMPLATE_STORAGE_KEY = 'uns-active-template';
export const CUSTOM_TEMPLATE_STORAGE_KEY = 'uns-custom-templates';
export const TEMPLATE_EVENT_NAME = 'uns:template-change';

export const defaultTemplateVariables: TemplateVariables = {
  "--layout-card-radius": '18px',
  "--layout-card-shadow": '0 35px 80px rgba(15, 23, 42, 0.15)',
  "--layout-card-border": 'rgba(148, 163, 184, 0.35)',
  "--layout-card-surface": 'linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.92) 100%)',
  "--layout-button-radius": '999px',
  "--layout-button-shadow": '0 18px 45px rgba(59, 130, 246, 0.25)',
  "--layout-font-heading": 'var(--font-inter)',
  "--layout-font-body": 'var(--font-manrope)',
  "--layout-font-ui": 'var(--font-space-grotesk)',
  "--layout-surface-gradient": 'radial-gradient(circle at 25% -10%, rgba(14, 165, 233, 0.22), transparent 55%), radial-gradient(circle at 80% 0%, rgba(236, 72, 153, 0.2), transparent 60%)',
  "--layout-surface-overlay": 'rgba(255,255,255,0.35)',
  "--layout-panel-blur": '18px',
  "--layout-hero-gradient": 'linear-gradient(135deg, rgba(59,130,246,0.85) 0%, rgba(56,189,248,0.85) 45%, rgba(236,72,153,0.8) 100%)',
  "--layout-hero-glow": '0 45px 120px rgba(14, 116, 144, 0.35)',
  "--layout-container-max": '1240px',
  "--layout-section-gap": '3.5rem',
  "--layout-navbar-background": 'rgba(15, 23, 42, 0.55)',
  "--layout-navbar-shadow": '0 15px 60px rgba(15, 23, 42, 0.22)',
  "--layout-divider-glow": 'linear-gradient(90deg, rgba(14, 165, 233, 0) 0%, rgba(59, 130, 246, 0.35) 45%, rgba(236, 72, 153, 0) 100%)',
  "--layout-list-stripe": 'linear-gradient(90deg, rgba(148, 163, 184, 0.08) 0%, rgba(148, 163, 184, 0.18) 100%)',
  "--layout-focus-ring": '0 0 0 4px rgba(59, 130, 246, 0.35)',
  "--layout-badge-glow": '0 0 0 3px rgba(56, 189, 248, 0.35)'
};

const withVariables = (variables: Partial<TemplateVariables>): TemplateVariables => ({
  ...defaultTemplateVariables,
  ...variables,
});

export const templates: TemplateDefinition[] = [
  {
    id: 'executive-elegance',
    name: 'Executive Elegance',
    tagline: 'Refined corporate minimalism',
    description: 'Un formato premium inspirado en consultoras de élite con énfasis en claridad, tipografía de alto contraste y jerarquías sofisticadas.',
    category: 'Corporativo',
    price: '$189',
    features: [
      'Secciones en vidrio esmerilado con blur dinámico',
      'Sombras balanceadas con efecto flotante realista',
      'Controles con radios fluidos y microinteracciones'
    ],
    fonts: {
      heading: 'Playfair Display',
      body: 'Manrope',
      ui: 'Space Grotesk',
    },
    iconography: ['Lucide Outline', 'Heroicons Minimal', 'Feather Corporate'],
    buttonStyles: ['Primary Glass CTA', 'Outline Executive', 'Soft Gradient Pill', 'Minimal Icon CTA'],
    palette: {
      primary: '#0F172A',
      secondary: '#1E293B',
      accent: '#38BDF8',
      neutral: '#E2E8F0',
      background: '#F8FAFC'
    },
    preview: {
      gradient: 'linear-gradient(145deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.65) 40%, rgba(30, 64, 175, 0.75) 100%)',
      spotlight: 'radial-gradient(circle at 30% 20%, rgba(56, 189, 248, 0.35), transparent 55%)',
      accentShape: 'radial-gradient(circle at 75% 30%, rgba(148, 163, 184, 0.22), transparent 60%)'
    },
    variables: withVariables({
      "--layout-card-radius": '22px',
      "--layout-card-shadow": '0 35px 85px rgba(15, 23, 42, 0.28)',
      "--layout-card-border": 'rgba(148, 163, 184, 0.35)',
      "--layout-card-surface": 'linear-gradient(155deg, rgba(15, 23, 42, 0.9) 0%, rgba(15, 23, 42, 0.78) 35%, rgba(30, 64, 175, 0.82) 100%)',
      "--layout-button-radius": '18px',
      "--layout-button-shadow": '0 20px 55px rgba(56, 189, 248, 0.35)',
      "--layout-font-heading": 'var(--font-playfair)',
      "--layout-font-body": 'var(--font-manrope)',
      "--layout-font-ui": 'var(--font-space-grotesk)',
      "--layout-surface-gradient": 'radial-gradient(circle at 20% -10%, rgba(30, 64, 175, 0.35), transparent 55%), radial-gradient(circle at 80% 0%, rgba(148, 163, 184, 0.28), transparent 60%)',
      "--layout-surface-overlay": 'rgba(15, 23, 42, 0.55)',
      "--layout-panel-blur": '22px',
      "--layout-hero-gradient": 'linear-gradient(135deg, rgba(15,23,42,0.92) 0%, rgba(30,64,175,0.88) 50%, rgba(56,189,248,0.9) 100%)',
      "--layout-hero-glow": '0 55px 130px rgba(30, 64, 175, 0.45)',
      "--layout-container-max": '1280px',
      "--layout-section-gap": '4rem',
      "--layout-navbar-background": 'rgba(15, 23, 42, 0.75)',
      "--layout-navbar-shadow": '0 25px 75px rgba(15, 23, 42, 0.35)',
      "--layout-divider-glow": 'linear-gradient(90deg, rgba(56, 189, 248, 0) 0%, rgba(56, 189, 248, 0.6) 45%, rgba(56, 189, 248, 0) 100%)',
      "--layout-list-stripe": 'linear-gradient(90deg, rgba(15, 23, 42, 0.25) 0%, rgba(15, 23, 42, 0.45) 100%)',
      "--layout-focus-ring": '0 0 0 4px rgba(56, 189, 248, 0.45)',
      "--layout-badge-glow": '0 0 0 4px rgba(56, 189, 248, 0.5)'
    })
  },
  {
    id: 'caribbean-aurora',
    name: 'Caribbean Aurora',
    tagline: 'Energía tropical envolvente',
    description: 'Un formato inspirado en resorts de lujo del Caribe con gradientes envolventes, luz cálida y tarjetas translúcidas.',
    category: 'Inmersivo',
    price: '$179',
    features: [
      'Hero con efecto aurora y destellos animados',
      'Superficies translúcidas con brillos orgánicos',
      'Botones con efecto gel y sombras suaves'
    ],
    fonts: {
      heading: 'Poppins',
      body: 'Urbanist',
      ui: 'Space Grotesk',
    },
    iconography: ['Lucide Filled Accent', 'Phosphor Duotone', 'Remix Color'],
    buttonStyles: ['Gradient Wave CTA', 'Glass Secondary', 'Icon Chip Buttons', 'Neon Outline CTA'],
    palette: {
      primary: '#0EA5E9',
      secondary: '#22D3EE',
      accent: '#F97316',
      neutral: '#F8FAFC',
      background: '#0F172A'
    },
    preview: {
      gradient: 'linear-gradient(140deg, rgba(14, 165, 233, 0.85) 0%, rgba(34, 211, 238, 0.82) 45%, rgba(249, 115, 22, 0.78) 100%)',
      spotlight: 'radial-gradient(circle at 18% 15%, rgba(56, 189, 248, 0.45), transparent 55%)',
      accentShape: 'radial-gradient(circle at 82% 25%, rgba(236, 72, 153, 0.35), transparent 60%)'
    },
    variables: withVariables({
      "--layout-card-radius": '28px',
      "--layout-card-shadow": '0 45px 110px rgba(14, 165, 233, 0.28)',
      "--layout-card-border": 'rgba(255, 255, 255, 0.22)',
      "--layout-card-surface": 'linear-gradient(155deg, rgba(255,255,255,0.22) 0%, rgba(148, 239, 255, 0.3) 100%)',
      "--layout-button-radius": '26px',
      "--layout-button-shadow": '0 30px 60px rgba(15, 118, 110, 0.35)',
      "--layout-font-heading": 'var(--font-poppins)',
      "--layout-font-body": 'var(--font-urbanist)',
      "--layout-font-ui": 'var(--font-space-grotesk)',
      "--layout-surface-gradient": 'radial-gradient(circle at 25% -8%, rgba(56, 189, 248, 0.45), transparent 55%), radial-gradient(circle at 80% -5%, rgba(249, 115, 22, 0.35), transparent 60%)',
      "--layout-surface-overlay": 'rgba(15, 118, 110, 0.28)',
      "--layout-panel-blur": '28px',
      "--layout-hero-gradient": 'linear-gradient(130deg, rgba(15, 118, 110, 0.78) 0%, rgba(14,165,233,0.82) 45%, rgba(249, 115, 22, 0.75) 100%)',
      "--layout-hero-glow": '0 65px 140px rgba(14, 165, 233, 0.55)',
      "--layout-container-max": '1320px',
      "--layout-section-gap": '4.5rem',
      "--layout-navbar-background": 'rgba(15, 118, 110, 0.58)',
      "--layout-navbar-shadow": '0 30px 80px rgba(14, 116, 144, 0.35)',
      "--layout-divider-glow": 'linear-gradient(90deg, rgba(34,211,238,0) 0%, rgba(34,211,238,0.6) 45%, rgba(249,115,22,0) 100%)',
      "--layout-list-stripe": 'linear-gradient(90deg, rgba(14, 116, 144, 0.28) 0%, rgba(15, 118, 110, 0.45) 100%)',
      "--layout-focus-ring": '0 0 0 4px rgba(34, 211, 238, 0.45)',
      "--layout-badge-glow": '0 0 0 4px rgba(249, 115, 22, 0.45)'
    })
  },
  {
    id: 'tokyo-neon-grid',
    name: 'Tokyo Neon Grid',
    tagline: 'Cyberpunk productivity suite',
    description: 'Una plantilla futurista inspirada en Tokio con rejillas luminosas, neones intensos y enfoque en métricas.',
    category: 'Futurista',
    price: '$199',
    features: [
      'Rejillas dinámicas con efecto parallax',
      'Sombras interiores con brillos neón',
      'Panels modulares con tipografía técnica'
    ],
    fonts: {
      heading: 'Space Grotesk',
      body: 'Urbanist',
      ui: 'Manrope',
    },
    iconography: ['Lucide Neon', 'Heroicons Tech', 'Radix Futurist'],
    buttonStyles: ['Cyber Primary', 'Neon Outline', 'Terminal Ghost', 'Holographic CTA'],
    palette: {
      primary: '#6366F1',
      secondary: '#312E81',
      accent: '#F472B6',
      neutral: '#1E1B4B',
      background: '#0F172A'
    },
    preview: {
      gradient: 'linear-gradient(140deg, rgba(30, 64, 175, 0.88) 0%, rgba(99, 102, 241, 0.85) 45%, rgba(244, 114, 182, 0.78) 100%)',
      spotlight: 'radial-gradient(circle at 25% 18%, rgba(96, 165, 250, 0.4), transparent 60%)',
      accentShape: 'radial-gradient(circle at 80% 25%, rgba(244, 114, 182, 0.35), transparent 65%)'
    },
    variables: withVariables({
      "--layout-card-radius": '20px',
      "--layout-card-shadow": '0 45px 120px rgba(99, 102, 241, 0.35)',
      "--layout-card-border": 'rgba(129, 140, 248, 0.42)',
      "--layout-card-surface": 'linear-gradient(160deg, rgba(15, 23, 42, 0.92) 0%, rgba(30, 64, 175, 0.85) 45%, rgba(99, 102, 241, 0.78) 100%)',
      "--layout-button-radius": '20px',
      "--layout-button-shadow": '0 32px 85px rgba(99, 102, 241, 0.45)',
      "--layout-font-heading": 'var(--font-space-grotesk)',
      "--layout-font-body": 'var(--font-urbanist)',
      "--layout-font-ui": 'var(--font-manrope)',
      "--layout-surface-gradient": 'radial-gradient(circle at 20% -5%, rgba(37, 99, 235, 0.4), transparent 55%), radial-gradient(circle at 78% 0%, rgba(244, 114, 182, 0.38), transparent 60%)',
      "--layout-surface-overlay": 'rgba(15, 23, 42, 0.7)',
      "--layout-panel-blur": '16px',
      "--layout-hero-gradient": 'linear-gradient(140deg, rgba(14, 14, 52, 0.92) 0%, rgba(30, 64, 175, 0.9) 50%, rgba(236, 72, 153, 0.8) 100%)',
      "--layout-hero-glow": '0 65px 150px rgba(99, 102, 241, 0.55)',
      "--layout-container-max": '1320px',
      "--layout-section-gap": '3.8rem',
      "--layout-navbar-background": 'rgba(17, 24, 39, 0.75)',
      "--layout-navbar-shadow": '0 35px 90px rgba(99, 102, 241, 0.35)',
      "--layout-divider-glow": 'linear-gradient(90deg, rgba(99,102,241,0) 0%, rgba(99,102,241,0.6) 45%, rgba(244,114,182,0) 100%)',
      "--layout-list-stripe": 'linear-gradient(90deg, rgba(79, 70, 229, 0.28) 0%, rgba(67, 56, 202, 0.45) 100%)',
      "--layout-focus-ring": '0 0 0 4px rgba(99, 102, 241, 0.45)',
      "--layout-badge-glow": '0 0 0 4px rgba(244, 114, 182, 0.5)'
    })
  },
  {
    id: 'zen-garden',
    name: 'Zen Garden',
    tagline: 'Serenidad editorial',
    description: 'Inspirada en revistas japonesas de diseño: espacios generosos, tipografía elegante y texturas sutiles.',
    category: 'Editorial',
    price: '$172',
    features: [
      'Composición en columnas con ritmo tipográfico',
      'Detalles en trazos de tinta digital',
      'Sombras suaves y bordes orgánicos'
    ],
    fonts: {
      heading: 'Lora',
      body: 'Manrope',
      ui: 'Inter',
    },
    iconography: ['Lucide Stroke', 'Feather Minimal', 'Iconscout Lineal'],
    buttonStyles: ['Muted Outline', 'Ink Accent', 'Rounded Secondary', 'Glyph Ghost'],
    palette: {
      primary: '#0F766E',
      secondary: '#0D9488',
      accent: '#F97316',
      neutral: '#F1F5F9',
      background: '#F8FAFC'
    },
    preview: {
      gradient: 'linear-gradient(125deg, rgba(15, 118, 110, 0.78) 0%, rgba(13, 148, 136, 0.72) 55%, rgba(249, 115, 22, 0.65) 100%)',
      spotlight: 'radial-gradient(circle at 28% 18%, rgba(45, 212, 191, 0.32), transparent 58%)',
      accentShape: 'radial-gradient(circle at 78% 25%, rgba(249, 115, 22, 0.25), transparent 60%)'
    },
    variables: withVariables({
      "--layout-card-radius": '32px',
      "--layout-card-shadow": '0 38px 95px rgba(15, 118, 110, 0.22)',
      "--layout-card-border": 'rgba(13, 148, 136, 0.28)',
      "--layout-card-surface": 'linear-gradient(140deg, rgba(255,255,255,0.92) 0%, rgba(209, 250, 229, 0.85) 100%)',
      "--layout-button-radius": '28px',
      "--layout-button-shadow": '0 32px 75px rgba(15, 118, 110, 0.3)',
      "--layout-font-heading": 'var(--font-lora)',
      "--layout-font-body": 'var(--font-manrope)',
      "--layout-font-ui": 'var(--font-inter)',
      "--layout-surface-gradient": 'radial-gradient(circle at 20% -12%, rgba(94, 234, 212, 0.35), transparent 55%), radial-gradient(circle at 70% -8%, rgba(249, 115, 22, 0.28), transparent 60%)',
      "--layout-surface-overlay": 'rgba(15, 23, 42, 0.12)',
      "--layout-panel-blur": '24px',
      "--layout-hero-gradient": 'linear-gradient(135deg, rgba(255,255,255,0.92) 0%, rgba(209, 250, 229, 0.85) 45%, rgba(56, 189, 248, 0.68) 100%)',
      "--layout-hero-glow": '0 45px 120px rgba(14, 116, 144, 0.28)',
      "--layout-container-max": '1180px',
      "--layout-section-gap": '3.2rem',
      "--layout-navbar-background": 'rgba(255,255,255,0.55)',
      "--layout-navbar-shadow": '0 28px 80px rgba(15, 118, 110, 0.2)',
      "--layout-divider-glow": 'linear-gradient(90deg, rgba(15,118,110,0) 0%, rgba(15,118,110,0.45) 45%, rgba(249,115,22,0) 100%)',
      "--layout-list-stripe": 'linear-gradient(90deg, rgba(13, 148, 136, 0.18) 0%, rgba(45, 212, 191, 0.32) 100%)',
      "--layout-focus-ring": '0 0 0 4px rgba(15, 118, 110, 0.35)',
      "--layout-badge-glow": '0 0 0 4px rgba(249, 115, 22, 0.35)'
    })
  },
  {
    id: 'nordic-minimal',
    name: 'Nordic Minimal Luxe',
    tagline: 'Minimalismo cálido y táctil',
    description: 'Diseño escandinavo con materiales táctiles, sombras suaves y ritmo modular muy equilibrado.',
    category: 'Minimalista',
    price: '$165',
    features: [
      'Tarjetas en capas con efecto de papel',
      'Tipografía suave y espaciados amplios',
      'Fondo texturizado con iluminación lateral'
    ],
    fonts: {
      heading: 'Inter',
      body: 'Manrope',
      ui: 'Space Grotesk',
    },
    iconography: ['Lucide Line', 'Heroicons Outline', 'Tabler Minimal'],
    buttonStyles: ['Muted Primary', 'Borderless Ghost', 'Textured Secondary', 'Soft Shadow CTA'],
    palette: {
      primary: '#111827',
      secondary: '#475569',
      accent: '#F59E0B',
      neutral: '#E2E8F0',
      background: '#F8FAFC'
    },
    preview: {
      gradient: 'linear-gradient(140deg, rgba(15, 23, 42, 0.75) 0%, rgba(30, 41, 59, 0.68) 45%, rgba(245, 158, 11, 0.55) 100%)',
      spotlight: 'radial-gradient(circle at 30% 20%, rgba(226, 232, 240, 0.4), transparent 65%)',
      accentShape: 'radial-gradient(circle at 80% 25%, rgba(245, 158, 11, 0.28), transparent 60%)'
    },
    variables: withVariables({
      "--layout-card-radius": '24px',
      "--layout-card-shadow": '0 28px 80px rgba(71, 85, 105, 0.28)',
      "--layout-card-border": 'rgba(15, 23, 42, 0.12)',
      "--layout-card-surface": 'linear-gradient(140deg, rgba(255,255,255,0.95) 0%, rgba(226, 232, 240, 0.92) 100%)',
      "--layout-button-radius": '22px',
      "--layout-button-shadow": '0 24px 60px rgba(15, 23, 42, 0.22)',
      "--layout-font-heading": 'var(--font-inter)',
      "--layout-font-body": 'var(--font-manrope)',
      "--layout-font-ui": 'var(--font-space-grotesk)',
      "--layout-surface-gradient": 'radial-gradient(circle at 25% -5%, rgba(148, 163, 184, 0.35), transparent 60%), radial-gradient(circle at 75% -10%, rgba(245, 158, 11, 0.22), transparent 65%)',
      "--layout-surface-overlay": 'rgba(15, 23, 42, 0.18)',
      "--layout-panel-blur": '18px',
      "--layout-hero-gradient": 'linear-gradient(130deg, rgba(255,255,255,0.92) 0%, rgba(226, 232, 240, 0.85) 55%, rgba(148, 163, 184, 0.65) 100%)',
      "--layout-hero-glow": '0 40px 120px rgba(148, 163, 184, 0.28)',
      "--layout-container-max": '1200px',
      "--layout-section-gap": '3.4rem',
      "--layout-navbar-background": 'rgba(255,255,255,0.65)',
      "--layout-navbar-shadow": '0 25px 75px rgba(15, 23, 42, 0.18)',
      "--layout-divider-glow": 'linear-gradient(90deg, rgba(15,23,42,0) 0%, rgba(148,163,184,0.45) 45%, rgba(245,158,11,0) 100%)',
      "--layout-list-stripe": 'linear-gradient(90deg, rgba(148, 163, 184, 0.2) 0%, rgba(226, 232, 240, 0.32) 100%)',
      "--layout-focus-ring": '0 0 0 4px rgba(15, 23, 42, 0.3)',
      "--layout-badge-glow": '0 0 0 4px rgba(245, 158, 11, 0.38)'
    })
  },
  {
    id: 'desert-mirage',
    name: 'Desert Mirage',
    tagline: 'Lujo cálido inspirado en hoteles boutique',
    description: 'Una experiencia atmosférica con arena luminosa, brillos solares y tipografía fashion.',
    category: 'Experiencial',
    price: '$185',
    features: [
      'Gradientes solares y reflejos dorados',
      'Capas translúcidas con textura de arena',
      'Botones con relieve suave y brillo lateral'
    ],
    fonts: {
      heading: 'Playfair Display',
      body: 'Lora',
      ui: 'Urbanist',
    },
    iconography: ['Lucide Luxe', 'Heroicons Solid Gold', 'Flaticon Luxe'],
    buttonStyles: ['Sunset Primary', 'Outline Gold', 'Pill Accent', 'Radiant Ghost'],
    palette: {
      primary: '#92400E',
      secondary: '#B45309',
      accent: '#F59E0B',
      neutral: '#FEF3C7',
      background: '#FDF6E3'
    },
    preview: {
      gradient: 'linear-gradient(130deg, rgba(146, 64, 14, 0.82) 0%, rgba(180, 83, 9, 0.78) 45%, rgba(245, 158, 11, 0.7) 100%)',
      spotlight: 'radial-gradient(circle at 22% 18%, rgba(250, 204, 21, 0.32), transparent 60%)',
      accentShape: 'radial-gradient(circle at 78% 28%, rgba(239, 68, 68, 0.25), transparent 65%)'
    },
    variables: withVariables({
      "--layout-card-radius": '30px',
      "--layout-card-shadow": '0 40px 100px rgba(180, 83, 9, 0.32)',
      "--layout-card-border": 'rgba(245, 158, 11, 0.3)',
      "--layout-card-surface": 'linear-gradient(145deg, rgba(255, 247, 237, 0.92) 0%, rgba(253, 230, 138, 0.88) 100%)',
      "--layout-button-radius": '30px',
      "--layout-button-shadow": '0 35px 85px rgba(180, 83, 9, 0.32)',
      "--layout-font-heading": 'var(--font-playfair)',
      "--layout-font-body": 'var(--font-lora)',
      "--layout-font-ui": 'var(--font-urbanist)',
      "--layout-surface-gradient": 'radial-gradient(circle at 25% -8%, rgba(250, 204, 21, 0.38), transparent 55%), radial-gradient(circle at 78% -5%, rgba(249, 115, 22, 0.28), transparent 60%)',
      "--layout-surface-overlay": 'rgba(146, 64, 14, 0.22)',
      "--layout-panel-blur": '26px',
      "--layout-hero-gradient": 'linear-gradient(130deg, rgba(253, 230, 138, 0.92) 0%, rgba(251, 191, 36, 0.85) 55%, rgba(217, 119, 6, 0.78) 100%)',
      "--layout-hero-glow": '0 50px 125px rgba(180, 83, 9, 0.35)',
      "--layout-container-max": '1260px',
      "--layout-section-gap": '3.8rem',
      "--layout-navbar-background": 'rgba(146, 64, 14, 0.58)',
      "--layout-navbar-shadow": '0 35px 90px rgba(180, 83, 9, 0.32)',
      "--layout-divider-glow": 'linear-gradient(90deg, rgba(245,158,11,0) 0%, rgba(245,158,11,0.5) 45%, rgba(239,68,68,0) 100%)',
      "--layout-list-stripe": 'linear-gradient(90deg, rgba(217, 119, 6, 0.25) 0%, rgba(253, 186, 116, 0.35) 100%)',
      "--layout-focus-ring": '0 0 0 4px rgba(245, 158, 11, 0.42)',
      "--layout-badge-glow": '0 0 0 4px rgba(217, 119, 6, 0.38)'
    })
  },
  {
    id: 'atlantic-glass',
    name: 'Atlantic Glasswave',
    tagline: 'Efectos de vidrio líquido y energía atlántica',
    description: 'Tarjetas de vidrio líquido, brillos azules atlánticos y profundidad tridimensional para dashboards premium.',
    category: 'Tecnológico',
    price: '$195',
    features: [
      'Capas de vidrio con reflejos dinámicos',
      'Sombras difusas con tonos fríos',
      'Barridos de luz en headers y tablas'
    ],
    fonts: {
      heading: 'Manrope',
      body: 'Inter',
      ui: 'Space Grotesk',
    },
    iconography: ['Lucide Aqua', 'Heroicons Wireframe', 'CSS.gg Aqua'],
    buttonStyles: ['Glass Primary', 'Light Outline', 'Ghost Icon CTA', 'Ripple Icon Button'],
    palette: {
      primary: '#0EA5E9',
      secondary: '#2563EB',
      accent: '#38BDF8',
      neutral: '#E0F2FE',
      background: '#F8FAFC'
    },
    preview: {
      gradient: 'linear-gradient(140deg, rgba(14, 165, 233, 0.82) 0%, rgba(37, 99, 235, 0.78) 45%, rgba(59, 130, 246, 0.72) 100%)',
      spotlight: 'radial-gradient(circle at 28% 18%, rgba(34, 211, 238, 0.42), transparent 60%)',
      accentShape: 'radial-gradient(circle at 80% 26%, rgba(14, 165, 233, 0.28), transparent 65%)'
    },
    variables: withVariables({
      "--layout-card-radius": '24px',
      "--layout-card-shadow": '0 40px 105px rgba(14, 165, 233, 0.32)',
      "--layout-card-border": 'rgba(165, 243, 252, 0.45)',
      "--layout-card-surface": 'linear-gradient(155deg, rgba(14, 165, 233, 0.28) 0%, rgba(165, 243, 252, 0.38) 100%)',
      "--layout-button-radius": '24px',
      "--layout-button-shadow": '0 32px 85px rgba(37, 99, 235, 0.38)',
      "--layout-font-heading": 'var(--font-manrope)',
      "--layout-font-body": 'var(--font-inter)',
      "--layout-font-ui": 'var(--font-space-grotesk)',
      "--layout-surface-gradient": 'radial-gradient(circle at 20% -5%, rgba(125, 211, 252, 0.45), transparent 55%), radial-gradient(circle at 75% -8%, rgba(56, 189, 248, 0.38), transparent 60%)',
      "--layout-surface-overlay": 'rgba(14, 116, 144, 0.22)',
      "--layout-panel-blur": '30px',
      "--layout-hero-gradient": 'linear-gradient(140deg, rgba(14, 165, 233, 0.85) 0%, rgba(37, 99, 235, 0.8) 45%, rgba(59, 130, 246, 0.78) 100%)',
      "--layout-hero-glow": '0 70px 150px rgba(59, 130, 246, 0.45)',
      "--layout-container-max": '1300px',
      "--layout-section-gap": '4.2rem',
      "--layout-navbar-background": 'rgba(14, 165, 233, 0.55)',
      "--layout-navbar-shadow": '0 35px 95px rgba(14, 165, 233, 0.38)',
      "--layout-divider-glow": 'linear-gradient(90deg, rgba(34,211,238,0) 0%, rgba(14,165,233,0.55) 45%, rgba(59,130,246,0) 100%)',
      "--layout-list-stripe": 'linear-gradient(90deg, rgba(37, 99, 235, 0.28) 0%, rgba(14, 165, 233, 0.35) 100%)',
      "--layout-focus-ring": '0 0 0 4px rgba(59, 130, 246, 0.42)',
      "--layout-badge-glow": '0 0 0 4px rgba(34, 211, 238, 0.42)'
    })
  },
  {
    id: 'midnight-sonata',
    name: 'Midnight Sonata',
    tagline: 'Oscuridad elegante con destellos dorados',
    description: 'Un formato nocturno muy premium con luces doradas, profundidad teatral y tipografía de lujo.',
    category: 'Luxury',
    price: '$205',
    features: [
      'Contrastes altos con destellos dorados',
      'Sombras teatrales y degradados nocturnos',
      'Botones con borde iluminado'
    ],
    fonts: {
      heading: 'Playfair Display',
      body: 'Inter',
      ui: 'Manrope',
    },
    iconography: ['Lucide Midnight', 'Heroicons Luxe', 'Ionicons Premium'],
    buttonStyles: ['Noir Primary', 'Glow Outline', 'Gilded Ghost', 'Aurora CTA'],
    palette: {
      primary: '#C084FC',
      secondary: '#4C1D95',
      accent: '#FACC15',
      neutral: '#1E1B4B',
      background: '#0F172A'
    },
    preview: {
      gradient: 'linear-gradient(135deg, rgba(79, 70, 229, 0.88) 0%, rgba(124, 58, 237, 0.82) 45%, rgba(250, 204, 21, 0.65) 100%)',
      spotlight: 'radial-gradient(circle at 20% 18%, rgba(192, 132, 252, 0.42), transparent 60%)',
      accentShape: 'radial-gradient(circle at 82% 30%, rgba(250, 204, 21, 0.32), transparent 65%)'
    },
    variables: withVariables({
      "--layout-card-radius": '26px',
      "--layout-card-shadow": '0 48px 130px rgba(79, 70, 229, 0.35)',
      "--layout-card-border": 'rgba(250, 204, 21, 0.45)',
      "--layout-card-surface": 'linear-gradient(150deg, rgba(17, 24, 39, 0.92) 0%, rgba(67, 56, 202, 0.85) 55%, rgba(124, 58, 237, 0.78) 100%)',
      "--layout-button-radius": '24px',
      "--layout-button-shadow": '0 40px 95px rgba(124, 58, 237, 0.45)',
      "--layout-font-heading": 'var(--font-playfair)',
      "--layout-font-body": 'var(--font-inter)',
      "--layout-font-ui": 'var(--font-manrope)',
      "--layout-surface-gradient": 'radial-gradient(circle at 28% -8%, rgba(124, 58, 237, 0.45), transparent 55%), radial-gradient(circle at 80% -12%, rgba(250, 204, 21, 0.35), transparent 60%)',
      "--layout-surface-overlay": 'rgba(17, 24, 39, 0.75)',
      "--layout-panel-blur": '18px',
      "--layout-hero-gradient": 'linear-gradient(140deg, rgba(17, 24, 39, 0.95) 0%, rgba(79, 70, 229, 0.88) 50%, rgba(250, 204, 21, 0.75) 100%)',
      "--layout-hero-glow": '0 60px 140px rgba(124, 58, 237, 0.45)',
      "--layout-container-max": '1280px',
      "--layout-section-gap": '4.1rem',
      "--layout-navbar-background": 'rgba(17, 24, 39, 0.78)',
      "--layout-navbar-shadow": '0 38px 105px rgba(79, 70, 229, 0.4)',
      "--layout-divider-glow": 'linear-gradient(90deg, rgba(192,132,252,0) 0%, rgba(192,132,252,0.55) 45%, rgba(250,204,21,0) 100%)',
      "--layout-list-stripe": 'linear-gradient(90deg, rgba(79, 70, 229, 0.32) 0%, rgba(67, 56, 202, 0.42) 100%)',
      "--layout-focus-ring": '0 0 0 4px rgba(192, 132, 252, 0.48)',
      "--layout-badge-glow": '0 0 0 4px rgba(250, 204, 21, 0.45)'
    })
  },
  {
    id: 'nextjstemplates-velocity',
    name: 'NextJS Velocity',
    tagline: 'Componentes modulares listos para startups',
    description: 'Basada en colecciones populares de NextJSTemplates: navegación sticky, secciones métricas e integración con dashboards oscuros.',
    category: 'Startup',
    price: '$188',
    features: [
      'Navbar sticky con fondo translúcido y blur dinámico',
      'Sección de métricas con badges animados e iconos',
      'Tarjetas de testimonios con gradiente radial y botones con iconos'
    ],
    fonts: {
      heading: 'Space Grotesk',
      body: 'Urbanist',
      ui: 'Inter',
    },
    iconography: ['Lucide Startup Kit', 'Heroicons Performance', 'UntitledUI Icons'],
    buttonStyles: ['Velocity Primary', 'Secondary Ghost', 'Icon Split Button', 'Gradient CTA Badge'],
    palette: {
      primary: '#7C3AED',
      secondary: '#5B21B6',
      accent: '#22D3EE',
      neutral: '#1F2937',
      background: '#0F172A'
    },
    preview: {
      gradient: 'linear-gradient(140deg, rgba(124, 58, 237, 0.88) 0%, rgba(91, 33, 182, 0.82) 45%, rgba(34, 211, 238, 0.7) 100%)',
      spotlight: 'radial-gradient(circle at 24% 18%, rgba(124, 58, 237, 0.45), transparent 60%)',
      accentShape: 'radial-gradient(circle at 80% 28%, rgba(34, 211, 238, 0.35), transparent 65%)'
    },
    variables: withVariables({
      "--layout-card-radius": '22px',
      "--layout-card-shadow": '0 46px 125px rgba(124, 58, 237, 0.32)',
      "--layout-card-border": 'rgba(124, 58, 237, 0.28)',
      "--layout-card-surface": 'linear-gradient(150deg, rgba(30, 41, 59, 0.92) 0%, rgba(76, 29, 149, 0.85) 100%)',
      "--layout-button-radius": '22px',
      "--layout-button-shadow": '0 38px 95px rgba(124, 58, 237, 0.45)',
      "--layout-font-heading": 'var(--font-space-grotesk)',
      "--layout-font-body": 'var(--font-urbanist)',
      "--layout-font-ui": 'var(--font-inter)',
      "--layout-surface-gradient": 'radial-gradient(circle at 20% -8%, rgba(124, 58, 237, 0.45), transparent 55%), radial-gradient(circle at 78% -6%, rgba(34, 211, 238, 0.32), transparent 60%)',
      "--layout-surface-overlay": 'rgba(15, 23, 42, 0.65)',
      "--layout-panel-blur": '20px',
      "--layout-hero-gradient": 'linear-gradient(140deg, rgba(30,41,59,0.94) 0%, rgba(76,29,149,0.88) 45%, rgba(34,211,238,0.78) 100%)',
      "--layout-hero-glow": '0 62px 145px rgba(124, 58, 237, 0.5)',
      "--layout-container-max": '1280px',
      "--layout-section-gap": '4rem',
      "--layout-navbar-background": 'rgba(15, 23, 42, 0.78)',
      "--layout-navbar-shadow": '0 38px 100px rgba(76, 29, 149, 0.45)',
      "--layout-divider-glow": 'linear-gradient(90deg, rgba(124,58,237,0) 0%, rgba(124,58,237,0.5) 45%, rgba(34,211,238,0) 100%)',
      "--layout-list-stripe": 'linear-gradient(90deg, rgba(76, 29, 149, 0.32) 0%, rgba(30, 41, 59, 0.42) 100%)',
      "--layout-focus-ring": '0 0 0 4px rgba(34, 211, 238, 0.45)',
      "--layout-badge-glow": '0 0 0 4px rgba(124, 58, 237, 0.48)'
    })
  },
  {
    id: 'themefisher-nexus',
    name: 'Themefisher Nexus',
    tagline: 'Landing page vibrante lista para SaaS',
    description: 'Inspirada en las plantillas insignia de Themefisher con hero contundente, call-to-actions múltiples y badges estilizados.',
    category: 'Landing Page',
    price: '$178',
    features: [
      'Hero en varias columnas con spotlight degradado',
      'Secciones de pricing con tarjetas flotantes',
      'Grillas de logotipos con blur y estados hover'
    ],
    fonts: {
      heading: 'Poppins',
      body: 'Manrope',
      ui: 'Space Grotesk',
    },
    iconography: ['Lucide Startup', 'Heroicons Marketing', 'Lineicons SaaS'],
    buttonStyles: ['CTA Dual Tone', 'Outline Badge', 'Icon Ghost CTA', 'Shimmer Primary'],
    palette: {
      primary: '#2563EB',
      secondary: '#1D4ED8',
      accent: '#F59E0B',
      neutral: '#E2E8F0',
      background: '#F1F5F9'
    },
    preview: {
      gradient: 'linear-gradient(135deg, rgba(37, 99, 235, 0.85) 0%, rgba(29, 78, 216, 0.82) 45%, rgba(245, 158, 11, 0.68) 100%)',
      spotlight: 'radial-gradient(circle at 28% 18%, rgba(59, 130, 246, 0.42), transparent 60%)',
      accentShape: 'radial-gradient(circle at 82% 30%, rgba(245, 158, 11, 0.35), transparent 65%)'
    },
    variables: withVariables({
      "--layout-card-radius": '24px',
      "--layout-card-shadow": '0 40px 110px rgba(37, 99, 235, 0.32)',
      "--layout-card-border": 'rgba(37, 99, 235, 0.2)',
      "--layout-card-surface": 'linear-gradient(150deg, rgba(255,255,255,0.96) 0%, rgba(226, 232, 240, 0.9) 100%)',
      "--layout-button-radius": '999px',
      "--layout-button-shadow": '0 30px 70px rgba(37, 99, 235, 0.35)',
      "--layout-font-heading": 'var(--font-poppins)',
      "--layout-font-body": 'var(--font-manrope)',
      "--layout-font-ui": 'var(--font-space-grotesk)',
      "--layout-surface-gradient": 'radial-gradient(circle at 22% -8%, rgba(37, 99, 235, 0.4), transparent 58%), radial-gradient(circle at 78% -6%, rgba(245, 158, 11, 0.32), transparent 62%)',
      "--layout-surface-overlay": 'rgba(37, 99, 235, 0.18)',
      "--layout-panel-blur": '24px',
      "--layout-hero-gradient": 'linear-gradient(135deg, rgba(37,99,235,0.92) 0%, rgba(29,78,216,0.88) 45%, rgba(245,158,11,0.78) 100%)',
      "--layout-hero-glow": '0 55px 130px rgba(37, 99, 235, 0.45)',
      "--layout-container-max": '1320px',
      "--layout-section-gap": '4.4rem',
      "--layout-navbar-background": 'rgba(255,255,255,0.78)',
      "--layout-navbar-shadow": '0 32px 90px rgba(37, 99, 235, 0.25)',
      "--layout-divider-glow": 'linear-gradient(90deg, rgba(37,99,235,0) 0%, rgba(59,130,246,0.5) 45%, rgba(245,158,11,0) 100%)',
      "--layout-list-stripe": 'linear-gradient(90deg, rgba(37, 99, 235, 0.18) 0%, rgba(29, 78, 216, 0.28) 100%)',
      "--layout-focus-ring": '0 0 0 4px rgba(59, 130, 246, 0.45)',
      "--layout-badge-glow": '0 0 0 4px rgba(245, 158, 11, 0.45)'
    })
  },
  {
    id: 'nextjstemplates-lumina',
    name: 'NextJSTemplates Lumina',
    tagline: 'Estudio creativo con efectos aurora y layouts fluidos',
    description:
      'Derivada de los kits creativos de NextJSTemplates con héroes apilados, métricas diagonales y cards translucidas para estudios digitales.',
    category: 'Creativo',
    price: '$192',
    features: [
      'Hero en capas con efectos aurora y gradientes animados',
      'Secciones de portafolio con tarjetas diagonales y blur',
      'Botones con indicadores de estado y soporte para iconos dobles'
    ],
    fonts: {
      heading: 'Plus Jakarta Sans',
      body: 'DM Sans',
      ui: 'Sora',
    },
    iconography: ['Lucide Creative', 'Heroicons Studio', 'Iconoir Gradient'],
    buttonStyles: ['Aurora Primary', 'Ghost Gradient', 'Icon Duo CTA', 'Diagonal Badge Button'],
    palette: {
      primary: '#6366F1',
      secondary: '#0EA5E9',
      accent: '#F472B6',
      neutral: '#F8FAFC',
      background: '#0F172A'
    },
    preview: {
      gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.88) 0%, rgba(14, 165, 233, 0.82) 50%, rgba(244, 114, 182, 0.75) 100%)',
      spotlight: 'radial-gradient(circle at 22% 18%, rgba(14, 165, 233, 0.45), transparent 58%)',
      accentShape: 'radial-gradient(circle at 80% 28%, rgba(244, 114, 182, 0.35), transparent 60%)'
    },
    variables: withVariables({
      "--layout-card-radius": '28px',
      "--layout-card-shadow": '0 48px 135px rgba(99, 102, 241, 0.32)',
      "--layout-card-border": 'rgba(14, 165, 233, 0.38)',
      "--layout-card-surface": 'linear-gradient(150deg, rgba(14, 165, 233, 0.22) 0%, rgba(99, 102, 241, 0.26) 100%)',
      "--layout-button-radius": '999px',
      "--layout-button-shadow": '0 42px 110px rgba(99, 102, 241, 0.38)',
      "--layout-font-heading": 'var(--font-plus-jakarta)',
      "--layout-font-body": 'var(--font-dm-sans)',
      "--layout-font-ui": 'var(--font-sora)',
      "--layout-surface-gradient": 'radial-gradient(circle at 18% -6%, rgba(14, 165, 233, 0.42), transparent 55%), radial-gradient(circle at 82% -8%, rgba(244, 114, 182, 0.35), transparent 58%)',
      "--layout-surface-overlay": 'rgba(15, 23, 42, 0.42)',
      "--layout-panel-blur": '26px',
      "--layout-hero-gradient": 'linear-gradient(135deg, rgba(15,23,42,0.9) 0%, rgba(14,165,233,0.85) 40%, rgba(244,114,182,0.78) 100%)',
      "--layout-hero-glow": '0 68px 150px rgba(99, 102, 241, 0.5)',
      "--layout-container-max": '1340px',
      "--layout-section-gap": '4.6rem',
      "--layout-navbar-background": 'rgba(15, 23, 42, 0.72)',
      "--layout-navbar-shadow": '0 38px 105px rgba(14, 165, 233, 0.35)',
      "--layout-divider-glow": 'linear-gradient(90deg, rgba(14,165,233,0) 0%, rgba(99,102,241,0.55) 45%, rgba(244,114,182,0) 100%)',
      "--layout-list-stripe": 'linear-gradient(90deg, rgba(99, 102, 241, 0.28) 0%, rgba(14, 165, 233, 0.38) 100%)',
      "--layout-focus-ring": '0 0 0 4px rgba(99, 102, 241, 0.48)',
      "--layout-badge-glow": '0 0 0 4px rgba(244, 114, 182, 0.42)'
    })
  },
  {
    id: 'themefisher-venture',
    name: 'Themefisher Venture',
    tagline: 'Landing B2B dinámica con secciones de conversión',
    description:
      'Inspirada en los themes corporativos de Themefisher: hero escalonado, secciones de casos de éxito y pricing con badges resaltados.',
    category: 'Corporativo',
    price: '$186',
    features: [
      'Hero escalonado con spotlight lateral y mockups flotantes',
      'Sección de métricas con tarjetas en columnas y contadores',
      'Tablas de precios con badges animados y CTA múltiples'
    ],
    fonts: {
      heading: 'Montserrat',
      body: 'Poppins',
      ui: 'Inter',
    },
    iconography: ['Lucide Corporate', 'Heroicons Business', 'LineAwesome Solid'],
    buttonStyles: ['Venture Primary', 'Outline Accent', 'CTA con Icono', 'Badge Ghost CTA'],
    palette: {
      primary: '#1D4ED8',
      secondary: '#1E293B',
      accent: '#F97316',
      neutral: '#E2E8F0',
      background: '#F8FAFC'
    },
    preview: {
      gradient: 'linear-gradient(140deg, rgba(29, 78, 216, 0.88) 0%, rgba(30, 41, 59, 0.82) 45%, rgba(249, 115, 22, 0.68) 100%)',
      spotlight: 'radial-gradient(circle at 26% 20%, rgba(29, 78, 216, 0.42), transparent 60%)',
      accentShape: 'radial-gradient(circle at 80% 30%, rgba(249, 115, 22, 0.32), transparent 65%)'
    },
    variables: withVariables({
      "--layout-card-radius": '24px',
      "--layout-card-shadow": '0 40px 110px rgba(29, 78, 216, 0.3)',
      "--layout-card-border": 'rgba(29, 78, 216, 0.28)',
      "--layout-card-surface": 'linear-gradient(145deg, rgba(255,255,255,0.96) 0%, rgba(226, 232, 240, 0.92) 100%)',
      "--layout-button-radius": '20px',
      "--layout-button-shadow": '0 34px 90px rgba(29, 78, 216, 0.32)',
      "--layout-font-heading": 'var(--font-montserrat)',
      "--layout-font-body": 'var(--font-poppins)',
      "--layout-font-ui": 'var(--font-inter)',
      "--layout-surface-gradient": 'radial-gradient(circle at 18% -8%, rgba(29, 78, 216, 0.4), transparent 58%), radial-gradient(circle at 82% -6%, rgba(249, 115, 22, 0.32), transparent 62%)',
      "--layout-surface-overlay": 'rgba(29, 78, 216, 0.18)',
      "--layout-panel-blur": '22px',
      "--layout-hero-gradient": 'linear-gradient(135deg, rgba(29,78,216,0.92) 0%, rgba(30,41,59,0.88) 48%, rgba(249,115,22,0.75) 100%)',
      "--layout-hero-glow": '0 60px 140px rgba(29, 78, 216, 0.42)',
      "--layout-container-max": '1300px',
      "--layout-section-gap": '4.2rem',
      "--layout-navbar-background": 'rgba(255,255,255,0.8)',
      "--layout-navbar-shadow": '0 30px 85px rgba(29, 78, 216, 0.25)',
      "--layout-divider-glow": 'linear-gradient(90deg, rgba(29,78,216,0) 0%, rgba(59,130,246,0.55) 45%, rgba(249,115,22,0) 100%)',
      "--layout-list-stripe": 'linear-gradient(90deg, rgba(30, 64, 175, 0.2) 0%, rgba(148, 163, 184, 0.3) 100%)',
      "--layout-focus-ring": '0 0 0 4px rgba(29, 78, 216, 0.45)',
      "--layout-badge-glow": '0 0 0 4px rgba(249, 115, 22, 0.4)'
    })
  },
];


const defaultSelection: TemplateSelection = { type: 'preset', id: templates[0]?.id ?? 'executive-elegance' };

const parseSelection = (value: string | null | undefined): TemplateSelection => {
  if (!value) {
    return defaultSelection;
  }

  const [type, id] = value.split(':');
  if ((type === 'preset' || type === 'custom') && id) {
    return { type, id } as TemplateSelection;
  }

  return defaultSelection;
};

const formatSelection = (selection: TemplateSelection): string => `${selection.type}:${selection.id}`;

export const getDefaultTemplate = (): TemplateDefinition => templates[0];

export const getActiveTemplateSelection = (): TemplateSelection => {
  if (typeof window === 'undefined') {
    return defaultSelection;
  }

  try {
    const stored = window.localStorage.getItem(TEMPLATE_STORAGE_KEY);
    return parseSelection(stored);
  } catch (error) {
    console.warn('Error reading active template:', error);
    return defaultSelection;
  }
};

export const setActiveTemplateSelection = (selection: TemplateSelection): void => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(TEMPLATE_STORAGE_KEY, formatSelection(selection));
    window.dispatchEvent(new CustomEvent(TEMPLATE_EVENT_NAME));
  } catch (error) {
    console.warn('Error persisting active template:', error);
  }
};

export const applyTemplateToDocument = (template: TemplateLike): void => {
  if (typeof document === 'undefined') {
    return;
  }

  const root = document.documentElement;
  const body = document.body;

  Object.entries(defaultTemplateVariables).forEach(([key]) => {
    root.style.setProperty(key, defaultTemplateVariables[key as keyof TemplateVariables]);
  });

  Object.entries(template.variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  body.dataset.template = template.id;
  body.dataset.templateType = template.isCustom ? 'custom' : 'preset';
};

export const getTemplateById = (id: string): TemplateDefinition | undefined => templates.find((template) => template.id === id);

export const toTemplateLike = (template: TemplateDefinition): TemplateLike => ({
  id: template.id,
  name: template.name,
  variables: template.variables,
});
