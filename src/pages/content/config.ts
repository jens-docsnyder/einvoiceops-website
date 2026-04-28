import { defineCollection, z } from 'astro:content';                                    
   
  const mandateTypeEnum = z.enum([                                                        
    'centralized-clearance',                                
    'decentralized-clearance',                                                            
    'real-time-reporting',                                                                
    'interoperability',
    'post-audit'                                                                          
  ]);                                                                                     
   
  const lifecycleStateEnum = z.enum([                                                     
    'SENT', 'ACCEPTED', 'REJECTED', 'REJECTED_BY_BUYER'     
  ]);                                                                                     
   
  const countries = defineCollection({                                                    
    type: 'content',                                        
    schema: z.object({
      country: z.string(),                                                                
      code: z.string().length(2),
      flag: z.string(),                                                                   
                                                            
      mandate_type: mandateTypeEnum,                                                      
      vida_alignment: z.enum(['DRR-compliant', 'legacy-clearance', 'none']),
      future_direction: z.string().nullish(),                                             
                                                                                          
      b2b: z.enum(['mandatory', 'voluntary', 'not-yet', 'none']),                         
      b2g: z.enum(['mandatory', 'voluntary', 'not-yet', 'none']),                         
      b2c_scope: z.enum(['in_scope', 'separate_summary', 'none']),                        
      status: z.enum(['live', 'announced', 'proposed', 'none']),                          
      phase_in: z.boolean(),                                                              
      phase_in_scope: z.enum(['large_taxpayers', 'all', 'pending_micro', 'none']),        
                                                                                          
      key_deadlines: z.array(z.object({                                                   
        date: z.coerce.date(),                                                            
        description: z.string(),                            
      })),
                                                                                          
      formats: z.array(z.string()),
      cius: z.string().nullish(),                                                         
      platform: z.string(),                                                               
      platform_model: z.enum(['centralized', 'Y-Model', 'none']),
      transport_protocol: z.enum(['AS2', 'AS4', 'Peppol-BIS-3.0', 'API-OAuth2', 'SFTP',   
  'none']),                                                                               
      b2g_signature: z.enum(['XAdES', 'PAdES', 'CAdES', 'optional', 'none']),             
      b2b_signature: z.enum(['XAdES', 'PAdES', 'CAdES', 'optional', 'none']),             
                                                            
      master_data_id: z.string(),                                                         
      mandatory_pdf_bundle: z.enum(['ZUGFeRD', 'Factur-X', 'none']),
      foreign_resident_scope: z.boolean(),                                                
      archiving_years: z.number().int(),                                                  
      penalty_max: z.string().nullish(),                                                  
      reporting_window: z.number().int().nullish(),                                       
      correction_mechanism: z.enum(['correction_invoice', 'credit_note', 'zeroing']),
                                                                                          
      document_lifecycle_states: z.array(lifecycleStateEnum),                             
                                                                                          
      has_sandbox: z.boolean(),                                                           
      last_verified: z.coerce.date(),                       
    }),                                                                                   
  });
                                                                                          
  export const collections = { countries };        