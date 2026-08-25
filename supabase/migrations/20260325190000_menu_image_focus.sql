alter table menu_items
  add column if not exists image_focus_x double precision default 50,
  add column if not exists image_focus_y double precision default 50;
