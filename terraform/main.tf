terraform {
  required_providers {
    cloudflare = {
      source = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_api_token
}

# Recursos da Cloudflare (Pages, D1) serão adicionados aqui.

resource "cloudflare_d1_database" "main" {
  account_id = var.cloudflare_account_id
  name       = "${var.project_name}-db"
}

resource "cloudflare_pages_project" "main" {
  account_id        = var.cloudflare_account_id
  name              = var.project_name
  production_branch = "main" # ou a branch que você usa para produção

  source {
    type = "github"
    config {
      owner             = split("/", var.github_repo)[0]
      repo_name         = split("/", var.github_repo)[1]
      production_branch = "main"
      pr_comments_enabled = true
    }
  }

  build_config {
    build_command   = "yarn build"
    destination_dir = "dist"
  }

  deployment_configs {
    production {
      d1_databases = {
        DB = cloudflare_d1_database.main.id
      }
    }
    preview {
      d1_databases = {
        DB = cloudflare_d1_database.main.id
      }
    }
  }
}
