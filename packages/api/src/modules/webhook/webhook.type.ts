export type ElevenLabsWebhookBody = {
  type: "post_call_transcription";
  event_timestamp: number;
  data: {
    agent_id: string;
    agent_name: string;
    status: string;
    user_id: string;
    branch_id: string;
    version_id: string;
    metadata: {
      start_time_unix_secs: number;
      accepted_time_unix_secs: number;
      call_duration_secs: number;
      cost: number;
      deletion_settings: {
        deletion_time_unix_secs: number | null;
        deleted_logs_at_time_unix_secs: number | null;
        deleted_audio_at_time_unix_secs: number | null;
        deleted_transcript_at_time_unix_secs: number | null;
        delete_transcript_and_pii: boolean;
        delete_audio: boolean;
      };
      feedback: {
        type: string | null;
        overall_score: number | null;
        likes: number;
        dislikes: number;
        rating: number | null;
        comment: string | null;
      };
      authorization_method: string;
      charging: {
        dev_discount: boolean;
        is_burst: boolean;
        tier: string;
        llm_usage: {
          irreversible_generation: {
            model_usage: {
              [model: string]: {
                input: {
                  tokens: number;
                  price: number;
                };
                input_cache_read: {
                  tokens: number;
                  price: number;
                };
                input_cache_write: {
                  tokens: number;
                  price: number;
                };
                output_total: {
                  tokens: number;
                  price: number;
                };
              };
            };
          };
          initiated_generation: {
            model_usage: {
              [model: string]: {
                input: {
                  tokens: number;
                  price: number;
                };
                input_cache_read: {
                  tokens: number;
                  price: number;
                };
                input_cache_write: {
                  tokens: number;
                  price: number;
                };
                output_total: {
                  tokens: number;
                  price: number;
                };
              };
            };
          };
        };
        llm_price: number;
        llm_charge: number;
        call_charge: number;
        free_minutes_consumed: number;
        free_llm_dollars_consumed: number;
      };
      phone_call: unknown | null;
      batch_call: unknown | null;
      termination_reason: string;
      error: unknown | null;
      warnings: any[];
      main_language: string;
      rag_usage: unknown | null;
      text_only: boolean;
      features_usage: {
        language_detection: { enabled: boolean; used: boolean };
        transfer_to_agent: { enabled: boolean; used: boolean };
        transfer_to_number: { enabled: boolean; used: boolean };
        multivoice: { enabled: boolean; used: boolean };
        dtmf_tones: { enabled: boolean; used: boolean };
        external_mcp_servers: { enabled: boolean; used: boolean };
        pii_zrm_workspace: boolean;
        pii_zrm_agent: boolean;
        tool_dynamic_variable_updates: { enabled: boolean; used: boolean };
        is_livekit: boolean;
        voicemail_detection: { enabled: boolean; used: boolean };
        workflow: {
          enabled: boolean;
          tool_node: { enabled: boolean; used: boolean };
          standalone_agent_node: { enabled: boolean; used: boolean };
          phone_number_node: { enabled: boolean; used: boolean };
          end_node: { enabled: boolean; used: boolean };
        };
        agent_testing: {
          enabled: boolean;
          tests_ran_after_last_modification: boolean;
          tests_ran_in_last_7_days: boolean;
        };
        versioning: { enabled: boolean; used: boolean };
      };
      eleven_assistant: {
        is_eleven_assistant: boolean;
      };
      initiator_id: string;
      conversation_initiation_source: string;
      conversation_initiation_source_version: string;
      timezone: string;
      async_metadata: unknown | null;
      whatsapp: unknown | null;
      agent_created_from: string;
      agent_last_updated_from: string;
    };
    analysis: {
      evaluation_criteria_results: Record<string, any>;
      data_collection_results: {
        [key: string]: {
          data_collection_id: string;
          value: any;
          json_schema: {
            type: string;
            description: string;
            enum: string[] | null;
            is_system_provided: boolean;
            dynamic_variable: string;
            constant_value: string;
          };
          rationale: string;
        };
      };
      evaluation_criteria_results_list: any[];
      data_collection_results_list: Array<{
        data_collection_id: string;
        value: any;
        json_schema: {
          type: string;
          description: string;
          enum: string[] | null;
          is_system_provided: boolean;
          dynamic_variable: string;
          constant_value: string;
        };
        rationale: string;
      }>;
      call_successful: string;
      transcript_summary: string;
      call_summary_title: string;
    };
    conversation_initiation_client_data: {
      conversation_config_override: {
        turn: any | null;
        tts: {
          voice_id: string | null;
          stability: number | null;
          speed: number | null;
          similarity_boost: number | null;
        };
        conversation: {
          text_only: boolean;
        };
        agent: {
          first_message: string | null;
          language: string;
          prompt: string | null;
        };
      };
      custom_llm_extra_body: Record<string, any>;
      user_id: string;
      source_info: {
        source: string;
        version: string;
      };
      dynamic_variables: {
        [key: string]: string | number | null;
      };
    };
    hiding_reason: string | null;
    conversation_id: string;
    has_audio: boolean;
    has_user_audio: boolean;
    has_response_audio: boolean;
    transcript: Array<{
      role: string;
      agent_metadata: {
        agent_id: string;
        branch_id: string;
        workflow_node_id: string | null;
        version_id: string;
      } | null;
      message: string;
      multivoice_message: any | null;
      tool_calls: any[];
      tool_results: any[];
      feedback: any | null;
      llm_override: any | null;
      time_in_call_secs: number;
      conversation_turn_metrics: {
        metrics?: Record<
          string,
          {
            elapsed_time: number;
          }
        >;
        convai_asr_provider?: string | null;
        convai_tts_model?: string | null;
      } | null;
      rag_retrieval_info: any | null;
      llm_usage: {
        model_usage: {
          [model: string]: {
            input: {
              tokens: number;
              price: number;
            };
            input_cache_read: {
              tokens: number;
              price: number;
            };
            input_cache_write: {
              tokens: number;
              price: number;
            };
            output_total: {
              tokens: number;
              price: number;
            };
          };
        };
      } | null;
      interrupted: boolean;
      original_message: string | null;
      source_medium: string | null;
      file_input: any | null;
    }>;
  };
};
