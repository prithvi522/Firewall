SaaS / Docker deployment
-------------------------

This project already includes a `docker-compose.yml` at the repository root that runs the backend and frontend locally.

To run the stack:

```bash
docker-compose up --build
```

For production, containerize with image registries and add TLS, authentication, and storage.
