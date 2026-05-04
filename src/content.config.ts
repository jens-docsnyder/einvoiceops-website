import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const changelogs = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/changelogs' }),
  schema: z.object({
    country_code: z.string().length(2),
    entries: z.array(z.object({
      timestamp: z.coerce.date(),
      type: z.enum(['initial-publish', 'error-correction', 'mandate-change', 'confidence-upgrade', 'content-update']),
      field: z.string().nullish(),
      old_value: z.string().nullish(),
      new_value: z.string().nullish(),
      description: z.string(),
      source_url: z.string().url().nullish(),
      mandate_version_before: z.number().int().nullish(),
      mandate_version_after: z.number().int().nullish(),
    })),
  }),
});

const research = defineCollection({
  loader: glob({ pattern: '**/*.yaml', base: './src/content/research' }),
  schema: z.object({
    country_code: z.string().length(2),
    items: z.array(z.object({
      priority: z.enum(['high', 'amber']),
      type: z.enum(['source-verification', 'protocol-action', 'content-review', 'pending-amendment']),
      description: z.string(),
      source_url: z.string().url().nullish(),
      added: z.coerce.date(),
    })),
  }),
});

const countries = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/countries' }),
  schema: z.object({
    country: z.string(),
    code: z.string().length(2),
    flag: z.string(),

    mandate_type: z.string(),
    vida_alignment: z.string(),
    future_direction: z.string().nullish(),

    b2b: z.enum(['mandatory', 'voluntary', 'not-yet', 'none', 'announced']),
    b2g: z.enum(['mandatory', 'voluntary', 'not-yet', 'none', 'announced']),
    b2c_scope: z.string(),
    status: z.string(),
    phase_in: z.boolean(),
    phase_in_scope: z.string().nullish(),

    key_deadlines: z.array(z.object({
      date: z.coerce.date(),
      description: z.string(),
    })),

    formats: z.array(z.string()),
    cius: z.string().nullish(),
    platform: z.string(),
    platform_model: z.string(),
    transport_protocol: z.string(),
    b2g_signature: z.enum(['XAdES', 'PAdES', 'CAdES', 'optional', 'none']),
    b2b_signature: z.enum(['XAdES', 'PAdES', 'CAdES', 'optional', 'none']),

    inbound_mandate_date: z.coerce.date().nullish(),
    outbound_mandate_date: z.coerce.date().nullish(),
    outbound_mandate_date_phase2: z.coerce.date().nullish(),
    mandate_hardness: z.string().nullish(),

    master_data_id: z.string(),
    mandatory_pdf_bundle: z.string(),
    foreign_resident_scope: z.boolean(),
    archiving_years: z.number().int(),
    penalty_max: z.string().nullish(),
    reporting_window: z.union([z.number().int(), z.string()]).nullish(),
    correction_mechanism: z.enum(['correction_invoice', 'credit_note', 'zeroing', 'anulacion']),

    document_lifecycle_states: z.array(z.string()),

    has_sandbox: z.boolean(),
    last_verified: z.coerce.date().nullish(),
    mandate_version: z.number().int(),
    confidence_summary: z.enum(['green', 'amber', 'red']),
    unresolved_high: z.number().int().nullish(),
    unresolved_amber: z.number().int().nullish(),
  }),
});

export const collections = { countries, research, changelogs };
