variable "cloudflare_api_token" {
  description = "The Cloudflare API token."
  type        = string
  sensitive   = true
}

variable "cloudflare_account_id" {
  description = "The Cloudflare account ID."
  type        = string
}

variable "project_name" {
  description = "The name of the project."
  type        = string
  default     = "compliance-iegm-dashboard"
}

variable "github_repo" {
  description = "The GitHub repository name in the format <owner>/<repo>."
  type        = string
}
