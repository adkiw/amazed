from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database_url: str = "postgresql+psycopg2://postgres:postgres@db:5432/proofdb"
    secret_key: str = "change-me"
    uploads_dir: str = "/app/uploads"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
