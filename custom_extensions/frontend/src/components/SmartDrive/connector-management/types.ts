// Types for connector management - simplified for our custom interface
export enum ConnectorCredentialPairStatus {
  SCHEDULED = "SCHEDULED",
  INITIAL_INDEXING = "INITIAL_INDEXING",
  ACTIVE = "ACTIVE",
  PAUSED = "PAUSED",
  DELETING = "DELETING",
  INVALID = "INVALID",
}

export enum AccessType {
  PUBLIC = "public",
  PRIVATE = "private",
  SYNC = "sync",
}

export interface Connector {
  id: number;
  name: string;
  source: string;
  input_type: string;
  connector_specific_config: any;
  refresh_freq: number;
  prune_freq: number;
  indexing_start: string | null;
}

export interface Credential {
  id: number;
  name: string;
  source: string;
  credential_json: any;
  admin_public: boolean;
  curator_public: boolean;
  groups: string[] | null;
}

export interface CCPairFullInfo {
  id: number;
  name: string;
  status: ConnectorCredentialPairStatus;
  in_repeated_error_state: boolean;
  num_docs_indexed: number;
  connector: Connector;
  credential: Credential;
  number_of_index_attempts: number;
  last_index_attempt_status: string | null;
  latest_deletion_attempt: any | null;
  access_type: AccessType;
  is_editable_for_current_user: boolean;
  deletion_failure_message: string | null;
  indexing: boolean;
  creator: string | null;
  creator_email: string | null;

  last_indexed: string | null;
  last_pruned: string | null;
  last_full_permission_sync: string | null;
  overall_indexing_speed: number | null;
  latest_checkpoint_description: string | null;
}

/**
 * Returns true if the status is not currently active (i.e. paused or invalid), but not deleting
 */
export function statusIsNotCurrentlyActive(
  status: ConnectorCredentialPairStatus
): boolean {
  return (
    status === ConnectorCredentialPairStatus.PAUSED ||
    status === ConnectorCredentialPairStatus.INVALID
  );
}

export interface IndexAttemptError {
  id: number;
  connector_credential_pair_id: number;
  document_id: string | null;
  document_link: string | null;
  entity_id: string | null;
  failed_time_range_start: string | null;
  failed_time_range_end: string | null;
  failure_message: string;
  is_resolved: boolean;
  time_created: string;
  index_attempt_id: number;
} 