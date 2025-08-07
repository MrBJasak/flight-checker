import { z } from 'zod';

export const aircraftFilterSchema = z.object({
  manufacturerName: z.string().optional(),
  model: z.string().optional(),
  typeCode: z.string().optional(),
  operator: z.string().optional(),
});

export const formSchema = z.object({
  email: z.string().min(1, 'Email jest wymagany').email('Podaj prawidłowy adres email'),
  radius: z.number().min(1, 'Promień musi być większy niż 0').max(100, 'Promień nie może być większy niż 100 km'),
  aircraftFilters: z.array(aircraftFilterSchema).optional().default([]),
});
