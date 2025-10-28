-- Standard V-Öffnungen
insert into public.tools (tool_type, value) values
  ('v_opening', 'V50'),
  ('v_opening', 'V80')
on conflict (tool_type, value) do nothing;

-- Standard Radien
insert into public.tools (tool_type, value) values
  ('radius', 'R1.5'),
  ('radius', 'R5'),
  ('radius', 'R10')
on conflict (tool_type, value) do nothing;

-- Standard Materialien
insert into public.tools (tool_type, value) values
  ('material', 'Stahl'),
  ('material', 'Edelstahl'),
  ('material', 'Aluminium'),
  ('material', 'Kupfer')
on conflict (tool_type, value) do nothing;
