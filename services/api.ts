/**
 * Customer portal API client (existing backend).
 * Kept separate from the Worker/Service API — see services/workerApi.ts and services/serviceApi.ts.
 */
export { default as api, getApiErrorMessage } from "@/lib/axios";
