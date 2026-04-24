-- Fase 4.5 — Theming per-store
-- Cada loja pode escolher sua cor primária e secundária; defaults = Nymbus.
-- Formato: hex em texto ("#6344BC"), validado por CHECK.

alter table public.store_settings
  add column if not exists theme_primary_color text not null default '#6344BC',
  add column if not exists theme_secondary_color text not null default '#73D2E6';

-- Valida formato hex #RRGGBB (case-insensitive). Defaults já passam.
alter table public.store_settings
  add constraint store_settings_theme_primary_format
    check (theme_primary_color ~* '^#[0-9a-f]{6}$');
alter table public.store_settings
  add constraint store_settings_theme_secondary_format
    check (theme_secondary_color ~* '^#[0-9a-f]{6}$');

comment on column public.store_settings.theme_primary_color is
  'Cor primária da loja em hex. Aplicada em botões, ícones ativos e elementos principais no admin e na vitrine.';
comment on column public.store_settings.theme_secondary_color is
  'Cor secundária da loja em hex. Aplicada em hovers, seleções e elementos secundários.';
